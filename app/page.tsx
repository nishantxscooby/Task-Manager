import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div className="card" style={{ textAlign: "center", maxWidth: "420px" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Task Manager</h1>
        <p style={{ color: "#a1a1aa", marginBottom: "1.5rem" }}>
          Manage your tasks with a secure, production-ready app.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/login" className="btn btn-primary">Log in</Link>
          <Link href="/register" className="btn btn-ghost">Register</Link>
        </div>
      </div>
    </main>
  );
}
