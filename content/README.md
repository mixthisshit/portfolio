# content/ — база проектов, кейсов, стажировок, хакатонов

Эта папка — источник правды для тяжёлого контента: всё, что имеет описание, перечень задач, стек и приложенные файлы. Сайт читает её при билде.

## Структура

```
content/
├── cases/         — кейс-чемпионаты (Changellenge и пр.)
├── projects/      — pet- и учебные проекты
├── internships/   — рабочий и стажировочный опыт
└── hackathons/    — хакатоны, олимпиады
```

Внутри каждой категории — папка на каждый элемент (slug = id):

```
cases/changellenge-otp-2026/
├── index.md           ← метаданные (frontmatter) + описание (тело)
├── what-i-did.md      ← что лично ты сделал (буллеты)
├── stack.md           ← инструменты, методы, фреймворки (буллеты)
└── files/             ← все вложения: PDF, картинки, презентации
    ├── cover.jpg
    └── ...
```

## Как добавить новый элемент

1. Скопируй существующую папку как образец (например, `cases/changellenge-otp-2026/`).
2. Переименуй в свой slug (латиница, дефисы, без пробелов).
3. Правь `index.md`, `what-i-did.md`, `stack.md`.
4. Файлы (скрины, PDF, превью) клади в `files/`.
5. Обязательные поля в frontmatter — смотри схему в `lib/schema.ts` (`ContentBase` + специфичные для типа: `CaseItem`, `ProjectItem`, `InternshipItem`, `HackathonItem`).
6. Прогони валидацию: `npx tsx scripts/validate-content.ts`
7. Коммит → push → Vercel задеплоит.

## Frontmatter — обязательные поля

Общие для всех типов:
- `id` — slug (можно опустить, тогда возьмётся из имени папки)
- `name` — отображаемое название
- `date` — `YYYY-MM` или `YYYY` (используется для сортировки)
- `tags` — массив ключевых слов (нужен генератору резюме)
- `relevance` — оценка релевантности ролям `{ pm, analyst, dev }` (0–5)
- `cover` — опционально, имя файла из `files/` для превью

Специфичные:
- **case**: `organizer`, `partner?`, `stage?`, `team?`, `role`, `result`, `problem?`, `metrics?`, `featured?`
- **project**: `category` (`product|frontend|analytics|research|academic`), `url?`, `repoUrl?`
- **internship**: `company`, `role`, `endDate?`, `current?`, `city?`
- **hackathon**: `organizer`, `team?`, `role`, `result`, `metrics?`

## Что НЕ хранится здесь

Личная инфа, контакты, скиллы, образование, языки, активности, награды — лежат в Supabase. Правишь через `/admin`.
