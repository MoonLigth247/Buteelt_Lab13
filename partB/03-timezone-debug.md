# AI Session 03 — Timezone Bug Debug

**Огноо**: 2025-05-10  
**Хэрэгсэл**: Claude Code  
**Зорилго**: isOverdue() timezone алдаа засах

---

## Асуудлын тайлбар

Өнөөдрийн огноогоор due date тавьсан task "хоцорсон" гэж харагдаж байсан.

## Session

**Би**: "isOverdue() функц өнөөдрийн огноог хоцорсон гэж буруу тооцож байна. Яаж засах вэ?"

**Claude 1-р санал** (буруу):
```typescript
// UTC тэмдэгт нэм гэж санал болгосон
return new Date(task.dueDate + "T23:59:59Z") < new Date();
```

**Тайлбар**: Энэ нь Монгол цагаар өнөөдрийн 23:59:59 UTC (маргааш 07:59:59 Монгол цаг)
хүртэл "хоцроогүй" гэж тооцно — бүр ч буруу.

**Би**: "UTC+8 Монгол цагаар зөв тооцоолох хэрэгтэй. Date comparison яаж хийх вэ?"

**Claude 2-р санал** (зөв):
```typescript
function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.completed) return false;
  const today = new Date(new Date().toDateString()); // local midnight
  return new Date(task.dueDate) < today;
}
```

**Тайлбар**: `new Date().toDateString()` → `"Fri May 10 2025"` (local date string)  
`new Date("Fri May 10 2025")` → `2025-05-10T00:00:00` (local time)  
Энэ нь timezone-г зөв тооцоолно.

**Шалгасан**: 
- Өнөөдрийн due date → хоцроогүй ✅
- Өчигдрийн due date → хоцорсон ✅  
- Маргааш due date → хоцроогүй ✅

**Сургамж**: AI-ийн эхний date шийдэл нь UTC-д суурилсан байдаг. Local timezone-тай
ажиллахдаа заавар шалгах хэрэгтэй. `toDateString()` нь простой гэхдээ бодитоор ажилладаг.
