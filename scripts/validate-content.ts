/**
 * Прогоняет всё содержимое content/ через схемы.
 * Падает с ненулевым кодом, если что-то не так.
 *
 * Запуск:
 *   npx tsx scripts/validate-content.ts
 */
import { loadContent } from "../lib/content";

const bundle = loadContent();

const total =
  bundle.cases.length +
  bundle.projects.length +
  bundle.internships.length +
  bundle.hackathons.length;

console.log(`✅ content/ распарсен:`);
console.log(`   - кейсов: ${bundle.cases.length}`);
console.log(`   - проектов: ${bundle.projects.length}`);
console.log(`   - стажировок: ${bundle.internships.length}`);
console.log(`   - хакатонов: ${bundle.hackathons.length}`);

if (total === 0) {
  console.warn("⚠️  Пусто. Убедись, что папки заполнены или это намеренно.");
}
