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

/* ---------------- Card render log (for stats on the site) ---------------- */
const RenderSchema = new Schema(
  {
    username: { type: String, index: true },
    type: { type: String },
    theme: { type: String },
    ip: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
RenderSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });
export type RenderDoc = InferSchemaType<typeof RenderSchema>;
export const RenderLog: Model<RenderDoc> =
  (mongoose.models.RenderLog as Model<RenderDoc>) || mongoose.model<RenderDoc>("RenderLog", RenderSchema);

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
