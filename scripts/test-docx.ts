import { renderResumeDocx } from "../lib/docx";
import { writeFileSync } from "fs";

const fake = {
  headline: "Мертехин Михаил — Product Analyst",
  summary:
    "Студент ИТМО, продуктовый аналитик. Финалист Changellenge Cup IT 2026 с топ-5 из 244 команд. Сильные стороны — гипотезы, метрики, координация команды.",
  experience: [
    {
      title: "Аналитик, команда Eclipse",
      subtitle: "Changellenge Cup IT 2026 · ОТП Банк",
      date: "2026",
      bullets: [
        "Провёл предварительный опрос 47 человек и 10 глубинных интервью",
        "Сделал конкурентный анализ 4 банков (Альфа, Т-банк, Сбер, ВТБ)",
        "Сформулировал 10 продуктовых гипотез, 8 подтвердились",
      ],
    },
  ],
  projects: [
    {
      name: "Анализ рынка маркетплейсов",
      description: "Командный аналитический проект.",
      bullets: ["Анализ ассортимента и поставщиков", "Разбор логистических моделей"],
      stack: ["анализ данных", "research"],
    },
  ],
  skills: [
    { category: "Продуктовая аналитика", items: ["Amplitude", "Google Analytics", "SQL", "Python"] },
    { category: "Исследования", items: ["опросы", "глубинные интервью", "конкурентный анализ", "CJM"] },
  ],
  education: [
    {
      title: "ИТМО, Инноватика",
      subtitle: "Бакалавриат, ФТМИ",
      date: "2025—2029",
      bullets: ["Школу окончил с отличием"],
    },
  ],
  languages: [
    { name: "Русский", level: "Родной" },
    { name: "Английский", level: "B2" },
  ],
  contacts: [
    { label: "Email", value: "misamertehin@gmail.com" },
    { label: "Telegram", value: "@mixthisshit" },
    { label: "Телефон", value: "+7 965 222-63-52" },
  ],
};

(async () => {
  const buf = await renderResumeDocx(fake);
  const path = "/tmp/test-resume.docx";
  writeFileSync(path, buf);
  console.log(`✅ DOCX сгенерирован: ${path} (${buf.length} байт)`);
})();
