"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

export default function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                const res = await api.get(`/products?page=${page}&limit=12`);
                setProducts(res.data?.products || []);
                setTotalPages(res.data?.totalPages || 1);
            } catch (err) {
                console.error("Failed to load products", err);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, [page, refreshTrigger]);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await api.delete(`/admin/product/${id}`);
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            alert("Failed to delete product.");
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
                                        <td style={{ padding: "16px 24px", textAlign: "right" }}>
                                            <div style={{ display: "inline-flex", gap: "8px", justifyContent: "flex-end" }}>
                                                <Link href={`/admin/products/${p.id}`} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "0.85rem" }}>Edit</Link>
                                                <button onClick={() => handleDelete(p.id)} className="btn btn-danger" style={{ padding: "6px 12px", fontSize: "0.85rem" }}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                                            No products found. Start by adding one.
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
