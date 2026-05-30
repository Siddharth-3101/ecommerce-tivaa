"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

export default function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedStock, setSelectedStock] = useState("All");
    const [selectedVisibility, setSelectedVisibility] = useState("All");

    // Fetch categories on load
    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await api.get("/categories");
                setCategories(res.data || []);
            } catch (err) {
                console.error("Failed to load categories", err);
            }
        }
        fetchCategories();
    }, []);

    // Fetch products whenever filters or page change
    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                let url = `/products?admin=true&page=${page}&limit=12`;
                if (selectedCategory !== "All") {
                    url += `&category=${selectedCategory}`;
                }
                if (selectedStock !== "All") {
                    url += `&stock=${selectedStock}`;
                }
                if (selectedVisibility !== "All") {
                    url += `&visibility=${selectedVisibility}`;
                }
                const res = await api.get(url);
                setProducts(res.data?.products || []);
                setTotalPages(res.data?.totalPages || 1);
            } catch (err) {
                console.error("Failed to load products", err);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, [page, refreshTrigger, selectedCategory, selectedStock, selectedVisibility]);

    const handleCategoryChange = (val) => {
        setSelectedCategory(val);
        setPage(1);
    };

    const handleStockChange = (val) => {
        setSelectedStock(val);
        setPage(1);
    };

    const handleVisibilityChange = (val) => {
        setSelectedVisibility(val);
        setPage(1);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await api.delete(`/admin/product/${id}`);
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            alert("Failed to delete product.");
        }
    };

    const handleToggleVisibility = async (id) => {
        try {
            await api.put(`/admin/product/${id}/toggle-visibility`);
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to toggle product visibility");
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <div>
                    <h1 style={{ fontSize: "2.5rem", marginBottom: "8px" }}>Products</h1>
                    <p style={{ color: "var(--text-muted)" }}>Manage your inventory and catalog</p>
                </div>
                <Link href="/admin/products/add" className="btn btn-primary">
                    <svg style={{ marginRight: "8px" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    New Product
                </Link>
            </div>

            {/* Premium Dynamic Filter Controls */}
            <div style={{ 
                display: "flex", 
                gap: "24px", 
                alignItems: "center", 
                flexWrap: "wrap",
                marginBottom: "24px",
                padding: "20px 24px",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--border)",
                borderRadius: "12px"
            }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Category</label>
                    <select 
                        value={selectedCategory} 
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        style={{
                            background: "#121420",
                            color: "var(--text-main)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            padding: "10px 16px",
                            fontSize: "0.9rem",
                            outline: "none",
                            cursor: "pointer",
                            minWidth: "180px",
                            transition: "border-color 0.2s"
                        }}
                        onFocus={(e) => e.target.style.borderColor = "var(--text-main)"}
                        onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                    >
                        <option value="All">All Categories</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Stock Level</label>
                    <select 
                        value={selectedStock} 
                        onChange={(e) => handleStockChange(e.target.value)}
                        style={{
                            background: "#121420",
                            color: "var(--text-main)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            padding: "10px 16px",
                            fontSize: "0.9rem",
                            outline: "none",
                            cursor: "pointer",
                            minWidth: "180px",
                            transition: "border-color 0.2s"
                        }}
                        onFocus={(e) => e.target.style.borderColor = "var(--text-main)"}
                        onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                    >
                        <option value="All">All Stock Levels</option>
                        <option value="in_stock">In Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                    </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Visibility</label>
                    <select 
                        value={selectedVisibility} 
                        onChange={(e) => handleVisibilityChange(e.target.value)}
                        style={{
                            background: "#121420",
                            color: "var(--text-main)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            padding: "10px 16px",
                            fontSize: "0.9rem",
                            outline: "none",
                            cursor: "pointer",
                            minWidth: "180px",
                            transition: "border-color 0.2s"
                        }}
                        onFocus={(e) => e.target.style.borderColor = "var(--text-main)"}
                        onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                    >
                        <option value="All">All Statuses</option>
                        <option value="visible">Visible Only</option>
                        <option value="hidden">Hidden Only</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>Loading products...</div>
            ) : (
                <>
                    <div className="card" style={{ overflow: "hidden" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                    <th style={{ padding: "16px 24px", fontWeight: 600 }}>Product Name</th>
                                    <th style={{ padding: "16px 24px", fontWeight: 600 }}>Price</th>
                                    <th style={{ padding: "16px 24px", fontWeight: 600 }}>Stock</th>
                                    <th style={{ padding: "16px 24px", fontWeight: 600 }}>Category</th>
                                    <th style={{ padding: "16px 24px", fontWeight: 600 }}>Visibility</th>
                                    <th style={{ padding: "16px 24px", fontWeight: 600, textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {products.length > 0 ? products.map((p) => (
                                    <tr key={p.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
                                        <td style={{ padding: "16px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
                                            <div style={{ width: "40px", height: "40px", borderRadius: "8px", overflow: "hidden", background: "#1e2130" }}>
                                                <img src={p.image_url ? p.image_url.split(",")[0].trim() : "/placeholder.png"} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={p.name} />
                                            </div>
                                            <span style={{ fontWeight: 500 }}>{p.name}</span>
                                        </td>
                                        <td style={{ padding: "16px 24px", fontWeight: 600, color: "var(--text-main)" }}>₹{p.price}</td>
                                        <td style={{ padding: "16px 24px" }}>
                                            {p.stock > 0 ? (
                                                <span style={{ padding: "4px 8px", background: "rgba(16, 185, 129, 0.1)", color: "var(--success)", borderRadius: "12px", fontSize: "0.85rem", fontWeight: 600 }}>{p.stock} in stock</span>
                                            ) : (
                                                <span style={{ padding: "4px 8px", background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", borderRadius: "12px", fontSize: "0.85rem", fontWeight: 600 }}>Out of stock</span>
                                            )}
                                        </td>
                                        <td style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: "0.9rem" }}>{p.category_name || "Uncategorized"}</td>
                                        <td style={{ padding: "16px 24px" }}>
                                            {p.is_visible ? (
                                                <span style={{ padding: "4px 8px", background: "rgba(16, 185, 129, 0.1)", color: "var(--success)", borderRadius: "12px", fontSize: "0.85rem", fontWeight: 600 }}>Visible</span>
                                            ) : (
                                                <span style={{ padding: "4px 8px", background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", borderRadius: "12px", fontSize: "0.85rem", fontWeight: 600 }}>Hidden</span>
                                            )}
                                        </td>
                                        <td style={{ padding: "16px 24px", textAlign: "right" }}>
                                            <div style={{ display: "inline-flex", gap: "8px", justifyContent: "flex-end" }}>
                                                <button onClick={() => handleToggleVisibility(p.id)} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "0.85rem" }}>
                                                    {p.is_visible ? "Hide" : "Show"}
                                                </button>
                                                <Link href={`/admin/products/${p.id}`} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "0.85rem" }}>Edit</Link>
                                                <button onClick={() => handleDelete(p.id)} className="btn btn-danger" style={{ padding: "6px 12px", fontSize: "0.85rem" }}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                                            No products found matching the criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Sleek circular boutique pagination selector */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
                            {page > 1 && (
                                <button
                                    onClick={() => setPage(page - 1)}
                                    className="btn btn-secondary"
                                    style={{ padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}
                                >
                                    Prev
                                </button>
                            )}
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                                const isActive = p === page;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            fontSize: '0.9rem',
                                            fontWeight: isActive ? '600' : '400',
                                            border: isActive ? '1px solid var(--text-main)' : '1px solid #e0e0e0',
                                            background: isActive ? 'var(--text-main)' : 'transparent',
                                            color: isActive ? '#ffffff' : 'var(--text-main)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                            
                            {page < totalPages && (
                                <button
                                    onClick={() => setPage(page + 1)}
                                    className="btn btn-secondary"
                                    style={{ padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}
                                >
                                    Next
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
