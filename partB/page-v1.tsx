"use client";
import { useState } from "react";

// ===== Types =====
type Priority = "high" | "medium" | "low";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  completed: boolean;
  labels: string[];
  createdAt: string;
}

// ===== Utility =====
function genId() {
  return Math.random().toString(36).slice(2, 9);
}

const PRIORITY_COLORS: Record<Priority, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};

const PRIORITY_LABELS: Record<Priority, string> = {
  high: "Өндөр",
  medium: "Дунд",
  low: "Бага",
};

// ===== TaskForm Component =====
function TaskForm({
  onAdd,
  onClose,
  initial,
}: {
  onAdd: (t: Omit<Task, "id" | "createdAt">) => void;
  onClose: () => void;
  initial?: Task;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [labelInput, setLabelInput] = useState("");
  const [labels, setLabels] = useState<string[]>(initial?.labels ?? []);

  function addLabel() {
    const l = labelInput.trim();
    if (l && !labels.includes(l)) setLabels([...labels, l]);
    setLabelInput("");
  }

  function removeLabel(l: string) {
    setLabels(labels.filter((x) => x !== l));
  }

  function handleSubmit() {
    if (!title.trim()) return alert("Гарчиг оруулна уу");
    onAdd({ title, description, priority, dueDate, completed: initial?.completed ?? false, labels });
    onClose();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          width: 400,
          maxWidth: "90vw",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ margin: "0 0 16px", fontSize: 18 }}>
          {initial ? "Task засах" : "Шинэ Task"}
        </h2>

        <label style={labelStyle}>Гарчиг *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task-ийн нэр..."
          style={inputStyle}
        />

        <label style={labelStyle}>Тайлбар</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Дэлгэрэнгүй..."
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />

        <label style={labelStyle}>Тэргүүлэх чиглэл</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          style={inputStyle}
        >
          <option value="high">Өндөр</option>
          <option value="medium">Дунд</option>
          <option value="low">Бага</option>
        </select>

        <label style={labelStyle}>Дуусах огноо</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Шошго</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input
            value={labelInput}
            onChange={(e) => setLabelInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addLabel()}
            placeholder="Шошго нэмэх..."
            style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
          />
          <button onClick={addLabel} style={btnSecondaryStyle}>
            +
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
          {labels.map((l) => (
            <span key={l} style={chipStyle}>
              {l}
              <button
                onClick={() => removeLabel(l)}
                style={{ background: "none", border: "none", cursor: "pointer", marginLeft: 4, color: "#666" }}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={btnSecondaryStyle}>
            Цуцлах
          </button>
          <button onClick={handleSubmit} style={btnPrimaryStyle}>
            {initial ? "Хадгалах" : "Нэмэх"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== TaskCard Component =====
function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}) {
  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();

  return (
    <div
      style={{
        background: task.completed ? "#f9fafb" : "#fff",
        border: `1px solid ${task.completed ? "#e5e7eb" : "#d1d5db"}`,
        borderLeft: `4px solid ${PRIORITY_COLORS[task.priority]}`,
        borderRadius: 8,
        padding: "14px 16px",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        opacity: task.completed ? 0.7 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        style={{ marginTop: 3, cursor: "pointer", width: 16, height: 16 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span
            style={{
              fontWeight: 600,
              fontSize: 15,
              textDecoration: task.completed ? "line-through" : "none",
              color: task.completed ? "#9ca3af" : "#111827",
              wordBreak: "break-word",
            }}
          >
            {task.title}
          </span>
          <span
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 999,
              background: PRIORITY_COLORS[task.priority] + "20",
              color: PRIORITY_COLORS[task.priority],
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {PRIORITY_LABELS[task.priority]}
          </span>
        </div>

        {task.description && (
          <p style={{ margin: "0 0 6px", fontSize: 13, color: "#6b7280" }}>{task.description}</p>
        )}

        {task.dueDate && (
          <p
            style={{
              margin: "0 0 6px",
              fontSize: 12,
              color: isOverdue ? "#ef4444" : "#6b7280",
              fontWeight: isOverdue ? 600 : 400,
            }}
          >
            📅 {task.dueDate} {isOverdue && "— Хоцорсон!"}
          </p>
        )}

        {task.labels.length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {task.labels.map((l) => (
              <span key={l} style={{ ...chipStyle, fontSize: 11 }}>
                {l}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
        <button onClick={() => onEdit(task)} style={iconBtnStyle} title="Засах">
          ✏️
        </button>
        <button onClick={() => onDelete(task.id)} style={iconBtnStyle} title="Устгах">
          🗑️
        </button>
      </div>
    </div>
  );
}

// ===== Main App =====
export default function TaskTrackerV1() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "CLAUDE.md бичих",
      description: "Repo root-д build команд, convention тодорхойлох",
      priority: "high",
      dueDate: "2025-05-12",
      completed: false,
      labels: ["docs", "AI"],
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Архитектурын диаграм зурах",
      description: "Mermaid ашиглан layer болон data flow харуулах",
      priority: "medium",
      dueDate: "2025-05-13",
      completed: true,
      labels: ["planning"],
      createdAt: new Date().toISOString(),
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("all");

  function addTask(data: Omit<Task, "id" | "createdAt">) {
    if (editingTask) {
      setTasks(tasks.map((t) => (t.id === editingTask.id ? { ...t, ...data } : t)));
      setEditingTask(null);
    } else {
      setTasks([{ ...data, id: genId(), createdAt: new Date().toISOString() }, ...tasks]);
    }
  }

  function toggleTask(id: string) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function deleteTask(id: string) {
    if (confirm("Устгах уу?")) setTasks(tasks.filter((t) => t.id !== id));
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setShowForm(true);
  }

  const filtered = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (filterStatus === "active" && t.completed) return false;
    if (filterStatus === "completed" && !t.completed) return false;
    return true;
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    overdue: tasks.filter((t) => t.dueDate && !t.completed && new Date(t.dueDate) < new Date()).length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111827" }}>
            📋 Task Tracker
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
            {stats.completed}/{stats.total} дууссан
            {stats.overdue > 0 && (
              <span style={{ color: "#ef4444", marginLeft: 8 }}>• {stats.overdue} хоцорсон</span>
            )}
          </p>
        </div>
        <button
          onClick={() => { setEditingTask(null); setShowForm(true); }}
          style={btnPrimaryStyle}
        >
          + Шинэ Task
        </button>
      </header>

      {/* Filters */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "12px 24px",
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Хайх..."
          style={{ ...inputStyle, marginBottom: 0, width: 220 }}
        />
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as Priority | "all")}
          style={{ ...inputStyle, marginBottom: 0, width: 140 }}
        >
          <option value="all">Бүх чиглэл</option>
          <option value="high">Өндөр</option>
          <option value="medium">Дунд</option>
          <option value="low">Бага</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "completed")}
          style={{ ...inputStyle, marginBottom: 0, width: 140 }}
        >
          <option value="all">Бүх статус</option>
          <option value="active">Идэвхтэй</option>
          <option value="completed">Дууссан</option>
        </select>
      </div>

      {/* Task List */}
      <main style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p>{search || filterPriority !== "all" ? "Хайлтанд тохирох task олдсонгүй" : "Task байхгүй байна. Шинэ task нэмнэ үү!"}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onEdit={openEdit}
                onDelete={deleteTask}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showForm && (
        <TaskForm
          onAdd={addTask}
          onClose={() => { setShowForm(false); setEditingTask(null); }}
          initial={editingTask ?? undefined}
        />
      )}
    </div>
  );
}

// ===== Shared Styles =====
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontSize: 14,
  marginBottom: 12,
  boxSizing: "border-box",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 4,
};

const btnPrimaryStyle: React.CSSProperties = {
  background: "#3b82f6",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "8px 16px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const btnSecondaryStyle: React.CSSProperties = {
  background: "#f3f4f6",
  color: "#374151",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  padding: "8px 16px",
  fontSize: 14,
  cursor: "pointer",
};

const chipStyle: React.CSSProperties = {
  background: "#eff6ff",
  color: "#3b82f6",
  padding: "2px 10px",
  borderRadius: 999,
  fontSize: 12,
  display: "inline-flex",
  alignItems: "center",
};

const iconBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "4px 6px",
  borderRadius: 6,
  fontSize: 16,
};
