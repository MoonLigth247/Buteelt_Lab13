# ADR-001: Stack сонголт — Next.js + Supabase + Tailwind CSS

**Огноо**: 2025-05-10  
**Статус**: Accepted  
**Шийдвэр гаргагч**: Оюутан + Claude Code

---

## Контекст

Personal Task Tracker-ийн хувьд 3 stack-ийг харьцуулж нэгийг сонгох шаардлагатай болсон.
STACK-COMPARISON.md-д бүрэн харьцуулалт байна. Гол шаардлагууд:

- CRUD + filter/search
- Auth (хэрэглэгч нэвтрэх)
- 2 долоо хоногт дуусгах
- AI tool-уудтай сайн ажиллах

## Авч үзсэн сонголтууд

1. **MERN** (MongoDB, Express, React, Node.js)
2. **Next.js + Supabase + Tailwind CSS** ✅ Сонгосон
3. **Laravel + Blade + MySQL**

## Шийдвэр

**Next.js + Supabase + Tailwind CSS** сонгосон.

## Үндэслэл

| Шаардлага | Яагаад Next.js + Supabase |
|-----------|--------------------------|
| Хурдан хөгжүүлэлт | Supabase-ийн Auth + DB нэг дор шийдэгдэнэ |
| AI туслалцаа | Claude Code Next.js-д хамгийн сайн дэмжлэг үзүүлдэг |
| Deployment | Vercel дээр нэг товчоор байршуулна |
| Tailwind | Utility-first тул UI хурдан бичигдэнэ |
| TypeScript | Type safety — hallucination эрсдэл буурна |

## Үр дагавар

**Эерэг:**
- Supabase-ийн шинэчлэлтэй AI нийцэхгүй байж болох тул баримт бичиг шалгах шаардлагатай
- Vercel free tier-ийн хязгаарт анхаарах

**Сөрөг:**
- Supabase hallucination эрсдэл: AI нь хуучин API ашиглаж болзошгүй → баримт бичиг тулгах шаардлагатай
