export interface SavedCardDTO {
  id: string;
  name: string;
  type: string;
  params: string;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
}

export function serializeCard(c: { _id: unknown; name: string; type: string; params: string; createdAt?: Date | null; updatedAt?: Date | null }): SavedCardDTO {
  return { id: String(c._id), name: c.name, type: c.type, params: c.params, createdAt: c.createdAt ?? null, updatedAt: c.updatedAt ?? null };
}
