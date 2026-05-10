# AI Planning Session — partA

**Огноо**: 2025-05-10  
**Хэрэгсэл**: Claude Code (claude-sonnet-4)  
**Зорилго**: Stack сонголт, архитектур тодорхойлох

---

## Session 1: Stack харьцуулалт

**Би**: "Personal Task Tracker хийхэд MERN, Next.js+Supabase, Laravel 3-ын аль нь тохиромжтой вэ?"

**Claude**: 
> MERN нь бүх түвшинд JS ашиглах давуу талтай ч Task Tracker-т арай нүсэр.  
> Next.js+Supabase одоогоор хамгийн trend. Supabase нь Auth+DB нэг дор шийдэнэ.  
> Laravel хурдан CRUD хийхэд сайн ч React-тай харьцуулахад UI интерактив байдал бага.  
> **Зөвлөмж**: Next.js+Supabase — 2 долоо хоногт дуусгахад хамгийн хурдан.

**Шийдвэр**: Next.js + Supabase + Tailwind CSS сонгосон.

---

## Session 2: Архитектур тодорхойлох

**Би**: "Task Tracker-ийн folder бүтцийг зур"

**Claude**:
```
bie-daalt-13/partB/
├── src/
│   ├── app/
│   │   ├── api/tasks/route.ts
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── TaskList.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskForm.tsx
│   │   ├── FilterBar.tsx
│   │   └── SearchBox.tsx
│   ├── hooks/
│   │   ├── useTasks.ts
│   │   └── useFilter.ts
│   └── lib/
│       └── supabase.ts
└── tests/
```

**Шалгасан**: Бүтэц Next.js 14 App Router-тай нийцэж байна. ✅

---

## Session 3: CLAUDE.md агуулга

**Би**: "CLAUDE.md-д ямар no-go zones бичих хэрэгтэй вэ?"

**Claude**:
> 1. API key кодод шууд бичихгүй  
> 2. `any` TypeScript type хориглох  
> 3. RLS унтраахгүй  
> 4. Console.log production-д үлдээхгүй  
> 5. Test-гүй feature merge хийхгүй

**Зассан**: `npm audit` нэмсэн (Claude санал болгоогүй ч security-н хувьд чухал).

---

## Hallucination тэмдэглэл

Session 2-д Claude `createServerComponentClient` ашиглахыг санал болгосон —  
энэ нь Supabase-ийн хуучин API (@supabase/auth-helpers-nextjs). Шинэ хувилбарт  
`@supabase/ssr` пакет ашиглах ёстой. Баримт бичгийг шалгаж засав.
