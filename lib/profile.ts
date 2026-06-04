import seed from "@/data/seed.json";
import { ProfileSchema, type Profile } from "./schema";

let cached: Profile | null = null;

export function getProfile(): Profile {
  if (cached) return cached;
  cached = ProfileSchema.parse(seed);
  return cached;
}
