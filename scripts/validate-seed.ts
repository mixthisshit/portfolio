import { StoredProfileSchema } from "../lib/schema";
import seed from "../data/seed.json";

const result = StoredProfileSchema.safeParse(seed);

if (!result.success) {
  console.error("❌ seed.json не проходит StoredProfileSchema:");
  console.error(JSON.stringify(result.error.format(), null, 2));
  process.exit(1);
}

console.log("✅ seed.json валиден (StoredProfile — без cases/projects, они в content/)");
console.log(`   - технических навыков: ${result.data.skills.technical.length}`);
console.log(`   - soft skills: ${result.data.skills.soft.length}`);
console.log(`   - активностей: ${result.data.activities.length}`);
console.log(`   - курсов: ${result.data.courses.length}`);
