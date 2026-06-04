import { ProfileSchema } from "../lib/schema";
import seed from "../data/seed.json";

const result = ProfileSchema.safeParse(seed);

if (!result.success) {
  console.error("❌ seed.json не проходит валидацию:");
  console.error(JSON.stringify(result.error.format(), null, 2));
  process.exit(1);
}

console.log("✅ seed.json валиден");
console.log(`   - кейсов: ${result.data.cases.length}`);
console.log(`   - проектов: ${result.data.projects.length}`);
console.log(`   - технических навыков: ${result.data.skills.technical.length}`);
console.log(`   - активностей: ${result.data.activities.length}`);
