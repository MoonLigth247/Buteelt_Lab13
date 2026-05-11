# AI Usage Report — Lab 13

**Оюутан**: [Нэрээ бичнэ үү]  
**Огноо**: 2025-05-10  
**Үгийн тоо**: ~1600

---

## 1. Юуг AI хийсэн, юуг өөрөө хийсэн?

### А хэсэг (Plan)
**AI хийсэн:**
- Stack харьцуулалтын хүснэгтийн үндсэн бүтцийг санал болгосон
- Mermaid диаграмын синтаксийг зохиосон
- CLAUDE.md-ийн no-go zones жишээ өгсөн
- ADR-001-ийн формат болон агуулгыг тайлбарласан

**Өөрөө хийсэн:**
- Ямар stack сонгохоо шийдсэн (AI зөвхөн харьцуулалт хийсэн)
- PROJECT.md-ийн scope тодорхойлсон — юу хийх, юу хийхгүйг ялгаж гаргасан
- CLAUDE.md-д `npm audit` нэмсэн — AI энийг санал болгоогүй
- ADR-001-д "Үр дагавар" хэсгийн Supabase hallucination эрсдэлийг нэмсэн

### Б хэсэг (Build)

**AI хийсэн:**
- V1 кодын ерөнхий бүтцийг үүсгэсэн (TaskCard, TaskForm компонентүүд)
- Filter болон sort логикийн анхны хувилбар
- Unit test-ийн skeleton
- Slash command template-үүд

**Өөрөө хийсэн:**
- V2-д `useLocalStorage` hook-ийг шинэчилсэн — AI-ийн хувилбарт hydration алдаа байсан
- `isOverdue()` функцийн timezone-тай холбоотой алдааг зассан (доор дэлгэрэнгүй)
- TaskCard-ын hover state animation нэмсэн — AI энийг оруулаагүй
- Delete confirmation modal нэмсэн (UX сайжруулах)
- Test file-д Монгол тэмдэгтийн тест нэмсэн

### В хэсэг (Reflect)
**AI хийсэн:** Энэ тайланы ерөнхий бүтцийг тодорхойлоход туслав  
**Өөрөө хийсэн:** Агуулгыг бүгдийг өөрөө бичсэн — туршлагаасаа бодит жишээгээр

---

## 2. Hallucination-ийн 2+ жишээ

### Жишээ 1: Supabase Auth хуучин API

**Юу болсон:**  
Claude Code-д "Supabase-тай Next.js 14 Auth хийх" гэж хүсэхэд дараах кодыг санал болгосон:

```typescript
// AI санал болгосон (БУРУУ):
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function Page() {
  const supabase = createServerComponentClient({ cookies })
  // ...
}
```

**Яагаад буруу:**  
`@supabase/auth-helpers-nextjs` пакет deprecated болсон. Supabase-ийн 2024 оны
баримт бичигт `@supabase/ssr` пакетийг ашиглахыг заасан байдаг.

**Яаж олсон:**  
Supabase-ийн official docs-ийг https://supabase.com/docs/guides/auth/server-side/nextjs
хаягаас уншаад зөрүүг олсон.

**Яаж зассан:**
```typescript
// Зөв хувилбар:
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  )
}
```

**Сургамж:** AI-ийн санал болгосон пакетийн нэрийг заавал npm registry-д шалгах хэрэгтэй.

---

### Жишээ 2: isOverdue() Timezone алдаа

**Юу болсон:**  
AI-ийн санал болгосон `isOverdue()` анхны хувилбар:

```typescript
// AI санал болгосон (АЛДААТАЙ):
function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.completed) return false;
  return new Date(task.dueDate) < new Date();
}
```

**Яагаад буруу:**  
`new Date("2025-05-10")` нь UTC-д **2025-05-10 00:00:00 UTC** гэж тайлбарлагдана.
Монголын цагийн бүс UTC+8 тул 2025-05-10-ний өглөө 8:00 цагаас өмнө энэ task
"overdue" гэж харагдаж байсан — өнөөдрийн task-ийг хоцорсон гэж буруу тооцдог байв.

**Яаж олсон:**  
Тестийн үед өнөөдрийн огноотой task "хоцорсон" харагдаж байгааг анзаарсан.
DevTools-д `new Date("2025-05-10")` → `2025-05-09T16:00:00Z` (Монгол цагт) гэдгийг баталгаажуулсан.

**Яаж зассан:**
```typescript
// Зөв хувилбар:
function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.completed) return false;
  // new Date().toDateString() → "Fri May 10 2025" (local date)
  return new Date(task.dueDate) < new Date(new Date().toDateString());
}
```

**Сургамж:** Date/timezone bug нь ялангуяа хэрэглэгч өөр цагийн бүсэд байхад гарч ирнэ.
AI-ийн date логикийг заавар edge case-ээр шалгах хэрэгтэй.

---

## 3. Security/License-ийн анхаарал

### Security: LocalStorage-д sensitive өгөгдөл

**Юу болсон:**  
AI-ийн анхны хувилбарт бүх task өгөгдлийг LocalStorage-д хадгалдаг байсан.
Хэрэв Supabase Auth нэмэгдвэл хэрэглэгчийн нэвтрэх token LocalStorage-д хадгалагдах
эрсдэл байсан.

**Эрсдэл:**  
LocalStorage нь XSS халдлагад өртөмтгий — JavaScript-аар уншигдах боломжтой.
Supabase-ийн Auth token LocalStorage-д хадгалагдахгүй байх ёстой (httpOnly cookie ашиглах).

**Яаж зассан:**  
- Task өгөгдлийг LocalStorage-д хадгалах нь зөвшөөрөгдсөн (sensitive биш)
- Auth token-ийг Supabase-ийн `@supabase/ssr` дамжуулан httpOnly cookie-д хадгалах тохиргоо хийсэн
- CLAUDE.md-д "Supabase RLS унтраахгүй" no-go нэмсэн

**Сургамж:** AI нь security architecture-ийн сул талыг заавал анзаардаггүй.
Authentication хэрэгжүүлэхдээ OWASP guideline-ийг гараар шалгах хэрэгтэй.

---

## 4. Юуг AI-аар хурдан хийсэн?

**Хамгийн их цаг хэмнэсэн газрууд:**

1. **Mermaid диаграм** — Архитектурын 4 диаграм бичихэд ойролцоогоор 30 минут хэмнэсэн.
   Гараар бичвэл синтакс алдаа хийх магадлал өндөр байдаг.

2. **Boilerplate код** — TypeScript interface, React component бүтэц, styled object
   зэргийг хурдан үүсгэдэг. V1 кодын ~60% boilerplate байсан бөгөөд AI хийсэн.

3. **Test skeleton** — Unit test-ийн describe/test бүтцийг санал болгосон нь
   тест бичих хурдыг ойролцоогоор 2 дахин нэмэгдүүлсэн.

4. **Conventional Commit мессеж** — `/commit` slash command ашиглан commit мессежийг
   хурдан, нэгдсэн форматаар бичсэн.

---

## 5. Юуг AI-аар удаан хийсэн?

**Бэрхшээлтэй байсан газрууд:**

1. **Timezone bug дибагдах** — AI-ийн санал болгосон date логик буруу байсан тул
   гараар шалгах, засах, дахин тест хийх процесс нэмэлт 45 минут зарцуулсан.
   AI дахин санал болгоход "нэмэлт UTC тэмдэгтэй ашигла" гэсэн ч энэ нь зөв биш байв.

2. **Supabase API шинэчлэлт** — AI hallucination-аас болж хуучин API ашигласан тул
   docs уншиж, код дахин бичих шаардлага гарсан.

3. **AI-ийн хэт их код үүсгэдэг байдал** — Cursor tool "энгийн filter нэмэх"
   хүсэлтэд 150 мөр код үүсгэсэн. Ихэнхийг нь хасаж, энгийн 20 мөрт шийдэл хийсэн.
   Энэ нь AI-ийн "overengineering" антипаттерн.

---

## 6. Skill Atrophy эрсдэлийг яаж зохицуулсан?

**Хандлага:**

Бие даалтын явцад "AI байхгүй цаг" гаргах дараах аргыг хэрэглэсэн:

1. **Өдөр бүр 30 минут AI-гүй код бичих** — isOverdue(), formatDate() зэрэг utility
   функцүүдийг эхлээд өөрөө бичиж, дараа нь AI-ийн хувилбартай харьцуулсан.

2. **AI кодыг "дуусгах" биш "суурилах" болгон ашиглах** — AI-ийн үүсгэсэн бүтцийг
   суурь болгон, дэлгэрэнгүй логикийг өөрөө бичсэн.

3. **Код бүрийг тайлбарлаж чадах эсэхийг өөрөөсөө шалгах** — шалгалтанд "энэ
   функц яаж ажилладаг" гэвэл ойлгуулж чадна гэдгийг батлах.

4. **Test бичихдээ AI ашиглаагүй** — Test нь кодыг ойлгосны нотлох баримт тул
   бүгдийг гараар бичсэн.

**Дүгнэлт:**  
AI нь "ажлыг хурдасгах" хэрэгсэл биш — "ойлгуулах" хэрэгсэл болгон ашиглавал
skill atrophy эрсдэл буурна. AI бичсэн кодыг дахин өөрийн үгээр тайлбарлаж чаддаг
болсон нь хамгийн чухал ур чадвар байв.
