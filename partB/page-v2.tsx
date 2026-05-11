"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
//  TYPES
// ============================================================
type Priority = "high" | "medium" | "low";
type FilterStatus = "all" | "active" | "completed";

interface Label {
  id: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  completed: boolean;
  labels: string[];      // label ids
  createdAt: string;
  updatedAt: string;
}

// ============================================================
//  CONSTANTS
// ============================================================
const STORAGE_KEY = "task-tracker-v2";

const PRIORITY_META: Record<Priority, { label: string; color: string; bg: string; ring: string }> = {
  high:   { label: "Өндөр", color: "#dc2626", bg: "#fef2f2", ring: "#fca5a5" },
  medium: { label: "Дунд",  color: "#d97706", bg: "#fffbeb", ring: "#fcd34d" },
  low:    { label: "Бага",  color: "#16a34a", bg: "#f0fdf4", ring: "#86efac" },
};

const LABEL_PALETTE = [
  "#6366f1","#ec4899","#14b8a6","#f59e0b","#8b5cf6","#ef4444","#0ea5e9","#22c55e",
];

const DEFAULT_LABELS: Label[] = [
  { id: "l1", name: "Ажил",     color: "#6366f1" },
  { id: "l2", name: "Хувийн",  color: "#ec4899" },
  { id: "l3", name: "Яаралтай",color: "#ef4444" },
  { id: "l4", name: "Сурах",   color: "#14b8a6" },
];

const DEFAULT_TASKS: Task[] = [
  {
    id: "t1", title: "CLAUDE.md бичих",
    description: "Repo root-д build команд, convention, no-go zones тодорхойлох",
    priority: "high", dueDate: "", completed: false,
    labels: ["l1","l3"], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "t2", title: "Stack харьцуулалт хийх",
    description: "MERN, Next.js+Supabase, Laravel-ийг жишиж нэгийг сонгох",
    priority: "medium", dueDate: "", completed: true,
    labels: ["l1"], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "t3", title: "Архитектурын диаграм",
    description: "Mermaid ашиглан layer болон data flow харуулах",
    priority: "medium", dueDate: "", completed: false,
    labels: ["l4"], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
];

// ============================================================
//  UTILS
// ============================================================
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }

function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.completed) return false;
  return new Date(task.dueDate) < new Date(new Date().toDateString());
}

function formatDate(d: string) {
  if (!d) return "";
  return new Intl.DateTimeFormat("mn-MN", { month: "short", day: "numeric" }).format(new Date(d));
}

// ============================================================
//  HOOKS
// ============================================================
function useLocalStorage<T>(key: string, init: T) {
  const [val, setVal] = useState<T>(() => {
    if (typeof window === "undefined") return init;
    try {
      const s = localStorage.getItem(key);
      return s ? (JSON.parse(s) as T) : init;
    } catch { return init; }
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }, [key, val]);

  return [val, setVal] as const;
}

// ============================================================
//  COMPONENTS — TaskForm
// ============================================================
function TaskForm({
  initial,
  labels,
  onSave,
  onClose,
}: {
  initial?: Task;
  labels: Label[];
  onSave: (data: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  onClose: () => void;
}) {
  const [title, setTitle]           = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priority, setPriority]     = useState<Priority>(initial?.priority ?? "medium");
  const [dueDate, setDueDate]       = useState(initial?.dueDate ?? "");
  const [selectedLabels, setSelectedLabels] = useState<string[]>(initial?.labels ?? []);
  const [error, setError]           = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function toggleLabel(id: string) {
    setSelectedLabels(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function handleSubmit() {
    if (!title.trim()) { setError("Гарчиг оруулна уу"); return; }
    onSave({ title: title.trim(), description, priority, dueDate, completed: initial?.completed ?? false, labels: selectedLabels });
    onClose();
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
    if (e.key === "Enter" && e.metaKey) handleSubmit();
  }

  return (
    <div
      role="dialog" aria-modal="true"
      style={{ position:"fixed",inset:0,background:"rgba(17,24,39,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,backdropFilter:"blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={handleKey}
    >
      <div style={{ background:"#fff",borderRadius:16,padding:"28px 28px 24px",width:480,maxWidth:"92vw",boxShadow:"0 25px 60px rgba(0,0,0,0.25)",display:"flex",flexDirection:"column",gap:0 }}>
        {/* Header */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
          <h2 style={{ margin:0,fontSize:18,fontWeight:700,color:"#111827" }}>
            {initial ? "Task засах" : "Шинэ Task нэмэх"}
          </h2>
          <button onClick={onClose} style={{ background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#9ca3af",lineHeight:1 }}>×</button>
        </div>

        {/* Title */}
        <label style={fLabelStyle}>Гарчиг *</label>
        <input
          ref={inputRef} value={title} onChange={e=>{setTitle(e.target.value);setError("");}}
          placeholder="Task-ийн нэр..."
          style={{ ...fInputStyle, borderColor: error ? "#ef4444" : "#e5e7eb" }}
        />
        {error && <p style={{ margin:"-8px 0 8px",fontSize:12,color:"#ef4444" }}>{error}</p>}

        {/* Description */}
        <label style={fLabelStyle}>Тайлбар</label>
        <textarea
          value={description} onChange={e=>setDescription(e.target.value)}
          placeholder="Дэлгэрэнгүй тайлбар..."
          rows={3} style={{ ...fInputStyle,resize:"vertical" }}
        />

        {/* Priority + Due Date */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          <div>
            <label style={fLabelStyle}>Тэргүүлэх чиглэл</label>
            <div style={{ display:"flex",gap:6 }}>
              {(["high","medium","low"] as Priority[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  style={{
                    flex:1, padding:"7px 0", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer",
                    border: priority===p ? `2px solid ${PRIORITY_META[p].color}` : "2px solid #e5e7eb",
                    background: priority===p ? PRIORITY_META[p].bg : "#fff",
                    color: priority===p ? PRIORITY_META[p].color : "#6b7280",
                    transition:"all 0.15s",
                  }}
                >
                  {PRIORITY_META[p].label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={fLabelStyle}>Дуусах огноо</label>
            <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} style={fInputStyle} />
          </div>
        </div>

        {/* Labels */}
        <label style={fLabelStyle}>Шошго</label>
        <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:20 }}>
          {labels.map(l => (
            <button
              key={l.id}
              onClick={() => toggleLabel(l.id)}
              style={{
                padding:"4px 12px",borderRadius:999,fontSize:12,fontWeight:500,cursor:"pointer",
                border: selectedLabels.includes(l.id) ? `2px solid ${l.color}` : "2px solid #e5e7eb",
                background: selectedLabels.includes(l.id) ? l.color+"20" : "#fff",
                color: selectedLabels.includes(l.id) ? l.color : "#6b7280",
                transition:"all 0.15s",
              }}
            >
              {selectedLabels.includes(l.id) ? "✓ " : ""}{l.name}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display:"flex",gap:8,justifyContent:"flex-end" }}>
          <button onClick={onClose} style={secBtnStyle}>Цуцлах</button>
          <button onClick={handleSubmit} style={primBtnStyle}>
            {initial ? "Хадгалах" : "Нэмэх"}
          </button>
        </div>
        <p style={{ margin:"12px 0 0",textAlign:"center",fontSize:11,color:"#d1d5db" }}>⌘ + Enter хадгалах · Esc цуцлах</p>
      </div>
    </div>
  );
}

// ============================================================
//  COMPONENTS — TaskCard
// ============================================================
function TaskCard({
  task, labels, onToggle, onEdit, onDelete,
}: {
  task: Task; labels: Label[];
  onToggle: (id:string)=>void; onEdit:(t:Task)=>void; onDelete:(id:string)=>void;
}) {
  const [hovered, setHovered] = useState(false);
  const overdue = isOverdue(task);
  const meta = PRIORITY_META[task.priority];
  const taskLabels = labels.filter(l => task.labels.includes(l.id));

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: task.completed ? "#fafafa" : "#fff",
        border: "1px solid",
        borderColor: hovered && !task.completed ? "#93c5fd" : "#e5e7eb",
        borderLeft: `4px solid ${task.completed ? "#d1d5db" : meta.color}`,
        borderRadius: 10,
        padding: "12px 14px",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        transition: "all 0.15s",
        boxShadow: hovered && !task.completed ? "0 4px 12px rgba(59,130,246,0.08)" : "none",
        opacity: task.completed ? 0.65 : 1,
        cursor: "default",
      }}
    >
      {/* Checkbox */}
      <div
        onClick={() => onToggle(task.id)}
        style={{
          width:20,height:20,borderRadius:6,border:`2px solid ${task.completed ? meta.color : "#d1d5db"}`,
          background: task.completed ? meta.color : "#fff",
          display:"flex",alignItems:"center",justifyContent:"center",
          cursor:"pointer",flexShrink:0,marginTop:2,transition:"all 0.15s",
        }}
      >
        {task.completed && <span style={{color:"#fff",fontSize:12,lineHeight:1}}>✓</span>}
      </div>

      {/* Content */}
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:2 }}>
          <span style={{
            fontWeight:600,fontSize:14,color:task.completed?"#9ca3af":"#111827",
            textDecoration:task.completed?"line-through":"none",wordBreak:"break-word",
          }}>
            {task.title}
          </span>
          <span style={{
            fontSize:10,padding:"2px 7px",borderRadius:999,fontWeight:700,flexShrink:0,
            background:task.completed?"#f3f4f6":meta.bg,
            color:task.completed?"#9ca3af":meta.color,
          }}>
            {meta.label}
          </span>
        </div>

        {task.description && (
          <p style={{ margin:"2px 0 6px",fontSize:12,color:"#9ca3af",lineHeight:1.5 }}>
            {task.description}
          </p>
        )}

        <div style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
          {task.dueDate && (
            <span style={{ fontSize:11,color:overdue?"#ef4444":"#9ca3af",fontWeight:overdue?700:400,display:"flex",alignItems:"center",gap:3 }}>
              {overdue ? "⚠️" : "📅"} {formatDate(task.dueDate)}
              {overdue && " хоцорсон"}
            </span>
          )}
          {taskLabels.map(l => (
            <span key={l.id} style={{
              fontSize:10,padding:"2px 8px",borderRadius:999,fontWeight:500,
              background:l.color+"18",color:l.color,
            }}>
              {l.name}
            </span>
          ))}
        </div>
      </div>

      {/* Actions — show on hover */}
      <div style={{ display:"flex",gap:2,flexShrink:0,opacity:hovered?1:0,transition:"opacity 0.15s" }}>
        <button onClick={() => onEdit(task)} style={iconBtn} title="Засах">✏️</button>
        <button onClick={() => onDelete(task.id)} style={iconBtn} title="Устгах">🗑️</button>
      </div>
    </div>
  );
}

// ============================================================
//  COMPONENTS — StatsBar
// ============================================================
function StatsBar({ tasks }: { tasks: Task[] }) {
  const total     = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const overdue   = tasks.filter(t => isOverdue(t)).length;
  const pct       = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div style={{ display:"flex",gap:16,alignItems:"center",flexWrap:"wrap" }}>
      <div style={{ flex:1,minWidth:120 }}>
        <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,color:"#6b7280",marginBottom:4 }}>
          <span>Явц</span><span style={{fontWeight:600,color:"#3b82f6"}}>{pct}%</span>
        </div>
        <div style={{ height:6,background:"#e5e7eb",borderRadius:999,overflow:"hidden" }}>
          <div style={{ height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#6366f1,#3b82f6)",borderRadius:999,transition:"width 0.4s ease" }}/>
        </div>
      </div>
      {[
        { label:"Нийт",    value:total,     color:"#6b7280" },
        { label:"Дууссан", value:completed, color:"#16a34a" },
        { label:"Хоцорсон",value:overdue,   color:"#ef4444" },
      ].map(s => (
        <div key={s.label} style={{ textAlign:"center" }}>
          <div style={{ fontSize:20,fontWeight:700,color:s.color,lineHeight:1 }}>{s.value}</div>
          <div style={{ fontSize:10,color:"#9ca3af",marginTop:2 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
//  COMPONENTS — EmptyState
// ============================================================
function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div style={{ textAlign:"center",padding:"72px 0",color:"#9ca3af" }}>
      <div style={{ fontSize:56,marginBottom:12,lineHeight:1 }}>{hasFilter ? "🔍" : "🎯"}</div>
      <p style={{ fontSize:16,fontWeight:600,color:"#6b7280",margin:"0 0 6px" }}>
        {hasFilter ? "Тохирох task олдсонгүй" : "Task байхгүй байна"}
      </p>
      <p style={{ fontSize:13,margin:0 }}>
        {hasFilter ? "Шүүлтүүр өөрчилж үзнэ үү" : "Дээрх «+ Шинэ Task» товчийг дарна уу"}
      </p>
    </div>
  );
}

// ============================================================
//  MAIN APP
// ============================================================
export default function TaskTrackerV2() {
  const [tasks,  setTasks]  = useLocalStorage<Task[]> (STORAGE_KEY + ":tasks",  DEFAULT_TASKS);
  const [labels, setLabels] = useLocalStorage<Label[]>(STORAGE_KEY + ":labels", DEFAULT_LABELS);

  const [showForm, setShowForm]     = useState(false);
  const [editTask, setEditTask]     = useState<Task | null>(null);
  const [showDelConfirm, setShowDelConfirm] = useState<string | null>(null);

  const [search,         setSearch]         = useState("");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [filterStatus,   setFilterStatus]   = useState<FilterStatus>("all");
  const [filterLabel,    setFilterLabel]    = useState<string>("all");
  const [sortBy,         setSortBy]         = useState<"createdAt"|"dueDate"|"priority">("createdAt");

  // ---- CRUD ----
  const addTask = useCallback((data: Omit<Task,"id"|"createdAt"|"updatedAt">) => {
    const now = new Date().toISOString();
    if (editTask) {
      setTasks(prev => prev.map(t => t.id === editTask.id ? { ...t, ...data, updatedAt:now } : t));
      setEditTask(null);
    } else {
      setTasks(prev => [{ ...data, id:uid(), createdAt:now, updatedAt:now }, ...prev]);
    }
  }, [editTask, setTasks]);

  const toggleTask = useCallback((id:string) => {
    setTasks(prev => prev.map(t => t.id===id ? { ...t, completed:!t.completed, updatedAt:new Date().toISOString() } : t));
  }, [setTasks]);

  const deleteTask = useCallback((id:string) => {
    setTasks(prev => prev.filter(t => t.id!==id));
    setShowDelConfirm(null);
  }, [setTasks]);

  const openEdit = useCallback((task:Task) => { setEditTask(task); setShowForm(true); }, []);

  // ---- FILTER & SORT ----
  const filtered = tasks
    .filter(t => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
          !t.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterPriority !== "all" && t.priority !== filterPriority) return false;
      if (filterStatus === "active"    && t.completed)  return false;
      if (filterStatus === "completed" && !t.completed) return false;
      if (filterLabel !== "all" && !t.labels.includes(filterLabel)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1; if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sortBy === "priority") {
        const o:Record<Priority,number> = {high:0,medium:1,low:2};
        return o[a.priority] - o[b.priority];
      }
      return b.createdAt.localeCompare(a.createdAt);
    });

  const hasFilter = !!(search || filterPriority!=="all" || filterStatus!=="all" || filterLabel!=="all");

  // ---- KEYBOARD SHORTCUT ----
  useEffect(() => {
    function onKey(e:KeyboardEvent) {
      if ((e.metaKey||e.ctrlKey) && e.key==="k" && !showForm) {
        e.preventDefault(); setEditTask(null); setShowForm(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showForm]);

  return (
    <div style={{ minHeight:"100vh",background:"#f8fafc",fontFamily:"'Segoe UI',system-ui,sans-serif" }}>

      {/* ===== HEADER ===== */}
      <header style={{
        background:"#fff",borderBottom:"1px solid #e5e7eb",
        padding:"0 24px",position:"sticky",top:0,zIndex:50,
        boxShadow:"0 1px 3px rgba(0,0,0,0.04)",
      }}>
        <div style={{ maxWidth:720,margin:"0 auto",height:60,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <span style={{ fontSize:22 }}>📋</span>
            <div>
              <h1 style={{ margin:0,fontSize:17,fontWeight:700,color:"#0f172a",lineHeight:1.2 }}>Task Tracker</h1>
              <p style={{ margin:0,fontSize:11,color:"#94a3b8" }}>Lab 13 — AI-Assisted</p>
            </div>
          </div>
          <button
            onClick={() => { setEditTask(null); setShowForm(true); }}
            style={{
              background:"linear-gradient(135deg,#6366f1,#3b82f6)",color:"#fff",
              border:"none",borderRadius:8,padding:"8px 16px",fontSize:13,
              fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,
              boxShadow:"0 2px 8px rgba(99,102,241,0.35)",transition:"opacity 0.15s",
            }}
            onMouseEnter={e=>(e.currentTarget.style.opacity="0.9")}
            onMouseLeave={e=>(e.currentTarget.style.opacity="1")}
          >
            <span style={{fontSize:16,lineHeight:1}}>+</span> Шинэ Task
            <span style={{fontSize:10,opacity:0.7,background:"rgba(255,255,255,0.2)",padding:"1px 5px",borderRadius:4}}>⌘K</span>
          </button>
        </div>
      </header>

      {/* ===== STATS + FILTERS ===== */}
      <div style={{ background:"#fff",borderBottom:"1px solid #e5e7eb" }}>
        <div style={{ maxWidth:720,margin:"0 auto",padding:"16px 24px",display:"flex",flexDirection:"column",gap:14 }}>
          <StatsBar tasks={tasks} />

          {/* Search */}
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,color:"#94a3b8" }}>🔍</span>
            <input
              value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Хайх… (гарчиг, тайлбар)"
              style={{ width:"100%",padding:"8px 12px 8px 36px",border:"1px solid #e5e7eb",borderRadius:8,fontSize:13,background:"#f8fafc",outline:"none",boxSizing:"border-box" }}
              onFocus={e=>(e.currentTarget.style.borderColor="#6366f1")}
              onBlur={e=>(e.currentTarget.style.borderColor="#e5e7eb")}
            />
          </div>

          {/* Filter row */}
          <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
            {/* Status pills */}
            {(["all","active","completed"] as FilterStatus[]).map(s => (
              <button key={s} onClick={()=>setFilterStatus(s)} style={{
                padding:"5px 12px",borderRadius:999,fontSize:12,fontWeight:500,cursor:"pointer",
                border: filterStatus===s ? "2px solid #6366f1" : "2px solid #e5e7eb",
                background: filterStatus===s ? "#eef2ff" : "#fff",
                color: filterStatus===s ? "#6366f1" : "#6b7280",
                transition:"all 0.15s",
              }}>
                {s==="all"?"Бүгд":s==="active"?"Идэвхтэй":"Дууссан"}
              </button>
            ))}

            {/* Priority */}
            <select value={filterPriority} onChange={e=>setFilterPriority(e.target.value as Priority|"all")}
              style={{ padding:"5px 10px",borderRadius:8,fontSize:12,border:"1px solid #e5e7eb",background:"#fff",color:"#374151",cursor:"pointer" }}>
              <option value="all">Бүх чиглэл</option>
              {(["high","medium","low"] as Priority[]).map(p=>(
                <option key={p} value={p}>{PRIORITY_META[p].label}</option>
              ))}
            </select>

            {/* Label filter */}
            <select value={filterLabel} onChange={e=>setFilterLabel(e.target.value)}
              style={{ padding:"5px 10px",borderRadius:8,fontSize:12,border:"1px solid #e5e7eb",background:"#fff",color:"#374151",cursor:"pointer" }}>
              <option value="all">Бүх шошго</option>
              {labels.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}
            </select>

            {/* Sort */}
            <select value={sortBy} onChange={e=>setSortBy(e.target.value as typeof sortBy)}
              style={{ padding:"5px 10px",borderRadius:8,fontSize:12,border:"1px solid #e5e7eb",background:"#fff",color:"#374151",cursor:"pointer",marginLeft:"auto" }}>
              <option value="createdAt">Шинэ эхэнд</option>
              <option value="dueDate">Дуусах огноогоор</option>
              <option value="priority">Чиглэлээр</option>
            </select>
          </div>
        </div>
      </div>

      {/* ===== TASK LIST ===== */}
      <main style={{ maxWidth:720,margin:"0 auto",padding:"20px 16px 60px" }}>
        {filtered.length === 0 ? (
          <EmptyState hasFilter={hasFilter} />
        ) : (
          <>
            <p style={{ margin:"0 0 12px",fontSize:12,color:"#94a3b8" }}>
              {filtered.length} task {hasFilter && `(нийт ${tasks.length}-аас)`}
            </p>
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {filtered.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  labels={labels}
                  onToggle={toggleTask}
                  onEdit={openEdit}
                  onDelete={id => setShowDelConfirm(id)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* ===== MODALS ===== */}
      {showForm && (
        <TaskForm
          initial={editTask ?? undefined}
          labels={labels}
          onSave={addTask}
          onClose={() => { setShowForm(false); setEditTask(null); }}
        />
      )}

      {/* Delete confirm */}
      {showDelConfirm && (
        <div style={{ position:"fixed",inset:0,background:"rgba(17,24,39,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300 }}>
          <div style={{ background:"#fff",borderRadius:14,padding:24,width:320,textAlign:"center",boxShadow:"0 20px 50px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize:40,marginBottom:8 }}>🗑️</div>
            <h3 style={{ margin:"0 0 8px",fontSize:16,color:"#111827" }}>Task устгах уу?</h3>
            <p style={{ margin:"0 0 20px",fontSize:13,color:"#6b7280" }}>Энэ үйлдлийг буцаах боломжгүй.</p>
            <div style={{ display:"flex",gap:8,justifyContent:"center" }}>
              <button onClick={()=>setShowDelConfirm(null)} style={secBtnStyle}>Цуцлах</button>
              <button onClick={()=>deleteTask(showDelConfirm)} style={{ ...primBtnStyle,background:"#ef4444" }}>Устгах</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
//  SHARED STYLES
// ============================================================
const fLabelStyle: React.CSSProperties = { display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5 };
const fInputStyle: React.CSSProperties = {
  width:"100%",padding:"9px 12px",border:"1.5px solid #e5e7eb",borderRadius:8,
  fontSize:13,marginBottom:14,boxSizing:"border-box",outline:"none",
  transition:"border-color 0.15s",color:"#111827",
};
const primBtnStyle: React.CSSProperties = {
  background:"linear-gradient(135deg,#6366f1,#3b82f6)",color:"#fff",
  border:"none",borderRadius:8,padding:"9px 20px",fontSize:14,
  fontWeight:600,cursor:"pointer",transition:"opacity 0.15s",
};
const secBtnStyle: React.CSSProperties = {
  background:"#f3f4f6",color:"#374151",border:"1px solid #e5e7eb",
  borderRadius:8,padding:"9px 20px",fontSize:14,cursor:"pointer",
};
const iconBtn: React.CSSProperties = {
  background:"none",border:"none",cursor:"pointer",
  padding:"5px 7px",borderRadius:6,fontSize:15,transition:"background 0.1s",
};
