"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddProductPage() {
    const router = useRouter();
    const [product, setProduct] = useState({
        name: "",
        price: "",
        stock: "",
        description: "",
        category_id: "",
        image_url: "",
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState([]);

    const handleFileUpload = async (file) => {
        setUploading(true);
        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await api.post("/upload/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setProduct((prev) => {
                const current = prev.image_url ? prev.image_url.split(",").map(u => u.trim()).filter(Boolean) : [];
                const updated = [...current, res.data.url];
                return { ...prev, image_url: updated.join(",") };
            });
        } catch (err) {
            console.error("Upload error:", err);
            alert(err.response?.data?.message || err.response?.data?.error || "Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        setProduct((prev) => {
            const current = prev.image_url ? prev.image_url.split(",").map(u => u.trim()).filter(Boolean) : [];
            const updated = current.filter((_, idx) => idx !== indexToRemove);
            return { ...prev, image_url: updated.join(",") };
        });
    };

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await api.get("/categories");
                setCategories(res.data || []);
            } catch (err) {
                console.error("Failed to load categories.");
            }
        }
        fetchCategories();
    }, []);

    const addProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/admin/product", product);
            router.push("/admin/products");
            setTimeout(() => alert("Product added securely."), 100);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "32px" }}>
                <Link href="/admin/products" className="btn btn-secondary" style={{ padding: "8px 12px" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </Link>
                <div>
                    <h1 style={{ fontSize: "2.5rem", margin: 0 }}>Add Product</h1>
                    <p style={{ color: "var(--text-muted)", margin: "8px 0 0 0" }}>Create a new item in your catalog</p>
                </div>
            </div>

            <div className="card" style={{ padding: "32px", maxWidth: "800px" }}>
                <form onSubmit={addProduct} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Product Name *</label>
                            <input
                                className="input-field"
                                placeholder="E.g. Premium Wireless Headphones"
                                value={product.name}
                                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Category</label>
                            <select
                                className="input-field"
                                value={product.category_id}
                                onChange={(e) => setProduct({ ...product, category_id: e.target.value })}
                                style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none', cursor: 'pointer' }}
                            >
                                <option value="" disabled>Select a Category...</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Price (₹) *</label>
                            <input
                                className="input-field"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={product.price}
                                onChange={(e) => setProduct({ ...product, price: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Stock Available *</label>
                            <input
                                className="input-field"
                                type="number"
                                placeholder="0"
                                value={product.stock}
                                onChange={(e) => setProduct({ ...product, stock: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Product Image</label>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {/* Drag & Drop File Upload Area */}
                            <div 
                                style={{ 
                                    border: "2px dashed var(--border)", 
                                    borderRadius: "12px", 
                                    padding: "32px", 
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
                                onClick={() => document.getElementById("product-file-input").click()}
                            >
                                <input 
                                    id="product-file-input" 
                                    type="file" 
                                    accept="image/*" 
                                    style={{ display: "none" }} 
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (file) await handleFileUpload(file);
                                    }}
                                />
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                    <div>
                                        <span style={{ color: "var(--accent)", fontWeight: 600 }}>Click to upload</span> or drag and drop
                                    </div>
                                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>PNG, JPG, JPEG up to 5MB</span>
                                </div>
                            </div>

                            {/* Upload Loading Progress */}
                            {uploading && (
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                    <span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.2)", borderRadius: "50%", borderTopColor: "var(--accent)", animation: "spin 1s linear infinite" }}></span>
                                    Uploading image to secure storage...
                                </div>
                            )}

                            {/* Upload Preview & Action */}
                            {(() => {
                                const imageUrls = product.image_url ? product.image_url.split(",").map(u => u.trim()).filter(Boolean) : [];
                                return imageUrls.length > 0 && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "12px" }}>
                                        <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-main)" }}>Uploaded Images ({imageUrls.length})</div>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                                            {imageUrls.map((url, idx) => (
                                                <div 
                                                    key={idx} 
                                                    style={{ 
                                                        position: "relative", 
                                                        width: "90px", 
                                                        height: "90px", 
                                                        borderRadius: "8px", 
                                                        border: "1px solid var(--border)",
                                                        overflow: "hidden"
                                                    }}
                                                >
                                                    <img 
                                                        src={url} 
                                                        alt={`Upload preview ${idx + 1}`} 
                                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveImage(idx)}
                                                        style={{
                                                            position: "absolute",
                                                            top: "4px",
                                                            right: "4px",
                                                            background: "rgba(239, 68, 68, 0.9)",
                                                            color: "#ffffff",
                                                            border: "none",
                                                            borderRadius: "50%",
                                                            width: "20px",
                                                            height: "20px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontSize: "12px",
                                                            cursor: "pointer",
                                                            fontWeight: "bold",
                                                            padding: 0,
                                                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                                            transition: "background 0.2s"
                                                        }}
                                                        title="Remove Image"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* URL Textbox fallback */}
                            <div>
                                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                                    Or paste image URLs (separate multiple URLs with commas)
                                </label>
                                <input
                                    className="input-field"
                                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                                    value={product.image_url}
                                    onChange={(e) => setProduct({ ...product, image_url: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Description</label>
                        <textarea
                            className="input-field"
                            placeholder="Describe your product in detail..."
                            value={product.description}
                            onChange={(e) => setProduct({ ...product, description: e.target.value })}
                            style={{ minHeight: "120px", resize: "vertical" }}
                        ></textarea>
                    </div>

                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: "24px", display: "flex", justifyContent: "flex-end" }}>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: "12px 24px" }}>
                            {loading ? "Adding..." : "Publish Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
