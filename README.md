# Личный портфолио + генератор резюме

Сайт-портфолио Михаила Мертехина и инструмент для сборки резюме под конкретную вакансию через Claude API.

## Что внутри

- **Публичный сайт** (`/`) — лендинг с кейсами, проектами, навыками. Эту ссылку прикладываешь к резюме при отклике.
- **Генератор резюме** (`/generate`) — вставляешь описание вакансии, на выходе DOCX-файл, собранный из твоего профиля.
- **База** — `data/seed.json`. Все данные о тебе. Расширяешь напрямую — сайт автоматически обновляется при пересборке.

## Локальный запуск

```bash
npm install
cp .env.local.example .env.local   # вставь свой ANTHROPIC_API_KEY для генератора
npm run dev
```

Сайт: <http://localhost:3000> · Генератор: <http://localhost:3000/generate>

## Стек

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + Framer Motion + Lucide icons
- `@anthropic-ai/sdk` — Claude API (модель `claude-sonnet-4-5`)
- `docx` — рендер Word-документа
- `zod` — валидация схемы профиля

## Как редактировать данные

1. Открой `data/seed.json`.
2. Найди нужную секцию (`cases`, `projects`, `skills` и т.д.) и добавь/измени запись.
3. Каждая запись поддерживает поля:
   - `tags` — ключевые слова, по которым генератор подбирает блок под вакансию;
   - `relevance: { pm, analyst, dev }` — оценка релевантности роли от 1 до 5.
4. Прогони валидацию: `npx tsx scripts/validate-seed.ts` — упадёт, если что-то не по схеме.
5. Закоммитить → push → Vercel задеплоит автоматически.

Полная схема — в [lib/schema.ts](lib/schema.ts).

## Генератор резюме

`POST /api/generate-resume` принимает `{ jobDescription: string }`, грузит профиль из `data/seed.json`, отправляет в Claude вместе с системным промптом из [lib/anthropic.ts](lib/anthropic.ts), получает JSON-резюме и рендерит DOCX через [lib/docx.ts](lib/docx.ts).

### Получить API-ключ

1. Зайти на <https://console.anthropic.com/settings/keys>, создать ключ.
2. Положить в `.env.local`: `ANTHROPIC_API_KEY=sk-ant-...`.
3. Перезапустить dev-сервер.
4. На Vercel — добавить ту же переменную в Settings → Environment Variables.

Стоимость одной генерации — копейки (промпт кэшируется через `cache_control`).

## Деплой на Vercel

1. Создать GitHub-репозиторий, запушить код.
2. На <https://vercel.com/new> импортировать репо. Все настройки по умолчанию.
3. В Settings → Environment Variables добавить `ANTHROPIC_API_KEY`.
4. Каждый `git push` в `main` будет авто-деплоить.

## Структура

```
.
├── app/
│   ├── page.tsx               # публичный лендинг
│   ├── generate/page.tsx      # генератор резюме
│   ├── api/generate-resume/   # POST → DOCX
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── landing/               # секции лендинга
│   └── generate/              # форма генератора
├── data/
│   └── seed.json              # ВСЕ ДАННЫЕ — правишь здесь
├── lib/
│   ├── schema.ts              # zod-схема + типы
│   ├── profile.ts             # загрузчик профиля (потом → Supabase)
│   ├── anthropic.ts           # Claude API + промпт
│   └── docx.ts                # рендер Word-документа
└── scripts/
    ├── validate-seed.ts       # проверка seed против схемы
    └── test-docx.ts           # рендер тестового DOCX без вызова Claude
```

## Дальше (когда понадобится)

- **Веб-админка** — формы вместо ручного редактирования JSON. Подключить Supabase (Postgres + Auth), профиль хранить в JSONB-поле, страница `/admin` с формами по секциям.
- **Кастомный домен** — на Vercel в Settings → Domains.
- **Аналитика** — `npm i @vercel/analytics`, добавить компонент в `layout.tsx`.
