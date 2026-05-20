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
    const [categories, setCategories] = useState([]);

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
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Image URL</label>
                        <input
                            className="input-field"
                            placeholder="https://example.com/image.jpg"
                            value={product.image_url || ""}
                            onChange={(e) => setProduct({ ...product, image_url: e.target.value })}
                        />
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
