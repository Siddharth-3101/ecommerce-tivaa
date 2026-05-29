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

    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (file) => {
        setUploading(true);
        const formData = new FormData();
        formData.append("image", file);
        formData.append("folder", "tivaa-categories");

        try {
            const res = await api.post("/upload/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setForm((prev) => ({ ...prev, image_url: res.data.url }));
        } catch (err) {
            console.error("Upload error:", err);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
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
                <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Category Name *</label>
                            <input
                                className="input-field"
                                placeholder="E.g. Electronics"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Description (optional)</label>
                            <input
                                className="input-field"
                                placeholder="Brief description of the category..."
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Category Image (optional)</label>
                        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                            {/* Upload Area */}
                            <div 
                                style={{ 
                                    flex: 1,
                                    border: "2px dashed var(--border)", 
                                    borderRadius: "12px", 
                                    padding: "24px", 
                                    textAlign: "center", 
                                    background: "rgba(255,255,255,0.01)", 
                                    cursor: "pointer",
                                    transition: "all 0.2s ease"
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.style.borderColor = "var(--accent)";
                                    e.currentTarget.style.background = "rgba(16, 185, 129, 0.03)";
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.style.borderColor = "var(--border)";
                                    e.currentTarget.style.background = "rgba(255,255,255,0.01)";
                                }}
                                onDrop={async (e) => {
                                    e.preventDefault();
                                    e.currentTarget.style.borderColor = "var(--border)";
                                    e.currentTarget.style.background = "rgba(255,255,255,0.01)";
                                    const file = e.dataTransfer.files[0];
                                    if (file) await handleFileUpload(file);
                                }}
                                onClick={() => document.getElementById("category-file-input").click()}
                            >
                                <input 
                                    id="category-file-input" 
                                    type="file" 
                                    accept="image/*" 
                                    style={{ display: "none" }} 
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (file) await handleFileUpload(file);
                                    }}
                                />
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                    <div>
                                        <span style={{ color: "var(--accent)", fontWeight: 600 }}>Click to upload</span> or drag and drop
                                    </div>
                                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{uploading ? "Uploading..." : "PNG, JPG, JPEG up to 5MB"}</span>
                                </div>
                            </div>

                            {/* Preview */}
                            {form.image_url && (
                                <div style={{ position: "relative", width: "100px", height: "100px", borderRadius: "8px", border: "1px solid var(--border)", overflow: "hidden", flexShrink: 0 }}>
                                    <img src={form.image_url} alt="Category Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    <button
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, image_url: "" }))}
                                        style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(239, 68, 68, 0.9)", color: "white", border: "none", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", cursor: "pointer" }}
                                    >×</button>
                                </div>
                            )}
                        </div>
                        
                        <div style={{ marginTop: "12px" }}>
                            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                                Or paste image URL directly
                            </label>
                            <input
                                className="input-field"
                                placeholder="https://example.com/category.jpg"
                                value={form.image_url}
                                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                            />
                        </div>
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
                        <button className="btn btn-primary" type="submit" disabled={loading || uploading} style={{ padding: "12px 24px" }}>
                            {loading ? "Adding..." : "Add Category"}
                        </button>
                    </div>
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
