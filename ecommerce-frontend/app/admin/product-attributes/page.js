"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import Heading from "@/components/Heading";

export default function ProductAttributesPage() {
    const [productsList, setProductsList] = useState([]);
    const [attributesList, setAttributesList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [initLoading, setInitLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [applicableAttributes, setApplicableAttributes] = useState([]);
    const [selectedValues, setSelectedValues] = useState({}); // { [attribute_id]: [value_ids] }
    const [sourceProductIdInput, setSourceProductIdInput] = useState("");

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [productsRes, attrsRes, categoriesRes] = await Promise.all([
                api.get("/admin/product-attributes"),
                api.get("/admin/attributes"),
                api.get("/categories")
            ]);
            setProductsList(productsRes.data || []);
            setAttributesList(attrsRes.data || []);
            setCategories(categoriesRes.data || []);
        } catch (err) {
            console.error("Error loading product attributes initial data:", err);
        } finally {
            setInitLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await api.get("/admin/product-attributes");
            setProductsList(res.data || []);
        } catch (err) {
            console.error("Error fetching product attributes list:", err);
        }
    };

    const handleOpenEditModal = async (product) => {
        setSelectedProduct(product);
        setLoading(true);

        try {
            // 1. Fetch current mappings for this product
            const mappingsRes = await api.get(`/admin/product-attributes/${product.id}`);
            const currentMappings = mappingsRes.data || [];

            // 2. Filter applicable attributes:
            // - Universal
            // - Matches product's category_id (when level is Category or Subcategory)
            // - Matches product's subcategory_id (when level is Subcategory)
            const filteredAttrs = attributesList.filter(attr => {
                if (attr.status !== "Active") return false;
                if (attr.level === "Universal") return true;
                if (attr.level === "Category") {
                    return Number(attr.category_id) === Number(product.category_id);
                }
                if (attr.level === "Subcategory") {
                    return Number(attr.subcategory_id) === Number(product.subcategory_id);
                }
                return false;
            });

            // 3. For each applicable attribute, fetch its active values
            const valuesPromises = filteredAttrs.map(attr => 
                api.get(`/admin/attribute-values?attribute_id=${attr.id}`)
            );
            const valuesResponses = await Promise.all(valuesPromises);

            const attrsWithValues = filteredAttrs.map((attr, idx) => ({
                ...attr,
                options: (valuesResponses[idx].data || []).filter(o => o.status === "Active")
            }));

            setApplicableAttributes(attrsWithValues);

            // 4. Populate selected values map: { [attribute_id]: [array of selected value ids] }
            const initialSelected = {};
            attrsWithValues.forEach(attr => {
                const matches = currentMappings.filter(m => m.attribute_id === attr.id);
                initialSelected[attr.id] = matches.map(m => m.attribute_value_id);
            });
            setSelectedValues(initialSelected);

            setIsModalOpen(true);
        } catch (err) {
            console.error("Failed to load product attribute mappings:", err);
            alert("Failed to load product attribute mappings.");
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
        setApplicableAttributes([]);
        setSelectedValues({});
        setSourceProductIdInput("");
    };

    const handleCopyAttributes = async () => {
        const srcId = sourceProductIdInput.trim();
        if (!srcId) {
            alert("Please enter a valid source Product ID");
            return;
        }

        setLoading(true);
        try {
            // Fetch mapped attributes for the source product
            const res = await api.get(`/admin/product-attributes/${srcId}`);
            const srcMappings = res.data || [];

            if (srcMappings.length === 0) {
                alert(`Product #${srcId} has no attributes mapped, or the product does not exist.`);
                return;
            }

            // Copy attributes values that match applicableAttributes of the current product
            setSelectedValues(prev => {
                const updated = { ...prev };
                let copiedCount = 0;

                applicableAttributes.forEach(attr => {
                    const matches = srcMappings.filter(m => m.attribute_id === attr.id);
                    if (matches.length > 0) {
                        const valIds = matches.map(m => m.attribute_value_id);
                        const isMultiple = attr.allow_multiple_values === 1 || attr.allow_multiple_values === true;
                        
                        if (!isMultiple && valIds.length > 1) {
                            updated[attr.id] = [valIds[0]];
                        } else {
                            updated[attr.id] = valIds;
                        }
                        copiedCount++;
                    }
                });

                alert(`Successfully matched and copied values for ${copiedCount} attributes from Product #${srcId}.`);
                return updated;
            });
        } catch (err) {
            console.error("Failed to copy product attributes:", err);
            alert("Failed to copy attributes. Please verify the source Product ID.");
        } finally {
            setLoading(false);
        }
    };

    const handleValueToggle = (attributeId, valueId, allowMultiple) => {
        setSelectedValues(prev => {
            const current = prev[attributeId] || [];
            if (allowMultiple) {
                if (current.includes(valueId)) {
                    return { ...prev, [attributeId]: current.filter(id => id !== valueId) };
                } else {
                    return { ...prev, [attributeId]: [...current, valueId] };
                }
            } else {
                // Single select behavior
                if (current.includes(valueId)) {
                    return { ...prev, [attributeId]: [] }; // Toggle off
                } else {
                    return { ...prev, [attributeId]: [valueId] }; // Replace option
                }
            }
        });
    };

    const handleClearAttribute = (attributeId) => {
        setSelectedValues(prev => ({
            ...prev,
            [attributeId]: []
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Flatten selectedValues map into array of { attribute_id, attribute_value_id }
            const mappings = [];
            Object.entries(selectedValues).forEach(([attrId, valIds]) => {
                valIds.forEach(valId => {
                    mappings.push({
                        attribute_id: Number(attrId),
                        attribute_value_id: Number(valId)
                    });
                });
            });

            await api.put(`/admin/product-attributes/${selectedProduct.id}`, { mappings });
            handleCloseModal();
            await fetchProducts();
        } catch (err) {
            console.error("Failed to update product attributes:", err);
            alert(err.response?.data?.message || "Failed to update product attributes");
        } finally {
            setLoading(false);
        }
    };

    // Filter products list based on search query and category
    const filteredProducts = productsList.filter(p => {
        // 1. Search Query filter
        const query = searchQuery.toLowerCase().trim();
        let matchesSearch = true;
        if (query) {
            const matchesName = p.name?.toLowerCase().includes(query);
            const matchesCategoryName = p.category_name?.toLowerCase().includes(query) || p.subcategory_name?.toLowerCase().includes(query);
            const matchesAttr = p.mappedAttributes?.some(m => 
                m.attribute_name?.toLowerCase().includes(query) || 
                m.attribute_value?.toLowerCase().includes(query)
            );
            matchesSearch = matchesName || matchesCategoryName || matchesAttr;
        }

        // 2. Category filter
        let matchesCategory = true;
        if (selectedCategory !== "All") {
            matchesCategory = p.category_name === selectedCategory || p.subcategory_name === selectedCategory;
        }

        return matchesSearch && matchesCategory;
    });

    const renderProductMappedAttributes = (mappedAttrs) => {
        if (!mappedAttrs || mappedAttrs.length === 0) {
            return <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic" }}>None</span>;
        }

        // Group by attribute name
        const grouped = {};
        mappedAttrs.forEach(m => {
            if (!grouped[m.attribute_name]) {
                grouped[m.attribute_name] = [];
            }
            grouped[m.attribute_name].push(m.attribute_value);
        });

        return (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {Object.entries(grouped).map(([attrName, values]) => (
                    <div key={attrName} style={{ 
                        background: "rgba(122, 56, 194, 0.04)", 
                        border: "1px solid rgba(122, 56, 194, 0.12)",
                        borderRadius: "6px",
                        padding: "4px 8px",
                        fontSize: "0.78rem"
                    }}>
                        <strong style={{ color: "var(--accent)" }}>{attrName}:</strong>{" "}
                        <span style={{ color: "var(--text-main)", fontWeight: 500 }}>{values.join(", ")}</span>
                    </div>
                ))}
            </div>
        );
    };

    if (initLoading) {
        return (
            <div className="container" style={{ padding: "40px", display: "flex", justifyContent: "center" }}>
                <span className="loader" style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(0,0,0,0.1)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ padding: "40px max(4%, 20px)", maxWidth: "1600px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <div>
                    <Heading as="h1" variant="h1" style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text-main)" }}>
                        Product Attributes
                    </Heading>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "4px" }}>
                        Manage dynamic specifications and filters for your product catalog.
                    </p>
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
                {/* Search Bar Input */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexGrow: 1, minWidth: "260px" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Search Product Attributes</label>
                    <div style={{ position: "relative" }}>
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search product name, categories, or mapped attributes..."
                            style={{
                                width: "100%",
                                background: "#ffffff",
                                color: "var(--text-main)",
                                border: "1px solid var(--border)",
                                borderRadius: "8px",
                                padding: "10px 36px 10px 16px",
                                fontSize: "0.9rem",
                                outline: "none"
                            }}
                        />
                        {searchQuery && (
                            <button 
                                type="button"
                                onClick={() => setSearchQuery("")}
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
                </div>

                {/* Category Dropdown */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Category</label>
                    <select 
                        value={selectedCategory} 
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{
                            background: "#ffffff",
                            color: "var(--text-main)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            padding: "10px 16px",
                            fontSize: "0.9rem",
                            outline: "none",
                            cursor: "pointer",
                            minWidth: "220px"
                        }}
                    >
                        <option value="All">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                                {cat.parent_name ? `${cat.parent_name} > ${cat.name}` : cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Clear Filter Button */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignSelf: "flex-end" }}>
                    <button 
                        onClick={() => {
                            setSearchQuery("");
                            setSelectedCategory("All");
                        }}
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
                            background: "#ffffff"
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><polyline points="16 3 21 8 16 13"></polyline><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><polyline points="8 21 3 16 8 11"></polyline></svg>
                        Clear Filters
                    </button>
                </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
                <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 500 }}>
                    Showing <strong style={{ color: "var(--text-main)" }}>{filteredProducts.length}</strong> of <strong style={{ color: "var(--text-main)" }}>{productsList.length}</strong> Products
                </div>
            </div>

            {/* Table layout */}
            <div style={{ background: "var(--bg-card)", borderRadius: "14px", border: "1px solid var(--border)", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.92rem" }}>
                    <thead>
                        <tr style={{ background: "rgba(0,0,0,0.02)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            <th style={{ padding: "14px 20px" }}>Product Name</th>
                            <th style={{ padding: "14px 20px", width: "200px" }}>Category</th>
                            <th style={{ padding: "14px 20px", width: "200px" }}>Subcategory</th>
                            <th style={{ padding: "14px 20px" }}>Mapped Attributes</th>
                            <th style={{ padding: "14px 20px", width: "130px", textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: "48px 20px", textAlign: "center", color: "var(--text-muted)" }}>
                                    <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>📦</div>
                                    <p style={{ margin: 0, fontWeight: 500 }}>No products found.</p>
                                    {searchQuery && <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>Try clearing your search query.</p>}
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map((item) => (
                                <tr key={item.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s ease" }}>
                                    <td style={{ padding: "16px 20px" }}>
                                        <div style={{ fontWeight: 700, color: "var(--text-main)" }}>{item.name}</div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>ID: {item.id}</div>
                                    </td>
                                    <td style={{ padding: "16px 20px", color: "var(--text-main)", fontWeight: 500 }}>
                                        {item.category_name || "-"}
                                    </td>
                                    <td style={{ padding: "16px 20px", color: "var(--text-main)", fontWeight: 500 }}>
                                        {item.subcategory_name || "-"}
                                    </td>
                                    <td style={{ padding: "16px 20px" }}>
                                        {renderProductMappedAttributes(item.mappedAttributes)}
                                    </td>
                                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                                        <button
                                            onClick={() => handleOpenEditModal(item)}
                                            style={{
                                                background: "transparent",
                                                border: "1px solid var(--border)",
                                                borderRadius: "8px",
                                                padding: "6px 12px",
                                                color: "var(--accent)",
                                                borderColor: "rgba(122, 56, 194, 0.2)",
                                                cursor: "pointer",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                fontWeight: 600,
                                                fontSize: "0.82rem"
                                            }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Mappings Modal Overlay */}
            {isModalOpen && selectedProduct && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(0, 0, 0, 0.4)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1100
                }}>
                    <div style={{
                        background: "#ffffff",
                        borderRadius: "16px",
                        width: "100%",
                        maxWidth: "680px",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                        display: "flex",
                        flexDirection: "column"
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: "20px 24px",
                            borderBottom: "1px solid var(--border)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "16px",
                            flexWrap: "wrap"
                        }}>
                            <div>
                                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, color: "var(--accent)" }}>Product Attributes</span>
                                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-main)", margin: "4px 0 0 0" }}>{selectedProduct.name}</h2>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "auto" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "8px", padding: "4px 8px" }}>
                                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", whiteSpace: "nowrap" }}>Copy from ID:</span>
                                    <input 
                                        type="text" 
                                        placeholder="Product ID" 
                                        value={sourceProductIdInput}
                                        onChange={(e) => setSourceProductIdInput(e.target.value)}
                                        style={{ 
                                            width: "100px", 
                                            border: "1px solid var(--border)", 
                                            borderRadius: "4px", 
                                            padding: "2px 6px", 
                                            fontSize: "0.8rem",
                                            background: "#ffffff",
                                            color: "var(--text-main)",
                                            outline: "none"
                                        }}
                                    />
                                    <button 
                                        type="button"
                                        onClick={handleCopyAttributes}
                                        style={{ 
                                            background: "var(--accent)", 
                                            color: "#ffffff", 
                                            border: "none", 
                                            borderRadius: "4px", 
                                            padding: "3px 10px", 
                                            fontSize: "0.75rem", 
                                            fontWeight: 700, 
                                            cursor: "pointer",
                                            transition: "opacity 0.2s"
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
                                        onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
                                    >
                                        Apply
                                    </button>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", padding: "4px" }}
                                >
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} style={{ padding: "24px", overflowY: "auto", flexGrow: 1 }}>
                            <div style={{ background: "var(--bg)", padding: "12px 16px", borderRadius: "8px", marginBottom: "24px", border: "1px solid var(--border)" }}>
                                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                                    Only attributes matching this product's hierarchy level apply: 
                                    <strong> Universal</strong>, 
                                    {selectedProduct.category_name ? <span> Category: <strong>{selectedProduct.category_name}</strong></span> : ""}
                                    {selectedProduct.subcategory_name ? <span>, Subcategory: <strong>{selectedProduct.subcategory_name}</strong></span> : ""}.
                                </span>
                            </div>

                            {applicableAttributes.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                                    <div style={{ fontSize: "2rem", marginBottom: "8px" }}>⚠️</div>
                                    <p style={{ fontWeight: 600 }}>No attributes apply to this product.</p>
                                    <p style={{ fontSize: "0.82rem", marginTop: "4px" }}>Please verify product category selection, or configure active attributes.</p>
                                </div>
                            ) : (
                                applicableAttributes.map(attr => {
                                    const isMultiple = attr.allow_multiple_values === 1 || attr.allow_multiple_values === true;
                                    const currentSelected = selectedValues[attr.id] || [];

                                    return (
                                        <div key={attr.id} style={{ marginBottom: "28px", paddingBottom: "24px", borderBottom: "1px solid var(--border)" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                                <div>
                                                    <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-main)" }}>
                                                        {attr.name}
                                                    </span>
                                                    <span style={{ 
                                                        marginLeft: "8px", 
                                                        fontSize: "0.72rem", 
                                                        color: "var(--text-muted)", 
                                                        background: "rgba(0,0,0,0.03)", 
                                                        padding: "2px 6px", 
                                                        borderRadius: "4px",
                                                        fontWeight: 600
                                                    }}>
                                                        {attr.level} • {isMultiple ? "Allow Multiple" : "Single Selection"}
                                                    </span>
                                                </div>
                                                {currentSelected.length > 0 && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleClearAttribute(attr.id)}
                                                        style={{ background: "transparent", border: "none", color: "var(--danger)", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                                                    >
                                                        Clear
                                                    </button>
                                                )}
                                            </div>

                                            {attr.options.length === 0 ? (
                                                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                                                    No options defined. Add options in <Link href="/admin/attribute-values" style={{ color: "var(--accent)", fontWeight: 600 }}>Attribute Values</Link>.
                                                </span>
                                            ) : (
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                                                    {attr.options.map(opt => {
                                                        const isSelected = currentSelected.includes(opt.id);
                                                        const isColor = attr.control_type === "Color Palette";

                                                        return (
                                                            <button
                                                                key={opt.id}
                                                                type="button"
                                                                onClick={() => handleValueToggle(attr.id, opt.id, isMultiple)}
                                                                style={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "8px",
                                                                    padding: "8px 14px",
                                                                    borderRadius: "50px",
                                                                    border: isSelected 
                                                                        ? "2px solid var(--accent)" 
                                                                        : "1px solid var(--border)",
                                                                    background: isSelected 
                                                                        ? "var(--accent-glow)" 
                                                                        : "var(--bg-card)",
                                                                    color: isSelected 
                                                                        ? "var(--accent)" 
                                                                        : "var(--text-main)",
                                                                    cursor: "pointer",
                                                                    fontWeight: 600,
                                                                    fontSize: "0.82rem",
                                                                    transition: "all 0.2s"
                                                                }}
                                                            >
                                                                {isColor && (
                                                                    <span style={{ 
                                                                        width: "12px", 
                                                                        height: "12px", 
                                                                        borderRadius: "50%", 
                                                                        background: opt.code, 
                                                                        border: "1px solid rgba(0,0,0,0.12)",
                                                                        display: "inline-block" 
                                                                    }} />
                                                                )}
                                                                {opt.value}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}

                            {/* Actions */}
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="btn btn-secondary"
                                    style={{ padding: "10px 18px", fontSize: "0.95rem", fontWeight: 600, borderRadius: "8px" }}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ padding: "10px 24px", fontSize: "0.95rem", fontWeight: 600, borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px" }}
                                    disabled={loading || applicableAttributes.length === 0}
                                >
                                    {loading && <span className="loader" style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '50%', borderTopColor: '#ffffff', animation: 'spin 1s ease-in-out infinite' }}></span>}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
