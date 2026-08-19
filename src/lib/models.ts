import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/* ---------------- User ---------------- */
const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    passwordHash: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    githubUsername: { type: String, trim: true, lowercase: true, index: true, sparse: true },
    githubTokenEnc: { type: String }, // AES-256-GCM encrypted PAT (optional)
    githubTokenHint: { type: String }, // last 4 chars for display
    githubTokenValidatedAt: { type: Date },
    defaultTheme: { type: String, default: "paper" },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);
export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };
export const User: Model<UserDoc> = (mongoose.models.User as Model<UserDoc>) || mongoose.model<UserDoc>("User", UserSchema);

/* ---------------- One-time tokens (email verify / password reset) ---------------- */
const TokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  kind: { type: String, enum: ["verify", "reset"], required: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});
export type TokenDoc = InferSchemaType<typeof TokenSchema>;
export const OneTimeToken: Model<TokenDoc> =
  (mongoose.models.OneTimeToken as Model<TokenDoc>) || mongoose.model<TokenDoc>("OneTimeToken", TokenSchema);

/* ---------------- GitHub data cache ---------------- */
const CacheSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});
export type CacheDoc = InferSchemaType<typeof CacheSchema>;
export const CacheEntry: Model<CacheDoc> =
  (mongoose.models.CacheEntry as Model<CacheDoc>) || mongoose.model<CacheDoc>("CacheEntry", CacheSchema);

/* ---------------- Rate limit buckets ---------------- */
const RateSchema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  resetAt: { type: Date, required: true, index: { expires: 0 } },
});
export type RateDoc = InferSchemaType<typeof RateSchema>;
export const RateBucket: Model<RateDoc> =
  (mongoose.models.RateBucket as Model<RateDoc>) || mongoose.model<RateDoc>("RateBucket", RateSchema);

/* ---------------- Card render stats (for usage numbers on the site) ---------------- */
/**
 * Aggregated per day rather than one document per render: the card endpoint is an <img>
 * src that GitHub's camo proxy hits constantly, so per-render inserts were unbounded
 * write load for a collection nothing reads row-by-row. No username and no IP is stored,
 * which is what the privacy page has always promised.
 */
const RenderStatSchema = new Schema({
  /** UTC day, YYYY-MM-DD */
  day: { type: String, required: true },
  type: { type: String, required: true },
  theme: { type: String, required: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});
RenderStatSchema.index({ day: 1, type: 1, theme: 1 }, { unique: true });
export type RenderStatDoc = InferSchemaType<typeof RenderStatSchema>;
export const RenderStat: Model<RenderStatDoc> =
  (mongoose.models.RenderStat as Model<RenderStatDoc>) || mongoose.model<RenderStatDoc>("RenderStat", RenderStatSchema);

/* ---------------- Saved cards (user's designs, editable later) ---------------- */
const SavedCardSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    type: { type: String, required: true },
    /** query-string params (without leading ?), e.g. "username=x&theme=paper&show=followers" */
    params: { type: String, required: true, maxlength: 4000 },
  },
  { timestamps: true },
);
export type SavedCardDoc = InferSchemaType<typeof SavedCardSchema> & { _id: mongoose.Types.ObjectId };
export const SavedCard: Model<SavedCardDoc> =
  (mongoose.models.SavedCard as Model<SavedCardDoc>) || mongoose.model<SavedCardDoc>("SavedCard", SavedCardSchema);
