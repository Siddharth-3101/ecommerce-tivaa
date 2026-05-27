"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", image_url: "" });
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
      setCategories([]);
    } finally {
      setInitLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    setLoading(true);
    try {
      await api.post("/admin/category", form);
      setForm({ name: "", description: "", image_url: "" });
      await fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await api.delete(`/admin/category/${id}`);
      await fetchCategories();
    } catch (err) {
      alert("Failed to delete category");
    }
  };

  return (
    <div className="animate-fade-in">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <div>
                <h1 style={{ fontSize: "2.5rem", marginBottom: "8px" }}>Categories</h1>
                <p style={{ color: "var(--text-muted)" }}>Organize your store into sections</p>
            </div>
        </div>

      <div className="card" style={{ padding: "24px", marginBottom: "32px" }}>
        <h3 style={{ fontSize: "1.2rem", marginBottom: "16px", marginTop: 0 }}>Add Category</h3>
        <form onSubmit={handleAdd} style={{ display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 200px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Category Name *</label>
                <input
                    className="input-field"
                    placeholder="E.g. Electronics"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                />
            </div>
            <div style={{ flex: "1 1 250px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Description (optional)</label>
                <input
                    className="input-field"
                    placeholder="Brief description of the category..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
            </div>
            <div style={{ flex: "1 1 250px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Category Image URL (optional)</label>
                <input
                    className="input-field"
                    placeholder="https://example.com/category.jpg"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                />
            </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ padding: "12px 24px", height: "42px" }}>
            {loading ? "Adding..." : "Add Category"}
          </button>
        </form>
      </div>

      <div>
        {initLoading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              No categories have been added yet. Let's create one above.
          </div>
        ) : (
          <div className="card" style={{ overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  <th style={{ padding: "16px 24px", fontWeight: 600, textAlign: "left" }}>ID</th>
                  <th style={{ padding: "16px 24px", fontWeight: 600, textAlign: "left" }}>Image</th>
                  <th style={{ padding: "16px 24px", fontWeight: 600, textAlign: "left" }}>Name</th>
                  <th style={{ padding: "16px 24px", fontWeight: 600, textAlign: "left" }}>Description</th>
                  <th style={{ padding: "16px 24px", fontWeight: 600, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "16px 24px", color: "var(--text-muted)" }}>#{c.id}</td>
                    <td style={{ padding: "16px 24px" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "8px", overflow: "hidden", background: "#f9f9f9", border: "1px solid var(--border)" }}>
                            <img src={c.image_url || "/placeholder.png"} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={c.name} />
                        </div>
                    </td>
                    <td style={{ padding: "16px 24px", fontWeight: 600, color: "var(--text-main)" }}>{c.name}</td>
                    <td style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: "0.95rem" }}>{c.description || "-"}</td>
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button
                                className="btn btn-danger"
                                onClick={() => handleDelete(c.id)}
                                style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                            >
                                Delete
                            </button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
