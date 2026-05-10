# ARCHITECTURE.md — Personal Task Tracker

## Системийн архитектур

### Layer диаграм

```mermaid
graph TD
    subgraph Client["🌐 Client (Browser)"]
        UI[Next.js Pages & Components]
        Store[Zustand State Store]
        LS[Local Storage]
    end

    subgraph Server["⚙️ Server (Next.js API Routes)"]
        API[API Routes /api/tasks]
        Auth[Supabase Auth Middleware]
    end

    subgraph DB["🗄️ Database (Supabase)"]
        PG[(PostgreSQL)]
        RLS[Row Level Security]
    end

    UI --> Store
    Store --> LS
    Store --> API
    API --> Auth
    Auth --> PG
    PG --> RLS
```

### Module диаграм

```mermaid
graph LR
    subgraph Pages
        Home[/ Home]
        TaskPage[/tasks]
    end

    subgraph Components
        TaskList[TaskList]
        TaskCard[TaskCard]
        TaskForm[TaskForm]
        FilterBar[FilterBar]
        SearchBox[SearchBox]
    end

    subgraph Hooks
        useTasks[useTasks]
        useFilter[useFilter]
        useSearch[useSearch]
    end

    subgraph API
        GET[GET /api/tasks]
        POST[POST /api/tasks]
        PUT[PUT /api/tasks/:id]
        DELETE[DELETE /api/tasks/:id]
    end

    Home --> TaskList
    TaskList --> TaskCard
    TaskList --> TaskForm
    TaskList --> FilterBar
    TaskList --> SearchBox
    TaskList --> useTasks
    FilterBar --> useFilter
    SearchBox --> useSearch
    useTasks --> GET
    useTasks --> POST
    useTasks --> PUT
    useTasks --> DELETE
```

### Data Flow диаграм

```mermaid
sequenceDiagram
    participant U as User
    participant C as Component
    participant H as Hook
    participant A as API Route
    participant D as Supabase DB

    U->>C: Task үүсгэх товч дарна
    C->>H: createTask(data)
    H->>A: POST /api/tasks
    A->>D: INSERT INTO tasks
    D-->>A: {id, ...task}
    A-->>H: 201 Created
    H-->>C: state шинэчлэгдэнэ
    C-->>U: Шинэ task харагдана
```

### Database Schema

```mermaid
erDiagram
    TASKS {
        uuid id PK
        text title
        text description
        enum priority
        date due_date
        boolean completed
        timestamp created_at
        timestamp updated_at
    }
    LABELS {
        uuid id PK
        text name
        text color
    }
    TASK_LABELS {
        uuid task_id FK
        uuid label_id FK
    }

    TASKS ||--o{ TASK_LABELS : has
    LABELS ||--o{ TASK_LABELS : belongs_to
```

## Модулийн тайлбар

| Модуль | Байршил | Үүрэг |
|--------|---------|-------|
| TaskList | components/TaskList | Бүх task-ийг харуулах |
| TaskCard | components/TaskCard | Нэг task-ийн card |
| TaskForm | components/TaskForm | Task үүсгэх/засах form |
| FilterBar | components/FilterBar | Priority, label шүүлтүүр |
| SearchBox | components/SearchBox | Гарчгаар хайх |
| useTasks | hooks/useTasks | CRUD API дуудалт |
| useFilter | hooks/useFilter | Шүүлтүүрийн логик |
| API routes | app/api/tasks | Backend endpoint |
