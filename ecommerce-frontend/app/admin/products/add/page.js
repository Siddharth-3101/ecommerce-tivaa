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
    const [categories, setCategories] = useState([]);

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
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Image URL</label>
                        <input
                            className="input-field"
                            placeholder="https://example.com/image.jpg"
                            value={product.image_url}
                            onChange={(e) => setProduct({ ...product, image_url: e.target.value })}
                        />
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
