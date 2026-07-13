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
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [importing, setImporting] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedStock, setSelectedStock] = useState("All");
    const [selectedVisibility, setSelectedVisibility] = useState("All");

    // Search states
    const [searchTerm, setSearchTerm] = useState("");
    const [appliedSearchTerm, setAppliedSearchTerm] = useState("");

    // Initial load from sessionStorage on client mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const cat = sessionStorage.getItem("admin_products_category");
            if (cat) setSelectedCategory(cat);

            const stock = sessionStorage.getItem("admin_products_stock");
            if (stock) setSelectedStock(stock);

            const vis = sessionStorage.getItem("admin_products_visibility");
            if (vis) setSelectedVisibility(vis);

            const p = sessionStorage.getItem("admin_products_page");
            if (p) setPage(parseInt(p));

            const search = sessionStorage.getItem("admin_products_searchTerm");
            if (search) setSearchTerm(search);

            const appSearch = sessionStorage.getItem("admin_products_appliedSearchTerm");
            if (appSearch) setAppliedSearchTerm(appSearch);

            setMounted(true);
        } else {
            setMounted(true);
        }
    }, []);

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
        if (!mounted) return;

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
                if (appliedSearchTerm) {
                    url += `&query=${encodeURIComponent(appliedSearchTerm)}`;
                }
                const res = await api.get(url);
                setProducts(res.data?.products || []);
                setTotalPages(res.data?.totalPages || 1);
            } catch (err) {
                console.error("Failed to load products", err);
            } finally {
                setLoading(false);
                setSelectedProductIds([]); // Clear selection when page or filters change
            }
        }
        fetchProducts();
    }, [page, refreshTrigger, selectedCategory, selectedStock, selectedVisibility, appliedSearchTerm, mounted]);

    const changePage = (p) => {
        setPage(p);
        if (typeof window !== "undefined") {
            sessionStorage.setItem("admin_products_page", String(p));
        }
    };

    const handleCategoryChange = (val) => {
        setSelectedCategory(val);
        if (typeof window !== "undefined") {
            sessionStorage.setItem("admin_products_category", val);
        }
        changePage(1);
    };

    const handleStockChange = (val) => {
        setSelectedStock(val);
        if (typeof window !== "undefined") {
            sessionStorage.setItem("admin_products_stock", val);
        }
        changePage(1);
    };

    const handleVisibilityChange = (val) => {
        setSelectedVisibility(val);
        if (typeof window !== "undefined") {
            sessionStorage.setItem("admin_products_visibility", val);
        }
        changePage(1);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (typeof window !== "undefined") {
            sessionStorage.setItem("admin_products_searchTerm", e.target.value);
        }
    };

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        setAppliedSearchTerm(searchTerm);
        if (typeof window !== "undefined") {
            sessionStorage.setItem("admin_products_appliedSearchTerm", searchTerm);
        }
        changePage(1);
    };

    const handleSearchClear = () => {
        setSearchTerm("");
        setAppliedSearchTerm("");
        if (typeof window !== "undefined") {
            sessionStorage.setItem("admin_products_searchTerm", "");
            sessionStorage.setItem("admin_products_appliedSearchTerm", "");
        }
        changePage(1);
    };

    const handleClearAllFilters = () => {
        setSearchTerm("");
        setAppliedSearchTerm("");
        setSelectedCategory("All");
        setSelectedStock("All");
        setSelectedVisibility("All");
        setPage(1);
        if (typeof window !== "undefined") {
            sessionStorage.setItem("admin_products_searchTerm", "");
            sessionStorage.setItem("admin_products_appliedSearchTerm", "");
            sessionStorage.setItem("admin_products_category", "All");
            sessionStorage.setItem("admin_products_stock", "All");
            sessionStorage.setItem("admin_products_visibility", "All");
            sessionStorage.setItem("admin_products_page", "1");
        }
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

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedProductIds(products.map(p => p.id));
        } else {
            setSelectedProductIds([]);
        }
    };

    const handleSelectOne = (e, id) => {
        if (e.target.checked) {
            setSelectedProductIds(prev => [...prev, id]);
        } else {
            setSelectedProductIds(prev => prev.filter(item => item !== id));
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete the ${selectedProductIds.length} selected products?`)) return;
        try {
            await api.post("/admin/products/bulk-delete", { ids: selectedProductIds });
            alert("Selected products deleted successfully.");
            setSelectedProductIds([]);
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            console.error("Bulk delete error:", err);
            alert(err.response?.data?.message || "Failed to delete selected products.");
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

    const handleDownloadCSV = async () => {
        try {
            const res = await api.get("/products?admin=true&limit=10000");
            const allProducts = res.data?.products || [];
            
            if (allProducts.length === 0) {
                alert("No products to export.");
                return;
            }

            const headers = ["id", "name", "description", "price", "stock", "category_id", "image_url", "is_visible", "purchase_price", "purchased_from", "discounted_price"];
            const headerLine = headers.join(",");
            const rowLines = allProducts.map(p => 
                headers.map(h => {
                    const val = p[h] === null || p[h] === undefined ? "" : String(p[h]);
                    return `"${val.replace(/"/g, '""')}"`;
                }).join(",")
            );
            const csvContent = [headerLine, ...rowLines].join("\n");
            
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "products_export.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error(err);
            alert("Failed to export products.");
        }
    };

    const handleImportCSV = async (e) => {
        const file = e.target.files[0];
        if (!file || importing) return;

        setImporting(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target.result;
                const lines = text.split(/\r?\n/);
                if (lines.length === 0 || !lines[0]) {
                    alert("Empty CSV file.");
                    return;
                }

                const parseCSVLine = (line) => {
                    const result = [];
                    let curVal = "";
                    let inQuotes = false;
                    for (let i = 0; i < line.length; i++) {
                        const char = line[i];
                        if (char === '"') {
                            if (inQuotes && line[i + 1] === '"') {
                                curVal += '"';
                                i++;
                            } else {
                                inQuotes = !inQuotes;
                            }
                        } else if (char === ',' && !inQuotes) {
                            result.push(curVal);
                            curVal = "";
                        } else {
                            curVal += char;
                        }
                    }
                    result.push(curVal);
                    return result;
                };

                const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
                const parsedProducts = [];

                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;
                    const values = parseCSVLine(line);
                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header] = values[index] !== undefined ? values[index].trim() : "";
                    });
                    if (obj.name) {
                        parsedProducts.push(obj);
                    }
                }

                if (parsedProducts.length === 0) {
                    alert("No valid products found in CSV.");
                    return;
                }

                if (!confirm(`Are you sure you want to import/update ${parsedProducts.length} products?`)) {
                    return;
                }

                await api.post("/admin/products/bulk", parsedProducts);
                alert("Products imported/updated successfully!");
                setRefreshTrigger(prev => prev + 1);
            } catch (err) {
                console.error(err);
                alert(err.response?.data?.message || "Failed to import products. Please check the CSV format.");
            } finally {
                setImporting(false);
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                    <h1 style={{ fontSize: "2.5rem", marginBottom: "8px" }}>Products</h1>
                    <p style={{ color: "var(--text-muted)" }}>Manage your inventory and catalog</p>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                    {selectedProductIds.length > 0 && (
                        <button 
                            onClick={handleBulkDelete} 
                            className="btn btn-danger animate-fade-in"
                            style={{ padding: "10px 18px", fontSize: "0.9rem" }}
                        >
                            Delete Selected ({selectedProductIds.length})
                        </button>
                    )}
                    <button onClick={handleDownloadCSV} className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#ffffff", padding: "10px 18px", fontSize: "0.9rem" }}>
                        Download CSV
                    </button>
                    <label htmlFor="csv-upload-input" className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#ffffff", padding: "10px 18px", cursor: "pointer", margin: 0, fontSize: "0.9rem" }}>
                        Import {importing ? "..." : "CSV"}
                    </label>
                    <input id="csv-upload-input" type="file" accept=".csv" onChange={handleImportCSV} style={{ display: "none" }} disabled={importing} />
                    <Link href="/admin/products/add" className="btn btn-primary" style={{ padding: "10px 18px" }}>
                        <svg style={{ marginRight: "8px" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        New Product
                    </Link>
                </div>
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
                {/* Search Bar Input and Button */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexGrow: 1, minWidth: "260px" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Search Products</label>
                    <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "8px" }}>
                        <div style={{ position: "relative", flexGrow: 1 }}>
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Search by name..."
                                style={{
                                    width: "100%",
                                    background: "#ffffff",
                                    color: "var(--text-main)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "8px",
                                    padding: "10px 36px 10px 16px",
                                    fontSize: "0.9rem",
                                    outline: "none",
                                    transition: "border-color 0.2s"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "var(--text-main)"}
                                onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                            />
                            {searchTerm && (
                                <button 
                                    type="button"
                                    onClick={handleSearchClear}
                                    style={{
                                        position: "absolute",
                                        right: "10px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "transparent",
                                        border: "none",
                                        color: "var(--text-muted)",
                                        cursor: "pointer",
                                        fontSize: "1.1rem",
                                        padding: 0
                                    }}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                        <button 
                            type="submit"
                            className="btn btn-primary"
                            style={{ padding: "10px 20px", borderRadius: "8px", fontSize: "0.9rem" }}
                        >
                            Search
                        </button>
                    </form>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Category</label>
                    <select 
                        value={selectedCategory} 
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        style={{
                            background: "#ffffff",
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
                        {(() => {
                            const parents = categories.filter(c => !c.parent_id);
                            const subs = categories.filter(c => c.parent_id);
                            const sorted = [];
                            parents.forEach(p => {
                                sorted.push(p);
                                const children = subs.filter(s => Number(s.parent_id) === Number(p.id));
                                children.forEach(c => {
                                    sorted.push({ ...c, displayName: `${p.name} > ${c.name}` });
                                });
                            });
                            const orphans = subs.filter(s => !parents.some(p => Number(p.id) === Number(s.parent_id)));
                            orphans.forEach(s => {
                                sorted.push({ ...s, displayName: `Orphan > ${s.name}` });
                            });
                            return sorted.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.displayName || c.name}
                                </option>
                            ));
                        })()}
                    </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Stock Level</label>
                    <select 
                        value={selectedStock} 
                        onChange={(e) => handleStockChange(e.target.value)}
                        style={{
                            background: "#ffffff",
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
                            background: "#ffffff",
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

                <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignSelf: "flex-end" }}>
                    <button 
                        onClick={handleClearAllFilters}
                        className="btn btn-secondary"
                        style={{ 
                            padding: "10px 20px", 
                            borderRadius: "8px", 
                            fontSize: "0.85rem", 
                            fontWeight: 600, 
                            height: "41px", 
                            display: "inline-flex", 
                            alignItems: "center", 
                            gap: "8px",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><polyline points="16 3 21 8 16 13"></polyline><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><polyline points="8 21 3 16 8 11"></polyline></svg>
                        Clear Filters
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>Loading products...</div>
            ) : (
                <>
                    <div className="card" style={{ overflow: "hidden" }}>
                        <div style={{ overflowX: "auto", width: "100%", WebkitOverflowScrolling: "touch" }}>
                            <table style={{ width: "100%", minWidth: "1100px", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                    <th style={{ padding: "16px 24px", width: "50px" }}>
                                        <input 
                                            type="checkbox" 
                                            checked={products.length > 0 && selectedProductIds.length === products.length}
                                            onChange={handleSelectAll}
                                            style={{ cursor: "pointer" }}
                                        />
                                    </th>
                                    <th style={{ padding: "16px 24px", fontWeight: 600 }}>Product Name</th>
                                    <th style={{ padding: "16px 24px", fontWeight: 600 }}>Selling Price</th>
                                    <th style={{ padding: "16px 24px", fontWeight: 600 }}>Discounted Price</th>
                                    <th style={{ padding: "16px 24px", fontWeight: 600 }}>Purchase Price</th>
                                    <th style={{ padding: "16px 24px", fontWeight: 600 }}>Purchased From</th>
                                    <th style={{ padding: "16px 24px", fontWeight: 600 }}>Stock</th>
                                    <th style={{ padding: "16px 24px", fontWeight: 600 }}>Category</th>
                                    <th style={{ padding: "16px 24px", fontWeight: 600 }}>Visibility</th>
                                    <th style={{ padding: "16px 24px", fontWeight: 600, textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {products.length > 0 ? products.map((p) => (
                                    <tr key={p.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
                                        <td style={{ padding: "16px 24px" }}>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedProductIds.includes(p.id)}
                                                onChange={(e) => handleSelectOne(e, p.id)}
                                                style={{ cursor: "pointer" }}
                                            />
                                        </td>
                                        <td style={{ padding: "16px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
                                            <div style={{ width: "40px", height: "40px", borderRadius: "8px", overflow: "hidden", background: "#1e2130" }}>
                                                <img src={p.image_url ? p.image_url.split(",")[0].trim() : "/placeholder.png"} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={p.name} />
                                            </div>
                                            <span style={{ fontWeight: 500 }}>{p.name}</span>
                                        </td>
                                        <td style={{ padding: "16px 24px", fontWeight: 600, color: "var(--text-main)" }}>₹{p.price}</td>
                                        <td style={{ padding: "16px 24px", color: p.discounted_price ? "var(--text-main)" : "var(--text-muted)" }}>
                                            {p.discounted_price ? `₹${p.discounted_price}` : "-"}
                                        </td>
                                        <td style={{ padding: "16px 24px", color: p.purchase_price ? "var(--text-main)" : "var(--text-muted)" }}>
                                            {p.purchase_price ? `₹${p.purchase_price}` : "-"}
                                        </td>
                                        <td style={{ padding: "16px 24px", color: p.purchased_from ? "var(--text-main)" : "var(--text-muted)" }}>
                                            {p.purchased_from || "-"}
                                        </td>
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
                                        <td colSpan="9" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                                            No products found matching the criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        </div>
                    </div>

                    {/* Sleek circular boutique pagination selector */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
                            {page > 1 && (
                                <button
                                    onClick={() => changePage(page - 1)}
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
                                        onClick={() => changePage(p)}
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
                                    onClick={() => changePage(page + 1)}
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
