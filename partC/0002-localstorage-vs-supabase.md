# ADR-002: LocalStorage vs Supabase — Өгөгдөл хадгалах шийдвэр

**Огноо**: 2025-05-10  
**Статус**: Accepted  
**Шийдвэр гаргагч**: Оюутан + Claude Code

---

## Контекст

Build хийх явцад өгөгдөл хаана хадгалах асуудал гарсан:
- Supabase (PostgreSQL) — backend хадгалалт
- LocalStorage — browser-д хадгалалт

Lab 13-ийн хугацааны хязгаарт Supabase бүрэн нэгтгэх хүндрэлтэй байсан.

## AI-тай ярилцлага

**Би асуусан**: "LocalStorage эсвэл Supabase — аль нь зөв?"

**Claude хариулсан**:
> LocalStorage: хурдан хэрэгжинэ, auth хэрэггүй, гэхдээ нэг browser-д л ажиллана.  
> Supabase: multi-device, real-time, auth — гэхдээ RLS тохируулах шаардлагатай.  
> Lab 13-д хугацаа хязгаарлагдмал тул **LocalStorage → Supabase migration pattern** ашиглавал зохимжтой.

## Шийдвэр

**Шат 1 (Одоогийн)**: LocalStorage-тай ажилладаг  
**Шат 2 (Цаашид)**: Supabase-руу шилжих migration

Шалтгаан:
- Lab 13-ийн 2 долоо хоногт Supabase RLS + Auth бүрэн хийх хугацаа хүрэлцэхгүй
- LocalStorage → Supabase migration pattern нь production дээр ч хэрэглэгддэг
- `useLocalStorage` hook-ийг `useSupabase` hook-оор солиход logic өөрчлөгдөхгүй

## Архитектурын зохицуулалт

```typescript
// Одоо:
const [tasks, setTasks] = useLocalStorage<Task[]>(STORAGE_KEY, []);

// Суурь шилжилт:
const [tasks, setTasks] = useTaskStorage<Task[]>(); // abstraction layer
```

## Үр дагавар

**Эерэг:**
- Хурдан хэрэгжинэ, network хамаарахгүй
- Supabase API hallucination эрсдэл байхгүй

**Сөрөг:**
- Нэг browser-д л өгөгдөл хадгалагдана
- DevTools-д өгөгдөл харагдана (sensitive биш тул зөвшөөрөгдөнө)
- Browser cache цэвэрлэхэд өгөгдөл алдагдана

## Шилжилтийн төлөвлөгөө

1. `useLocalStorage` hook-ийг `useTaskStorage` abstraction болгох
2. Supabase client нэгтгэх
3. `useTaskStorage`-г Supabase implementation-аар солих
4. Migration script: LocalStorage → Supabase
