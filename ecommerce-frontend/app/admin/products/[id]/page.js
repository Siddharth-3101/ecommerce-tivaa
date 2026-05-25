"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React from "react";

export default function EditProductPage({ params }) {
    // Next.js 15+ resolution trick if it's a promise, else fast fallback
    const resolvedParams = React.use ? React.use(params) : params;
    const { id } = resolvedParams;
    const router = useRouter();
    const [product, setProduct] = useState(null);
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
            setProduct((prev) => ({ ...prev, image_url: res.data.url }));
        } catch (err) {
            console.error("Upload error:", err);
            alert(err.response?.data?.message || err.response?.data?.error || "Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        async function fetchInitialData() {
            try {
                const res = await api.get(`/products/${id}`);
                setProduct(res.data);
                
                const catRes = await api.get("/categories");
                setCategories(catRes.data || []);
            } catch (err) {
                console.error("Failed to load product data.");
            }
        }
        fetchInitialData();
    }, [id]);

    const updateProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Correct format mapping for Admin product updating
            await api.put(`/admin/product/${id}`, product);
            router.push("/admin/products");
            setTimeout(() => alert("Product updated securely."), 100);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update product");
        } finally {
            setLoading(false);
        }
    };

    if (!product) {
        return (
            <div className="container" style={{ paddingTop: '120px', display: 'flex', justifyContent: 'center' }}>
                <span style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "32px" }}>
                <Link href="/admin/products" className="btn btn-secondary" style={{ padding: "8px 12px" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </Link>
                <div>
                    <h1 style={{ fontSize: "2.5rem", margin: 0 }}>Edit Product</h1>
                    <p style={{ color: "var(--text-muted)", margin: "8px 0 0 0" }}>Update #{product.id}</p>
                </div>
            </div>

            <div className="card" style={{ padding: "32px", maxWidth: "800px" }}>
                <form onSubmit={updateProduct} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
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
                                value={product.category_id || ""}
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
                            {product.image_url && (
                                <div style={{ display: "flex", alignItems: "center", gap: "24px", padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "12px" }}>
                                    <img 
                                        src={product.image_url} 
                                        alt="Product Preview" 
                                        style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border)" }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Active Image Link:</div>
                                        <div style={{ fontSize: "0.9rem", color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {product.image_url}
                                        </div>
                                    </div>
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary" 
                                        style={{ padding: "8px 12px", color: "var(--danger)", borderColor: "rgba(239, 68, 68, 0.2)" }}
                                        onClick={() => setProduct({ ...product, image_url: "" })}
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}

                            {/* URL Textbox fallback */}
                            <div>
                                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}>Or paste an image URL instead</label>
                                <input
                                    className="input-field"
                                    placeholder="https://example.com/image.jpg"
                                    value={product.image_url || ""}
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
                            value={product.description || ""}
                            onChange={(e) => setProduct({ ...product, description: e.target.value })}
                            style={{ minHeight: "120px", resize: "vertical" }}
                        ></textarea>
                    </div>

                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: "24px", display: "flex", justifyContent: "flex-end" }}>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: "12px 24px" }}>
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
