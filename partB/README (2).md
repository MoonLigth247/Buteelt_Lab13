# partB — Build

## Файлын бүтэц

```
partB/
├── src/
│   └── app/
│       ├── page-v1.tsx   ← V1: Энгийн анхны хувилбар
│       └── page-v2.tsx   ← V2: Сайжруулсан хувилбар (LocalStorage, stats, sort)
└── tests/
    └── tasks.test.ts     ← 10+ unit test
```

## V1 → V2 сайжруулалт

| Боломж | V1 | V2 |
|--------|----|----|
| LocalStorage | ❌ | ✅ |
| Progress bar | ❌ | ✅ |
| Sort (огноо/чиглэл) | ❌ | ✅ |
| Label filter | ❌ | ✅ |
| Delete confirm | ❌ | ✅ |
| ⌘K товчлол | ❌ | ✅ |
| Hover animation | ❌ | ✅ |
| Overdue дохио | ✅ | ✅ |
| Priority badge | ✅ | ✅ |
| Search | ✅ | ✅ (тайлбарт ч хайдаг) |

## Тест ажиллуулах

```bash
# Jest суулгах (эхний удаа)
npm install --save-dev jest @types/jest ts-jest

# Тест ажиллуулах
npm test

# Coverage харах
npm run test:coverage
```

## AI Session Log-ууд

`ai-sessions/` хавтаст 3+ session хадгалагдана:
- `01-v1-scaffold.md` — V1 scaffold
- `02-v2-localstorage.md` — LocalStorage hook
- `03-timezone-debug.md` — Timezone bug дибаг

## Commit Convention

```
feat(tasks): ...
fix(filter): ...
test(tasks): ...
Co-Authored-By: Claude <noreply@anthropic.com>
```
