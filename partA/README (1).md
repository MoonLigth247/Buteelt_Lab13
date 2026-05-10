# Personal Task Tracker — README (Draft)

## Зорилго
Хэрэглэгч өдөр тутмын ажлаа удирдах боломжтой вэб программ.

## Технологи
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- LocalStorage (→ Supabase шилжих төлөвлөгөөтэй)

## Суулгах

```bash
git clone https://github.com/[username]/bie-daalt-13
cd bie-daalt-13/partB
npm install
```

## Ажиллуулах

```bash
npm run dev
# http://localhost:3000
```

## Тест

```bash
npm test
```

## Боломжууд

- Task CRUD
- Priority (Өндөр/Дунд/Бага)
- Label/Tag
- Хайлт, шүүлтүүр
- LocalStorage persistence

## Бүтэц

```
partB/src/
├── app/
│   ├── page-v1.tsx   # Анхны хувилбар
│   └── page-v2.tsx   # Сайжруулсан хувилбар
└── tests/
    └── tasks.test.ts
```
