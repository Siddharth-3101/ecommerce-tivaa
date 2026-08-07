"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

export default function AttributesMasterPage() {
    const [attributesList, setAttributesList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [initLoading, setInitLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [importing, setImporting] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAttribute, setEditingAttribute] = useState(null);
    const [isCodeManual, setIsCodeManual] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        description: "",
        level: "Universal",
        category_id: "",
        subcategory_id: "",
        control_type: "Dropdown",
        display_order: "0",
        status: "Active",
        show_in_filter: true,
        allow_multiple_values: false
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [attrRes, catRes] = await Promise.all([
                api.get("/admin/attributes"),
                api.get("/categories")
            ]);
            setAttributesList(attrRes.data || []);
            setCategories(catRes.data || []);
        } catch (err) {
            console.error("Error loading attributes initial data:", err);
        } finally {
            setInitLoading(false);
        }
    };

    const fetchAttributes = async () => {
        try {
            const res = await api.get("/admin/attributes");
            setAttributesList(res.data || []);
        } catch (err) {
            console.error("Error fetching attributes:", err);
        }
    };

    const handleDownloadCSV = async () => {
        try {
            const headers = ["id", "name", "code", "description", "level", "category_id", "subcategory_id", "control_type", "display_order", "status", "show_in_filter", "allow_multiple_values"];
            const headerLine = headers.join(",");
            const rowLines = attributesList.map(attr => 
                headers.map(h => {
                    const val = attr[h] === null || attr[h] === undefined ? "" : String(attr[h]);
                    return `"${val.replace(/"/g, '""')}"`;
                }).join(",")
            );
            const csvContent = [headerLine, ...rowLines].join("\n");
            
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "attributes_export.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error(err);
            alert("Failed to export attributes.");
        }
    };

    const handleImportCSV = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target.result;
            const lines = text.split(/\r?\n/).filter(line => line.trim());
            if (lines.length <= 1) {
                alert("Empty or invalid CSV file.");
                return;
            }

            const parseCSVLine = (line) => {
                const result = [];
                let current = "";
                let inQuotes = false;
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    if (char === '"') {
                        if (inQuotes && line[i + 1] === '"') {
                            current += '"';
                            i++;
                        } else {
                            inQuotes = !inQuotes;
                        }
                    } else if (char === ',' && !inQuotes) {
                        result.push(current);
                        current = "";
                    } else {
                        current += char;
                    }
                }
                result.push(current);
                return result;
            };

            const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
            const records = [];

            for (let i = 1; i < lines.length; i++) {
                const values = parseCSVLine(lines[i]);
                if (values.length < headers.length) continue;
                
                const record = {};
                headers.forEach((header, index) => {
                    record[header] = values[index];
                });
                records.push(record);
            }

            if (records.length === 0) {
                alert("No valid rows found in CSV.");
                return;
            }

            setImporting(true);
            try {
                const res = await api.post("/admin/attributes/bulk", records);
                alert(res.data?.message || "Import completed successfully.");
                await fetchAttributes();
            } catch (err) {
                console.error("CSV import failed:", err);
                alert(err.response?.data?.message || "Failed to import CSV. Please verify formatting.");
            } finally {
                setImporting(false);
                e.target.value = "";
            }
        };
        reader.readAsText(file);
    };

    // Helper to sanitize code names (e.g., "Color Option-1" -> "COLOR_OPTION_1")
    const sanitizeCode = (str) => {
        if (!str) return "";
        return str
            .toUpperCase()
            .replace(/[^A-Z0-9\s\-_]/g, "") // remove special chars except space, hyphen, underscore
            .replace(/[\s\-]+/g, "_")       // replace space/hyphen with underscore
            .replace(/^_+|_+$/g, "");        // trim leading/trailing underscores
    };

    const handleNameChange = (e) => {
        const val = e.target.value;
        setFormData(prev => {
            const updated = { ...prev, name: val };
            if (!isCodeManual) {
                updated.code = sanitizeCode(val);
            }
            return updated;
        });
    };

    const handleCodeChange = (e) => {
        const val = e.target.value;
        setIsCodeManual(true);
        setFormData(prev => ({
            ...prev,
            code: val.toUpperCase()
        }));
    };

    const handleLevelChange = (e) => {
        const levelVal = e.target.value;
        setFormData(prev => ({
            ...prev,
            level: levelVal,
            category_id: "",
            subcategory_id: ""
        }));
    };

    const handleCategoryChange = (e) => {
        const catVal = e.target.value;
        setFormData(prev => ({
            ...prev,
            category_id: catVal,
            subcategory_id: ""
        }));
    };

    const handleOpenAddModal = () => {
        setEditingAttribute(null);
        setIsCodeManual(false);
        setFormData({
            name: "",
            code: "",
            description: "",
            level: "Universal",
            category_id: "",
            subcategory_id: "",
            control_type: "Dropdown",
            display_order: "0",
            status: "Active",
            show_in_filter: true,
            allow_multiple_values: false
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        setEditingAttribute(item);
        setIsCodeManual(true);
        setFormData({
            name: item.name || "",
            code: item.code || "",
            description: item.description || "",
            level: item.level || "Universal",
            category_id: item.category_id !== null && item.category_id !== undefined ? String(item.category_id) : "",
            subcategory_id: item.subcategory_id !== null && item.subcategory_id !== undefined ? String(item.subcategory_id) : "",
            control_type: item.control_type || "Dropdown",
            display_order: item.display_order !== undefined && item.display_order !== null ? String(item.display_order) : "0",
            status: item.status || "Active",
            show_in_filter: item.show_in_filter !== undefined ? (item.show_in_filter === 1 || item.show_in_filter === true || String(item.show_in_filter).toLowerCase() === 'true' || String(item.show_in_filter) === '1') : true,
            allow_multiple_values: item.allow_multiple_values !== undefined ? (item.allow_multiple_values === 1 || item.allow_multiple_values === true || String(item.allow_multiple_values).toLowerCase() === 'true' || String(item.allow_multiple_values) === '1') : false
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAttribute(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            alert("Attribute name is required");
            return;
        }

        const attributeCode = sanitizeCode(formData.code || formData.name);
        if (!attributeCode) {
            alert("Attribute code is invalid");
            return;
        }

        if ((formData.level === "Category" || formData.level === "Subcategory") && !formData.category_id) {
            alert("Category is required for Category/Subcategory level");
            return;
        }

        if (formData.level === "Subcategory" && !formData.subcategory_id) {
            alert("Subcategory is required for Subcategory level");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: formData.name.trim(),
                code: attributeCode,
                description: formData.description.trim() || null,
                level: formData.level,
                category_id: (formData.level === "Category" || formData.level === "Subcategory") ? parseInt(formData.category_id) : null,
                subcategory_id: formData.level === "Subcategory" ? parseInt(formData.subcategory_id) : null,
                control_type: formData.control_type,
                display_order: parseInt(formData.display_order) || 0,
                status: formData.status,
                show_in_filter: formData.show_in_filter,
                allow_multiple_values: formData.allow_multiple_values
            };

            if (editingAttribute) {
                await api.put(`/admin/attributes/${editingAttribute.id}`, payload);
            } else {
                await api.post("/admin/attributes", payload);
            }
            handleCloseModal();
            await fetchAttributes();
        } catch (err) {
            console.error("Failed to save attribute:", err);
            alert(err.response?.data?.message || "Failed to save attribute");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Are you sure you want to delete the Attribute "${name}"? This will delete all its values as well.`)) return;
        try {
            await api.delete(`/admin/attributes/${id}`);
            await fetchAttributes();
        } catch (err) {
            console.error("Failed to delete attribute:", err);
            alert(err.response?.data?.message || "Failed to delete attribute");
        }
    };

    // Filter categories into parents and sub-categories
    const parentCategories = categories.filter(c => !c.parent_id);
    const subCategories = categories.filter(c => c.parent_id && String(c.parent_id) === String(formData.category_id));

    // Filter attributes by search query
    const filteredAttributes = attributesList.filter(item => {
        const query = searchQuery.toLowerCase();
        return (
            item.name?.toLowerCase().includes(query) ||
            item.code?.toLowerCase().includes(query) ||
            item.level?.toLowerCase().includes(query) ||
            item.control_type?.toLowerCase().includes(query) ||
            item.category_name?.toLowerCase().includes(query) ||
            item.subcategory_name?.toLowerCase().includes(query) ||
            item.status?.toLowerCase().includes(query)
        );
    });

    if (initLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '350px' }}>
                <span style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(0,0,0,0.1)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "1150px", margin: "0 auto" }}>
            
            {/* Header section */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                        <span style={{ background: "var(--accent-glow)", color: "var(--accent)", padding: "4px 10px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Masters</span>
                        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--text-main)", margin: 0 }}>Attributes Master</h1>
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: 0 }}>
                        Manage product specifications, parameters and classification attributes.
                    </p>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button
                        onClick={handleDownloadCSV}
                        className="btn btn-secondary"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 18px",
                            fontSize: "0.95rem",
                            fontWeight: 600,
                            borderRadius: "10px",
                            background: "#ffffff",
                            border: "1px solid var(--border)",
                            color: "var(--text-main)",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)",
                            cursor: "pointer"
                        }}
                    >
                        Download CSV
                    </button>
                    
                    <label
                        htmlFor="attributes-csv-upload"
                        className="btn btn-secondary"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 18px",
                            fontSize: "0.95rem",
                            fontWeight: 600,
                            borderRadius: "10px",
                            background: "#ffffff",
                            border: "1px solid var(--border)",
                            color: "var(--text-main)",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)",
                            cursor: "pointer",
                            margin: 0
                        }}
                    >
                        Import CSV
                    </label>
                    <input
                        id="attributes-csv-upload"
                        type="file"
                        accept=".csv"
                        onChange={handleImportCSV}
                        style={{ display: "none" }}
                        disabled={importing}
                    />

                    <button
                        onClick={handleOpenAddModal}
                        className="btn btn-primary"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 20px",
                            fontSize: "0.95rem",
                            fontWeight: 600,
                            borderRadius: "10px",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                            cursor: "pointer"
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Attribute
                    </button>
                </div>
            </div>

            {/* Search and Stats Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: "1", minWidth: "260px", maxWidth: "420px" }}>
                    <input
                        type="text"
                        placeholder="Search attributes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px 16px 10px 40px",
                            borderRadius: "10px",
                            border: "1px solid var(--border)",
                            background: "var(--bg)",
                            color: "var(--text-main)",
                            fontSize: "0.9rem"
                        }}
                    />
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>

                <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 500 }}>
                    Showing <strong style={{ color: "var(--text-main)" }}>{filteredAttributes.length}</strong> of <strong style={{ color: "var(--text-main)" }}>{attributesList.length}</strong> Attributes
                </div>
            </div>

            {/* Grid Table Card */}
            <div style={{ background: "var(--bg-card)", borderRadius: "14px", border: "1px solid var(--border)", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.92rem" }}>
                    <thead>
                        <tr style={{ background: "rgba(0,0,0,0.02)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            <th style={{ padding: "14px 20px" }}>Attribute</th>
                            <th style={{ padding: "14px 20px", width: "120px" }}>Level</th>
                            <th style={{ padding: "14px 20px" }}>Category</th>
                            <th style={{ padding: "14px 20px" }}>Subcategory</th>
                            <th style={{ padding: "14px 20px", width: "150px" }}>Control Type</th>
                            <th style={{ padding: "14px 20px", width: "120px" }}>Display Order</th>
                            <th style={{ padding: "14px 20px", width: "130px" }}>Show In Filter</th>
                            <th style={{ padding: "14px 20px", width: "130px" }}>Allow Multiple</th>
                            <th style={{ padding: "14px 20px", width: "110px" }}>Status</th>
                            <th style={{ padding: "14px 20px", width: "180px", textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAttributes.length === 0 ? (
                            <tr>
                                <td colSpan="10" style={{ padding: "48px 20px", textAlign: "center", color: "var(--text-muted)" }}>
                                    <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>📋</div>
                                    <p style={{ margin: 0, fontWeight: 500 }}>No attributes found.</p>
                                    {searchQuery && <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>Try clearing your search query.</p>}
                                </td>
                            </tr>
                        ) : (
                            filteredAttributes.map((item) => (
                                <tr key={item.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s ease" }}>
                                    <td style={{ padding: "16px 20px" }}>
                                        <div style={{ fontWeight: 700, color: "var(--text-main)" }}>{item.name}</div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>{item.code}</div>
                                    </td>
                                    <td style={{ padding: "16px 20px" }}>
                                        <span style={{
                                            display: "inline-block",
                                            padding: "3px 8px",
                                            borderRadius: "6px",
                                            fontSize: "0.8rem",
                                            fontWeight: 600,
                                            background: item.level === "Universal" ? "rgba(15, 157, 148, 0.1)" : item.level === "Category" ? "rgba(59, 130, 246, 0.1)" : "rgba(139, 92, 246, 0.1)",
                                            color: item.level === "Universal" ? "var(--accent)" : item.level === "Category" ? "#3b82f6" : "#8b5cf6",
                                        }}>
                                            {item.level}
                                        </span>
                                    </td>
                                    <td style={{ padding: "16px 20px", color: "var(--text-main)", fontWeight: 500 }}>
                                        {item.category_name || "-"}
                                    </td>
                                    <td style={{ padding: "16px 20px", color: "var(--text-main)", fontWeight: 500 }}>
                                        {item.subcategory_name || "-"}
                                    </td>
                                    <td style={{ padding: "16px 20px", color: "var(--text-muted)" }}>
                                        {item.control_type}
                                    </td>
                                    <td style={{ padding: "16px 20px", color: "var(--text-muted)", fontWeight: 600 }}>
                                        {item.display_order}
                                    </td>
                                    <td style={{ padding: "16px 20px" }}>
                                        <span style={{
                                            display: "inline-block",
                                            padding: "4px 10px",
                                            borderRadius: "20px",
                                            fontSize: "0.82rem",
                                            fontWeight: 700,
                                            background: item.show_in_filter ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                                            color: item.show_in_filter ? "var(--success)" : "var(--danger)",
                                            border: item.show_in_filter ? "1px solid rgba(34, 197, 94, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)"
                                        }}>
                                            {item.show_in_filter ? "Yes" : "No"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "16px 20px" }}>
                                        <span style={{
                                            display: "inline-block",
                                            padding: "4px 10px",
                                            borderRadius: "20px",
                                            fontSize: "0.82rem",
                                            fontWeight: 700,
                                            background: item.allow_multiple_values ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                                            color: item.allow_multiple_values ? "var(--success)" : "var(--danger)",
                                            border: item.allow_multiple_values ? "1px solid rgba(34, 197, 94, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)"
                                        }}>
                                            {item.allow_multiple_values ? "Yes" : "No"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "16px 20px" }}>
                                        <span style={{
                                            display: "inline-block",
                                            padding: "4px 10px",
                                            borderRadius: "20px",
                                            fontSize: "0.82rem",
                                            fontWeight: 700,
                                            background: item.status === "Active" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                                            color: item.status === "Active" ? "var(--success)" : "var(--danger)",
                                            border: item.status === "Active" ? "1px solid rgba(34, 197, 94, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)"
                                        }}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                            <button
                                                onClick={() => handleOpenEditModal(item)}
                                                style={{
                                                    background: "transparent",
                                                    border: "1px solid var(--border)",
                                                    borderRadius: "8px",
                                                    padding: "6px 10px",
                                                    color: "var(--text-main)",
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                    fontSize: "0.82rem"
                                                }}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => handleDelete(item.id, item.name)}
                                                style={{
                                                    background: "rgba(239, 68, 68, 0.08)",
                                                    border: "1px solid rgba(239, 68, 68, 0.2)",
                                                    borderRadius: "8px",
                                                    padding: "6px 10px",
                                                    color: "#ef4444",
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                    fontSize: "0.82rem"
                                                }}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add / Edit Attribute Modal */}
            {isModalOpen && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    padding: "20px"
                }}>
                    <div style={{
                        background: "var(--bg-card)",
                        borderRadius: "16px",
                        border: "1px solid var(--border)",
                        width: "100%",
                        maxWidth: "540px",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        padding: "28px",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
                                {editingAttribute ? "Edit Attribute" : "Add New Attribute"}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: "16px" }}>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                                    Attribute Name <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Color, Occasion, Material"
                                    value={formData.name}
                                    onChange={handleNameChange}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "10px 14px",
                                        borderRadius: "8px",
                                        border: "1px solid var(--border)",
                                        background: "var(--bg)",
                                        color: "var(--text-main)",
                                        fontSize: "0.95rem"
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: "16px" }}>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                                    Attribute Code <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. COLOR, OCCASION"
                                    value={formData.code}
                                    onChange={handleCodeChange}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "10px 14px",
                                        borderRadius: "8px",
                                        border: "1px solid var(--border)",
                                        background: "var(--bg)",
                                        color: "var(--text-main)",
                                        fontSize: "0.95rem"
                                    }}
                                />
                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                                    Alphanumeric uppercase and underscores. Auto-generated from name if untouched.
                                </span>
                            </div>

                            <div style={{ marginBottom: "16px" }}>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                                    Description
                                </label>
                                <textarea
                                    placeholder="Optional description of this attribute"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="2"
                                    style={{
                                        width: "100%",
                                        padding: "10px 14px",
                                        borderRadius: "8px",
                                        border: "1px solid var(--border)",
                                        background: "var(--bg)",
                                        color: "var(--text-main)",
                                        fontSize: "0.95rem",
                                        resize: "vertical"
                                    }}
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                                        Attribute Level <span style={{ color: "#ef4444" }}>*</span>
                                    </label>
                                    <select
                                        value={formData.level}
                                        onChange={handleLevelChange}
                                        style={{
                                            width: "100%",
                                            padding: "10px 14px",
                                            borderRadius: "8px",
                                            border: "1px solid var(--border)",
                                            background: "var(--bg)",
                                            color: "var(--text-main)",
                                            fontSize: "0.95rem"
                                        }}
                                    >
                                        <option value="Universal">Universal</option>
                                        <option value="Category">Category</option>
                                        <option value="Subcategory">Subcategory</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                                        Control Type <span style={{ color: "#ef4444" }}>*</span>
                                    </label>
                                    <select
                                        value={formData.control_type}
                                        onChange={(e) => setFormData({ ...formData, control_type: e.target.value })}
                                        style={{
                                            width: "100%",
                                            padding: "10px 14px",
                                            borderRadius: "8px",
                                            border: "1px solid var(--border)",
                                            background: "var(--bg)",
                                            color: "var(--text-main)",
                                            fontSize: "0.95rem"
                                        }}
                                    >
                                        <option value="Dropdown">Dropdown</option>
                                        <option value="Multi Select">Multi Select</option>
                                        <option value="Text">Text</option>
                                        <option value="Number">Number</option>
                                        <option value="Yes/No">Yes/No</option>
                                        <option value="Color Palette">Color Palette</option>
                                    </select>
                                </div>
                            </div>

                            {/* Level-based fields */}
                            {(formData.level === "Category" || formData.level === "Subcategory") && (
                                <div style={{ marginBottom: "16px" }}>
                                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                                        Category <span style={{ color: "#ef4444" }}>*</span>
                                    </label>
                                    <select
                                        value={formData.category_id}
                                        onChange={handleCategoryChange}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "10px 14px",
                                            borderRadius: "8px",
                                            border: "1px solid var(--border)",
                                            background: "var(--bg)",
                                            color: "var(--text-main)",
                                            fontSize: "0.95rem"
                                        }}
                                    >
                                        <option value="">Select a Category...</option>
                                        {parentCategories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {formData.level === "Subcategory" && (
                                <div style={{ marginBottom: "16px" }}>
                                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                                        Subcategory <span style={{ color: "#ef4444" }}>*</span>
                                    </label>
                                    <select
                                        value={formData.subcategory_id}
                                        onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })}
                                        required
                                        disabled={!formData.category_id}
                                        style={{
                                            width: "100%",
                                            padding: "10px 14px",
                                            borderRadius: "8px",
                                            border: "1px solid var(--border)",
                                            background: "var(--bg)",
                                            color: "var(--text-main)",
                                            fontSize: "0.95rem",
                                            opacity: formData.category_id ? 1 : 0.6
                                        }}
                                    >
                                        <option value="">
                                            {!formData.category_id ? "Select a parent category first..." : "Select a Subcategory..."}
                                        </option>
                                        {subCategories.map(sub => (
                                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.display_order}
                                        onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                                        min="0"
                                        style={{
                                            width: "100%",
                                            padding: "10px 14px",
                                            borderRadius: "8px",
                                            border: "1px solid var(--border)",
                                            background: "var(--bg)",
                                            color: "var(--text-main)",
                                            fontSize: "0.95rem"
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        style={{
                                            width: "100%",
                                            padding: "10px 14px",
                                            borderRadius: "8px",
                                            border: "1px solid var(--border)",
                                            background: "var(--bg)",
                                            color: "var(--text-main)",
                                            fontSize: "0.95rem"
                                        }}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
                                <input
                                    id="show_in_filter"
                                    type="checkbox"
                                    checked={formData.show_in_filter}
                                    onChange={(e) => setFormData({ ...formData, show_in_filter: e.target.checked })}
                                    style={{
                                        width: "18px",
                                        height: "18px",
                                        cursor: "pointer"
                                    }}
                                />
                                <label htmlFor="show_in_filter" style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-main)", cursor: "pointer", userSelect: "none" }}>
                                    Show in filter
                                </label>
                            </div>

                            <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
                                <input
                                    id="allow_multiple_values"
                                    type="checkbox"
                                    checked={formData.allow_multiple_values}
                                    onChange={(e) => setFormData({ ...formData, allow_multiple_values: e.target.checked })}
                                    style={{
                                        width: "18px",
                                        height: "18px",
                                        cursor: "pointer"
                                    }}
                                />
                                <label htmlFor="allow_multiple_values" style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-main)", cursor: "pointer", userSelect: "none" }}>
                                    Allow Multiple product values
                                </label>
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="btn btn-secondary"
                                    style={{
                                        padding: "10px 18px",
                                        fontSize: "0.95rem",
                                        fontWeight: 600,
                                        borderRadius: "8px"
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                    style={{
                                        padding: "10px 18px",
                                        fontSize: "0.95rem",
                                        fontWeight: 600,
                                        borderRadius: "8px"
                                    }}
                                >
                                    {loading ? "Saving..." : "Save Attribute"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
