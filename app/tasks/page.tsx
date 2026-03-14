"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
};

type User = { id: string; email: string; name: string | null };

export default function TasksPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUser = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    if (!res.ok) {
      router.push("/login?from=/tasks");
      return null;
    }
    const data = await res.json();
    setUser(data.user);
    return data.user;
  }, [router]);

  const fetchTasks = useCallback(
    async (page = 1) => {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/tasks?${params}`);
      if (!res.ok) {
        if (res.status === 401) router.push("/login?from=/tasks");
        else setError("Failed to load tasks");
        return;
      }
      const data = await res.json();
      setTasks(data.tasks);
      setPagination(data.pagination);
      setError("");
    },
    [statusFilter, search, router]
  );

  useEffect(() => {
    fetchUser().then((u) => {
      if (u) fetchTasks(pagination.page);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchTasks(1);
  }, [statusFilter, search, user]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this task?")) return;
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (res.ok) fetchTasks(pagination.page);
  }

  if (loading) {
    return (
      <main className="container" style={{ paddingTop: "3rem" }}>
        <p style={{ color: "#a1a1aa" }}>Loading…</p>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="container" style={{ paddingTop: "1.5rem", paddingBottom: "3rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem" }}>Tasks</h1>
          <p style={{ fontSize: "0.9rem", color: "#a1a1aa" }}>{user.email}</p>
        </div>
        <button type="button" onClick={handleLogout} className="btn btn-ghost">
          Log out
        </button>
      </header>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <TaskForm onSuccess={() => fetchTasks(1)} />
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Search by title..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearch(searchInput)}
            style={{ flex: "1", minWidth: "160px", padding: "0.5rem 0.75rem", background: "#27272a", border: "1px solid #3f3f46", borderRadius: "8px", color: "#e4e4e7" }}
          />
          <button type="button" className="btn btn-primary" onClick={() => setSearch(searchInput)}>
            Search
          </button>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "0.5rem 0.75rem", background: "#27272a", border: "1px solid #3f3f46", borderRadius: "8px", color: "#e4e4e7" }}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        {error && <p className="error-msg">{error}</p>}
        <TaskList tasks={tasks} onDelete={handleDelete} onUpdate={() => fetchTasks(pagination.page)} />
        {pagination.totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={pagination.page <= 1}
              onClick={() => fetchTasks(pagination.page - 1)}
            >
              Previous
            </button>
            <span style={{ fontSize: "0.9rem", color: "#a1a1aa" }}>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchTasks(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function TaskForm({ onSuccess }: { onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || undefined, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create task");
        return;
      }
      setTitle("");
      setDescription("");
      setStatus("pending");
      onSuccess();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>New task</h2>
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="desc">Description</label>
        <textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="form-group">
        <label htmlFor="status">Status</label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      {error && <p className="error-msg">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Adding…" : "Add task"}
      </button>
    </form>
  );
}

function TaskList({
  tasks,
  onDelete,
  onUpdate,
}: {
  tasks: Task[];
  onDelete: (id: string) => void;
  onUpdate: () => void;
}) {
  if (tasks.length === 0) {
    return <p style={{ color: "#a1a1aa" }}>No tasks yet. Add one above.</p>;
  }

  return (
    <ul style={{ listStyle: "none" }}>
      {tasks.map((t) => (
        <li
          key={t.id}
          style={{
            padding: "1rem 0",
            borderBottom: "1px solid #27272a",
          }}
        >
          <TaskItem task={t} onDelete={onDelete} onUpdate={onUpdate} />
        </li>
      ))}
    </ul>
  );
}

function TaskItem({
  task,
  onDelete,
  onUpdate,
}: {
  task: Task;
  onDelete: (id: string) => void;
  onUpdate: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [status, setStatus] = useState(task.status);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || undefined, status }),
      });
      if (res.ok) {
        setEditing(false);
        onUpdate();
      }
    } finally {
      setLoading(false);
    }
  }

  const badgeClass = task.status === "completed" ? "badge-completed" : task.status === "in_progress" ? "badge-in_progress" : "badge-pending";

  if (editing) {
    return (
      <div>
        <div className="form-group">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={loading}>
            Save
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
      <div>
        <strong>{task.title}</strong>
        <span className={`badge ${badgeClass}`} style={{ marginLeft: "0.5rem" }}>
          {task.status}
        </span>
        {task.description && <p style={{ marginTop: "0.25rem", fontSize: "0.9rem", color: "#a1a1aa" }}>{task.description}</p>}
        <p style={{ fontSize: "0.8rem", color: "#71717a", marginTop: "0.25rem" }}>
          {new Date(task.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="button" className="btn btn-ghost" onClick={() => setEditing(true)}>
          Edit
        </button>
        <button type="button" className="btn btn-danger" onClick={() => onDelete(task.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}
