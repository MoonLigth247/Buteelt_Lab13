# SELF-EVALUATION.md

## 1. Хэрэв шалгалт өнөөдөр болбол би энэ кодыг өөрөө бичиж чадах уу?

**Хэсэгчлэн — тайлбартай**

Дараах зүйлсийг өөрөө бичиж чадна:
- `isOverdue()`, `formatDate()`, `uid()` utility функцүүд
- Task-ийн CRUD логик (state update pattern)
- Filter болон sort логик
- TypeScript interface тодорхойлох

Дараах зүйлсэд туслалцаа хэрэгтэй:
- `useLocalStorage` hook-ийн hydration алдааг бие даан засах нь хэцүү байх
- Mermaid диаграмын нарийн синтакс
- React-ийн `useCallback`/`useRef` зөв хэрэглэх газар

**Дүгнэлт**: Үндсэн логикийг ойлгосон. Boilerplate болон синтаксийн зарим хэсэг
docs-г лавлах шаардлагатай ч тулгуурлах чадвартай.

---

## 2. Дахин хийнэ гэвэл юуг өөрөөр хийх вэ?

1. **Supabase-г эхнээс нэгтгэх** — LocalStorage-д эхлэхгүй, шууд Supabase ашиглах.
   Timezone болон hallucination асуудлыг эрт олж засах боломж гарна.

2. **AI session log-ийг тэр дор нь хадгалах** — Session дуусаад хадгалахад мартдаг.
   Дараа нь дурсахад хэцүү байсан.

3. **TDD (Test Driven Development) аргыг туршиx** — Эхлээд тест бичиж, дараа код бичих.
   AI-тай TDD хийхэд hallucination эрт илэрнэ гэж бодож байна.

4. **Feature branch ашиглах** — Бүгдийг main-д commit хийсэн. Feature branch ашиглавал
   Git history илүү цэгцтэй байх байсан.

---

## 3. Энэ туршлагаас юу сурсан бэ?

**Техникийн хувьд:**
- AI-ийн санал болгосон API-ийг official docs-тай тулгах зуршил чухал
- Timezone bug нь test-ийн явцад л илэрдэг — test бичих ач холбогдол
- `useLocalStorage` hook-ийн SSR hydration мismatch нь Next.js-д нийтлэг асуудал

**AI-тай ажиллах хувьд:**
- "Verify, don't trust" зарчим бодитоор ойлгогдсон — hallucination 2 удаа тохиолдсон
- AI нь architectural шийдвэр гаргахад туслах боломжтой ч эцсийн шийдвэр хүний байх ёстой
- AI-ийн хэт их код үүсгэх хандлагыг хязгаарлаж, энгийн шийдлийг илүүд үзэх

**Мэргэжлийн хувьд:**
- "Spec → Generate → Review → Integrate" workflow бодит ажил дээр ажилладаг
- AI-гүй цаг гаргах нь skill atrophy-г урьдчилан сэргийлнэ
- Code review чадвар AI-ийн эринд хамгийн чухал ур чадвар болж байна
