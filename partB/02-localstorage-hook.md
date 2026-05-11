# AI Session 02 — LocalStorage Hook

**Огноо**: 2025-05-10  
**Хэрэгсэл**: Claude Code  
**Зорилго**: useLocalStorage hook + SSR hydration асуудал шийдэх

---

## Session

**Би**: "Next.js 14-д useLocalStorage hook бичнэ үү. SSR-тай зөрчилдөхгүй байхаар."

**Claude анхны санал**:
```typescript
function useLocalStorage<T>(key: string, init: T) {
  const [val, setVal] = useState<T>(
    () => JSON.parse(localStorage.getItem(key) || JSON.stringify(init))
  );
  // ...
}
```

**Асуудал**: `localStorage is not defined` — SSR үед window object байхгүй.

**Би дахин хүссэн**: "SSR-тай зөрчилдөхгүй хувилбар өг"

**Claude засварласан хувилбар**:
```typescript
function useLocalStorage<T>(key: string, init: T) {
  const [val, setVal] = useState<T>(() => {
    if (typeof window === "undefined") return init;
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : init;
    } catch { return init; }
  });
  // ...
}
```

**Шалгасан**: Next.js dev mode-д ✅, production build-д ✅

**Сургамж**: AI-ийн эхний хувилбар browser environment assume хийдэг. SSR-тай
ажиллахдаа `typeof window === "undefined"` шалгалт заавал хэрэгтэй.
