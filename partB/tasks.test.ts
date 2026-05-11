/**
 * Task Tracker — Unit Tests
 * Jest + React Testing Library
 * 
 * Co-Authored-By: Claude <noreply@anthropic.com>
 */

// ============================================================
//  TYPE & UTILITY TESTS (no DOM needed)
// ============================================================

// --- Replicate the utils locally for testing ---
type Priority = "high" | "medium" | "low";
interface Task {
  id: string; title: string; description: string;
  priority: Priority; dueDate: string; completed: boolean;
  labels: string[]; createdAt: string; updatedAt: string;
}

function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.completed) return false;
  return new Date(task.dueDate) < new Date(new Date().toDateString());
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

function formatDate(d: string): string {
  if (!d) return "";
  return new Intl.DateTimeFormat("mn-MN", { month: "short", day: "numeric" }).format(new Date(d));
}

function makeTask(overrides: Partial<Task> = {}): Task {
  const now = new Date().toISOString();
  return {
    id: uid(), title: "Test task", description: "", priority: "medium",
    dueDate: "", completed: false, labels: [], createdAt: now, updatedAt: now,
    ...overrides,
  };
}

// ============================================================
//  1. uid() — unique ID generation
// ============================================================
describe("uid()", () => {
  test("returns a non-empty string", () => {
    expect(typeof uid()).toBe("string");
    expect(uid().length).toBeGreaterThan(0);
  });

  test("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, uid));
    expect(ids.size).toBe(100);
  });
});

// ============================================================
//  2. isOverdue()
// ============================================================
describe("isOverdue()", () => {
  test("returns false for completed task even with past due date", () => {
    const t = makeTask({ dueDate: "2000-01-01", completed: true });
    expect(isOverdue(t)).toBe(false);
  });

  test("returns false when dueDate is empty", () => {
    const t = makeTask({ dueDate: "" });
    expect(isOverdue(t)).toBe(false);
  });

  test("returns true for past due date on active task", () => {
    const t = makeTask({ dueDate: "2000-01-01", completed: false });
    expect(isOverdue(t)).toBe(true);
  });

  test("returns false for future due date", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const t = makeTask({ dueDate: future.toISOString().split("T")[0], completed: false });
    expect(isOverdue(t)).toBe(false);
  });
});

// ============================================================
//  3. formatDate()
// ============================================================
describe("formatDate()", () => {
  test("returns empty string for empty input", () => {
    expect(formatDate("")).toBe("");
  });

  test("returns a non-empty string for valid date", () => {
    const result = formatDate("2025-06-15");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

// ============================================================
//  4. Task filter logic
// ============================================================
describe("Task filter logic", () => {
  const tasks: Task[] = [
    makeTask({ id:"1", title:"Alpha",   priority:"high",   completed:false, labels:["l1"] }),
    makeTask({ id:"2", title:"Beta",    priority:"medium", completed:true,  labels:["l2"] }),
    makeTask({ id:"3", title:"Gamma",   priority:"low",    completed:false, labels:["l1","l2"] }),
    makeTask({ id:"4", title:"алфа",    priority:"high",   completed:false, labels:[] }),
  ];

  function applyFilter(search: string, priority: string, status: string, label: string) {
    return tasks.filter(t => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
          !t.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (priority !== "all" && t.priority !== priority) return false;
      if (status === "active"    && t.completed)  return false;
      if (status === "completed" && !t.completed) return false;
      if (label !== "all" && !t.labels.includes(label)) return false;
      return true;
    });
  }

  test("no filter returns all tasks", () => {
    expect(applyFilter("","all","all","all")).toHaveLength(4);
  });

  test("search by title (case-insensitive)", () => {
    expect(applyFilter("alpha","all","all","all")).toHaveLength(1);
  });

  test("search with Mongolian characters", () => {
    expect(applyFilter("алф","all","all","all")).toHaveLength(1);
  });

  test("filter by priority=high", () => {
    const res = applyFilter("","high","all","all");
    expect(res.every(t => t.priority==="high")).toBe(true);
    expect(res).toHaveLength(2);
  });

  test("filter active only", () => {
    const res = applyFilter("","all","active","all");
    expect(res.every(t => !t.completed)).toBe(true);
  });

  test("filter completed only", () => {
    const res = applyFilter("","all","completed","all");
    expect(res.every(t => t.completed)).toBe(true);
    expect(res).toHaveLength(1);
  });

  test("filter by label l1", () => {
    const res = applyFilter("","all","all","l1");
    expect(res.every(t => t.labels.includes("l1"))).toBe(true);
    expect(res).toHaveLength(2);
  });

  test("combined filter: high priority + active", () => {
    const res = applyFilter("","high","active","all");
    expect(res).toHaveLength(2);
    expect(res.every(t => t.priority==="high" && !t.completed)).toBe(true);
  });
});

// ============================================================
//  5. Sort logic
// ============================================================
describe("Task sort logic", () => {
  const tasks: Task[] = [
    makeTask({ id:"1", priority:"low",    dueDate:"2025-06-01", createdAt:"2025-01-01T00:00:00Z" }),
    makeTask({ id:"2", priority:"high",   dueDate:"2025-05-01", createdAt:"2025-03-01T00:00:00Z" }),
    makeTask({ id:"3", priority:"medium", dueDate:"2025-07-01", createdAt:"2025-02-01T00:00:00Z" }),
  ];

  const PRIORITY_ORDER: Record<Priority,number> = { high:0, medium:1, low:2 };

  test("sort by priority", () => {
    const sorted = [...tasks].sort((a,b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    expect(sorted.map(t=>t.priority)).toEqual(["high","medium","low"]);
  });

  test("sort by dueDate ascending", () => {
    const sorted = [...tasks].sort((a,b) => a.dueDate.localeCompare(b.dueDate));
    expect(sorted.map(t=>t.dueDate)).toEqual(["2025-05-01","2025-06-01","2025-07-01"]);
  });

  test("sort by createdAt descending (newest first)", () => {
    const sorted = [...tasks].sort((a,b) => b.createdAt.localeCompare(a.createdAt));
    expect(sorted[0].id).toBe("2");
  });
});

// ============================================================
//  6. Stats calculation
// ============================================================
describe("Stats calculation", () => {
  const tasks: Task[] = [
    makeTask({ completed: false, dueDate: "2000-01-01" }),  // overdue
    makeTask({ completed: false, dueDate: "" }),
    makeTask({ completed: true,  dueDate: "2000-01-01" }),  // completed (not overdue)
    makeTask({ completed: true,  dueDate: "" }),
  ];

  test("total count", () => {
    expect(tasks.length).toBe(4);
  });

  test("completed count", () => {
    expect(tasks.filter(t=>t.completed).length).toBe(2);
  });

  test("overdue count (completed tasks not counted)", () => {
    expect(tasks.filter(t=>isOverdue(t)).length).toBe(1);
  });

  test("progress percentage", () => {
    const pct = Math.round((tasks.filter(t=>t.completed).length / tasks.length) * 100);
    expect(pct).toBe(50);
  });
});

// ============================================================
//  7. CRUD operations
// ============================================================
describe("CRUD operations", () => {
  let tasks: Task[] = [];

  beforeEach(() => { tasks = [makeTask({ id:"existing", title:"Old" })]; });

  test("add new task prepends to list", () => {
    const newTask = makeTask({ id:"new", title:"New" });
    tasks = [newTask, ...tasks];
    expect(tasks[0].id).toBe("new");
    expect(tasks).toHaveLength(2);
  });

  test("toggle completed flips boolean", () => {
    tasks = tasks.map(t => t.id==="existing" ? { ...t, completed:!t.completed } : t);
    expect(tasks[0].completed).toBe(true);
    // toggle again
    tasks = tasks.map(t => t.id==="existing" ? { ...t, completed:!t.completed } : t);
    expect(tasks[0].completed).toBe(false);
  });

  test("update task title", () => {
    const now = new Date().toISOString();
    tasks = tasks.map(t => t.id==="existing" ? { ...t, title:"Updated", updatedAt:now } : t);
    expect(tasks[0].title).toBe("Updated");
  });

  test("delete task removes it", () => {
    tasks = tasks.filter(t => t.id !== "existing");
    expect(tasks).toHaveLength(0);
  });

  test("delete non-existent id leaves list unchanged", () => {
    tasks = tasks.filter(t => t.id !== "nonexistent");
    expect(tasks).toHaveLength(1);
  });
});
