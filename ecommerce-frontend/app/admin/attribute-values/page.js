"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

export default function AttributeValuesMasterPage() {
    const [attributes, setAttributes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedAttributeId, setSelectedAttributeId] = useState("");
    const [valuesList, setValuesList] = useState([]);
    
    // Loadings
    const [initLoading, setInitLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [gridLoading, setGridLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    
    // Filters & Searches
    const [searchQuery, setSearchQuery] = useState("");
    const [levelFilter, setLevelFilter] = useState("All");
    const [gridSearchQuery, setGridSearchQuery] = useState("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingValue, setEditingValue] = useState(null);
    const [isCodeManual, setIsCodeManual] = useState(false);
    const [formData, setFormData] = useState({
        value: "",
        code: "",
        display_order: "0",
        status: "Active"
    });

    // Collapsible Groups state (default true for open)
    const [expandedGroups, setExpandedGroups] = useState({
        universal: true
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedAttributeId) {
            fetchValues(selectedAttributeId);
        } else {
            setValuesList([]);
        }
    }, [selectedAttributeId]);

    // Auto-highlight/select first match when search query changes
    useEffect(() => {
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const matched = attributes.filter(a => {
                // Apply level filter first
                if (levelFilter !== "All" && a.level !== levelFilter) return false;
                return a.name.toLowerCase().includes(query) || a.code.toLowerCase().includes(query);
            });

            if (matched.length > 0) {
                const isStillMatched = matched.some(m => String(m.id) === String(selectedAttributeId));
                if (!isStillMatched) {
                    setSelectedAttributeId(String(matched[0].id));
                }
            }
        }
    }, [searchQuery, levelFilter, attributes]);

    const fetchInitialData = async () => {
        try {
            const [attrRes, catRes] = await Promise.all([
                api.get("/admin/attributes"),
                api.get("/categories")
            ]);
            // Only list Active attributes
            const activeAttrs = (attrRes.data || []).filter(attr => attr.status === "Active");
            setAttributes(activeAttrs);
            setCategories(catRes.data || []);

            // Auto-select the first attribute if available
            if (activeAttrs.length > 0) {
                setSelectedAttributeId(String(activeAttrs[0].id));
            }
        } catch (err) {
            console.error("Error loading attribute values initial data:", err);
        } finally {
            setInitLoading(false);
        }
    };

    const fetchValues = async (attributeId) => {
        setGridLoading(true);
        try {
            const res = await api.get(`/admin/attribute-values?attribute_id=${attributeId}`);
            setValuesList(res.data || []);
        } catch (err) {
            console.error("Error fetching attribute values:", err);
            setValuesList([]);
        } finally {
            setGridLoading(false);
        }
    };

    const handleDownloadCSV = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/attribute-values");
            const allValues = res.data || [];
            
            const headers = ["id", "attribute_code", "value", "code", "display_order", "status"];
            const headerLine = headers.join(",");
            const rowLines = allValues.map(item => 
                headers.map(h => {
                    const val = item[h] === null || item[h] === undefined ? "" : String(item[h]);
                    return `"${val.replace(/"/g, '""')}"`;
                }).join(",")
            );
            const csvContent = [headerLine, ...rowLines].join("\n");
            
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "all_attribute_values_export.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Failed to export all attribute values:", err);
            alert("Failed to export values.");
        } finally {
            setLoading(false);
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
                
                // If neither attribute_code nor attribute_id is provided, default to currently selected attribute code or ID
                if (!record.attribute_code && !record.attribute_id && selectedAttributeId) {
                    const selectedAttr = attributes.find(a => String(a.id) === String(selectedAttributeId));
                    if (selectedAttr && selectedAttr.code) {
                        record.attribute_code = selectedAttr.code;
                    } else {
                        record.attribute_id = selectedAttributeId;
                    }
                }
                records.push(record);
            }

            if (records.length === 0) {
                alert("No valid rows found in CSV.");
                return;
            }

            setImporting(true);
            try {
                const res = await api.post("/admin/attribute-values/bulk", records);
                alert(res.data?.message || "Import completed successfully.");
                if (selectedAttributeId) {
                    await fetchValues(selectedAttributeId);
                }
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

    const sanitizeCode = (str) => {
        if (!str) return "";
        return str
            .toUpperCase()
            .replace(/[^A-Z0-9\s\-_#]/g, "") // allow # for hex color codes
            .replace(/[\s\-]+/g, "_")       // replace space/hyphen with underscore
            .replace(/^_+|_+$/g, "");        // trim leading/trailing underscores
    };

    const handleValueChange = (e) => {
        const val = e.target.value;
        setFormData(prev => {
            const updated = { ...prev, value: val };
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

    const handleOpenAddModal = () => {
        if (!selectedAttributeId) {
            alert("Please select an attribute first");
            return;
        }
        setEditingValue(null);
        setIsCodeManual(false);
        setFormData({
            value: "",
            code: "",
            display_order: "0",
            status: "Active"
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        setEditingValue(item);
        setIsCodeManual(true);
        setFormData({
            value: item.value || "",
            code: item.code || "",
            display_order: item.display_order !== undefined && item.display_order !== null ? String(item.display_order) : "0",
            status: item.status || "Active"
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingValue(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedAttributeId) {
            alert("Attribute must be selected");
            return;
        }
        if (!formData.value.trim()) {
            alert("Value is required");
            return;
        }

        const valueCode = sanitizeCode(formData.code || formData.value);
        if (!valueCode) {
            alert("Value code is invalid");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                attribute_id: parseInt(selectedAttributeId),
                value: formData.value.trim(),
                code: valueCode,
                display_order: parseInt(formData.display_order) || 0,
                status: formData.status
            };

            if (editingValue) {
                await api.put(`/admin/attribute-values/${editingValue.id}`, payload);
            } else {
                await api.post("/admin/attribute-values", payload);
            }
            handleCloseModal();
            await fetchValues(selectedAttributeId);
        } catch (err) {
            console.error("Failed to save attribute value:", err);
            alert(err.response?.data?.message || "Failed to save attribute value");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Are you sure you want to delete the Value "${name}"?`)) return;
        try {
            await api.delete(`/admin/attribute-values/${id}`);
            await fetchValues(selectedAttributeId);
        } catch (err) {
            console.error("Failed to delete attribute value:", err);
            alert(err.response?.data?.message || "Failed to delete attribute value");
        }
    };

    const toggleGroup = (key) => {
        setExpandedGroups(prev => ({
            ...prev,
            [key]: prev[key] === undefined ? false : !prev[key]
        }));
    };

    const isGroupExpanded = (key) => {
        return expandedGroups[key] !== false;
    };

    const selectedAttributeObj = attributes.find(a => String(a.id) === String(selectedAttributeId));

    // Filter attributes by search and level filter
    const filteredAttributes = attributes.filter(item => {
        if (levelFilter !== "All" && item.level !== levelFilter) return false;
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            return item.name?.toLowerCase().includes(query) || item.code?.toLowerCase().includes(query);
        }
        return true;
    });

    // Group matching attributes for the tree hierarchy
    const universalAttrs = filteredAttributes.filter(a => a.level === "Universal");

    // Group Category Attributes by parent category_id
    const categoryGroupsMap = {};
    filteredAttributes.forEach(a => {
        if (a.level === "Category" && a.category_id) {
            if (!categoryGroupsMap[a.category_id]) {
                categoryGroupsMap[a.category_id] = {
                    id: a.category_id,
                    name: a.category_name || "Jewellery",
                    attributes: []
                };
            }
            categoryGroupsMap[a.category_id].attributes.push(a);
        }
    });
    const categoryGroups = Object.values(categoryGroupsMap);

    // Group Subcategory Attributes by subcategory_id
    const subcategoryGroupsMap = {};
    filteredAttributes.forEach(a => {
        if (a.level === "Subcategory" && a.subcategory_id) {
            if (!subcategoryGroupsMap[a.subcategory_id]) {
                subcategoryGroupsMap[a.subcategory_id] = {
                    id: a.subcategory_id,
                    name: a.subcategory_name || "Bangles",
                    parentName: a.category_name,
                    attributes: []
                };
            }
            subcategoryGroupsMap[a.subcategory_id].attributes.push(a);
        }
    });
    const subcategoryGroups = Object.values(subcategoryGroupsMap);

    // Filter attribute values by the grid search query
    const filteredGridValues = valuesList.filter(item => {
        const query = gridSearchQuery.toLowerCase();
        return (
            item.value?.toLowerCase().includes(query) ||
            item.code?.toLowerCase().includes(query) ||
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
        <div style={{ maxWidth: "1350px", margin: "0 auto" }}>
            
            {/* Title section */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ background: "var(--accent-glow)", color: "var(--accent)", padding: "4px 10px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Masters</span>
                        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--text-main)", margin: 0 }}>Attribute Values</h1>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button
                        onClick={handleDownloadCSV}
                        disabled={importing}
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
                        htmlFor="values-csv-upload"
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
                        id="values-csv-upload"
                        type="file"
                        accept=".csv"
                        onChange={handleImportCSV}
                        style={{ display: "none" }}
                        disabled={importing}
                    />
                </div>
            </div>

            {/* Main Tree Grid Layout */}
            <div style={{ display: "grid", gridTemplateColumns: "330px 1fr", gap: "32px", alignItems: "flex-start" }}>
                
                {/* LEFT PANEL: Attribute Hierarchy Tree */}
                <div style={{ background: "var(--bg-card)", borderRadius: "14px", border: "1px solid var(--border)", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                    <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
                        Attribute Hierarchy
                    </h2>

                    {/* Level Filter dropdown */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                        <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)" }}>Level:</label>
                        <select
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value)}
                            style={{
                                flex: 1,
                                padding: "6px 10px",
                                borderRadius: "6px",
                                border: "1px solid var(--border)",
                                background: "var(--bg)",
                                color: "var(--text-main)",
                                fontSize: "0.85rem",
                                fontWeight: 500,
                                cursor: "pointer"
                            }}
                        >
                            <option value="All">All Levels</option>
                            <option value="Universal">Universal</option>
                            <option value="Category">Category</option>
                            <option value="Subcategory">Subcategory</option>
                        </select>
                    </div>

                    {/* Search box for attributes */}
                    <div style={{ position: "relative", marginBottom: "20px" }}>
                        <input
                            type="text"
                            placeholder="Search Attribute..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "8px 12px 8px 34px",
                                borderRadius: "8px",
                                border: "1px solid var(--border)",
                                background: "var(--bg)",
                                color: "var(--text-main)",
                                fontSize: "0.85rem"
                            }}
                        />
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                        >
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>

                    {/* Collapsible Tree Container */}
                    <div style={{ maxHeight: "650px", overflowY: "auto", paddingRight: "4px" }}>
                        
                        {/* 1. Universal Level Group */}
                        {(levelFilter === "All" || levelFilter === "Universal") && (
                            <div style={{ marginBottom: "16px" }}>
                                <div 
                                    onClick={() => toggleGroup("universal")}
                                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", padding: "6px 4px", borderRadius: "6px", background: "rgba(0,0,0,0.01)" }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "0.9rem", color: "#3b82f6" }}>
                                        <span style={{ fontSize: "1rem" }}>🔵</span>
                                        Universal
                                    </div>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isGroupExpanded("universal") ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s ease", color: "var(--text-muted)" }}>
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                                
                                {isGroupExpanded("universal") && (
                                    <ul style={{ listStyle: "none", padding: "4px 0 0 16px", margin: 0 }}>
                                        {universalAttrs.length === 0 ? (
                                            <li style={{ padding: "4px 12px", fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>No attributes</li>
                                        ) : (
                                            universalAttrs.map(attr => {
                                                const isSelected = String(attr.id) === String(selectedAttributeId);
                                                return (
                                                    <li 
                                                        key={attr.id}
                                                        onClick={() => setSelectedAttributeId(String(attr.id))}
                                                        style={{
                                                            padding: "6px 12px",
                                                            borderRadius: "6px",
                                                            fontSize: "0.85rem",
                                                            fontWeight: isSelected ? 700 : 500,
                                                            color: isSelected ? "#3b82f6" : "var(--text-main)",
                                                            background: isSelected ? "rgba(59, 130, 246, 0.08)" : "transparent",
                                                            cursor: "pointer",
                                                            marginBottom: "2px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "6px"
                                                        }}
                                                    >
                                                        <span>•</span> {attr.name}
                                                    </li>
                                                );
                                            })
                                        )}
                                    </ul>
                                )}
                            </div>
                        )}

                        {/* 2. Category Level Groups */}
                        {(levelFilter === "All" || levelFilter === "Category") && (
                            <div style={{ marginBottom: "16px" }}>
                                <div style={{ fontWeight: 700, fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", padding: "6px 4px", borderBottom: "1px solid rgba(0,0,0,0.03)", marginBottom: "6px" }}>
                                    Category Level
                                </div>
                                {categoryGroups.length === 0 ? (
                                    <div style={{ padding: "6px 12px", fontSize: "0.82rem", color: "var(--text-muted)", fontStyle: "italic" }}>No category attributes</div>
                                ) : (
                                    categoryGroups.map(group => {
                                        const groupKey = `category-${group.id}`;
                                        const isExpanded = isGroupExpanded(groupKey);
                                        return (
                                            <div key={group.id} style={{ marginBottom: "8px" }}>
                                                <div 
                                                    onClick={() => toggleGroup(groupKey)}
                                                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", padding: "6px 4px", borderRadius: "6px" }}
                                                >
                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "0.9rem", color: "#10b981" }}>
                                                        <span>🟢</span>
                                                        {group.name}
                                                    </div>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s ease", color: "var(--text-muted)" }}>
                                                        <polyline points="6 9 12 15 18 9"></polyline>
                                                    </svg>
                                                </div>

                                                {isExpanded && (
                                                    <ul style={{ listStyle: "none", padding: "2px 0 0 16px", margin: 0 }}>
                                                        {group.attributes.map(attr => {
                                                            const isSelected = String(attr.id) === String(selectedAttributeId);
                                                            return (
                                                                <li 
                                                                    key={attr.id}
                                                                    onClick={() => setSelectedAttributeId(String(attr.id))}
                                                                    style={{
                                                                        padding: "6px 12px",
                                                                        borderRadius: "6px",
                                                                        fontSize: "0.85rem",
                                                                        fontWeight: isSelected ? 700 : 500,
                                                                        color: isSelected ? "#10b981" : "var(--text-main)",
                                                                        background: isSelected ? "rgba(16, 185, 129, 0.08)" : "transparent",
                                                                        cursor: "pointer",
                                                                        marginBottom: "2px",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        gap: "6px"
                                                                    }}
                                                                >
                                                                    <span>•</span> {attr.name}
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}

                        {/* 3. Subcategory Level Groups */}
                        {(levelFilter === "All" || levelFilter === "Subcategory") && (
                            <div style={{ marginBottom: "16px" }}>
                                <div style={{ fontWeight: 700, fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", padding: "6px 4px", borderBottom: "1px solid rgba(0,0,0,0.03)", marginBottom: "6px" }}>
                                    Subcategory Level
                                </div>
                                {subcategoryGroups.length === 0 ? (
                                    <div style={{ padding: "6px 12px", fontSize: "0.82rem", color: "var(--text-muted)", fontStyle: "italic" }}>No subcategory attributes</div>
                                ) : (
                                    subcategoryGroups.map(group => {
                                        const groupKey = `subcategory-${group.id}`;
                                        const isExpanded = isGroupExpanded(groupKey);
                                        return (
                                            <div key={group.id} style={{ marginBottom: "8px" }}>
                                                <div 
                                                    onClick={() => toggleGroup(groupKey)}
                                                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", padding: "6px 4px", borderRadius: "6px" }}
                                                >
                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "0.9rem", color: "#8b5cf6" }}>
                                                        <span>🟣</span>
                                                        {group.name}
                                                    </div>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s ease", color: "var(--text-muted)" }}>
                                                        <polyline points="6 9 12 15 18 9"></polyline>
                                                    </svg>
                                                </div>

                                                {isExpanded && (
                                                    <ul style={{ listStyle: "none", padding: "2px 0 0 16px", margin: 0 }}>
                                                        {group.attributes.map(attr => {
                                                            const isSelected = String(attr.id) === String(selectedAttributeId);
                                                            return (
                                                                <li 
                                                                    key={attr.id}
                                                                    onClick={() => setSelectedAttributeId(String(attr.id))}
                                                                    style={{
                                                                        padding: "6px 12px",
                                                                        borderRadius: "6px",
                                                                        fontSize: "0.85rem",
                                                                        fontWeight: isSelected ? 700 : 500,
                                                                        color: isSelected ? "#8b5cf6" : "var(--text-main)",
                                                                        background: isSelected ? "rgba(139, 92, 246, 0.08)" : "transparent",
                                                                        cursor: "pointer",
                                                                        marginBottom: "2px",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        gap: "6px"
                                                                    }}
                                                                >
                                                                    <span>•</span> {attr.name}
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}

                    </div>
                </div>

                {/* RIGHT PANEL: Attribute Values Grid */}
                <div style={{ minHeight: "500px" }}>
                    {selectedAttributeId ? (
                        <div style={{ background: "var(--bg-card)", borderRadius: "14px", border: "1px solid var(--border)", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                            
                            {/* Panel Header */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "16px", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                                <div>
                                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-main)", margin: 0 }}>
                                        Attribute: <span style={{ color: selectedAttributeObj?.level === "Universal" ? "#3b82f6" : selectedAttributeObj?.level === "Category" ? "#10b981" : "#8b5cf6" }}>
                                            {selectedAttributeObj?.name}
                                        </span>
                                    </h3>
                                    {selectedAttributeObj?.description && (
                                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "4px 0 0 0" }}>
                                            {selectedAttributeObj.description}
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={handleOpenAddModal}
                                    className="btn btn-primary"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        padding: "8px 16px",
                                        fontSize: "0.9rem",
                                        fontWeight: 600,
                                        borderRadius: "8px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                        cursor: "pointer"
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                    Add Value
                                </button>
                            </div>

                            {/* Search inside value list */}
                            <div style={{ position: "relative", marginBottom: "16px", maxWidth: "320px" }}>
                                <input
                                    type="text"
                                    placeholder="Search Value..."
                                    value={gridSearchQuery}
                                    onChange={(e) => setGridSearchQuery(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px 8px 34px",
                                        borderRadius: "8px",
                                        border: "1px solid var(--border)",
                                        background: "var(--bg)",
                                        color: "var(--text-main)",
                                        fontSize: "0.85rem"
                                    }}
                                />
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                                >
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </div>

                            {/* Values Grid */}
                            <div style={{ background: "var(--bg)", borderRadius: "10px", border: "1px solid var(--border)", overflow: "hidden" }}>
                                {gridLoading ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '180px' }}>
                                        <span style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid rgba(0,0,0,0.05)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
                                        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                                    </div>
                                ) : (
                                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                                        <thead>
                                            <tr style={{ background: "rgba(0,0,0,0.02)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                                <th style={{ padding: "12px 18px" }}>Value</th>
                                                <th style={{ padding: "12px 18px" }}>Value Code</th>
                                                <th style={{ padding: "12px 18px", width: "130px" }}>Display Order</th>
                                                <th style={{ padding: "12px 18px", width: "120px" }}>Status</th>
                                                <th style={{ padding: "12px 18px", width: "150px", textAlign: "right" }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredGridValues.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" style={{ padding: "40px 18px", textAlign: "center", color: "var(--text-muted)", fontStyle: "italic" }}>
                                                        No values configured. Click "+ Add Value" to insert.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredGridValues.map((item) => {
                                                    const isColorPalette = selectedAttributeObj?.control_type === 'Color Palette';
                                                    return (
                                                        <tr key={item.id} style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-card)", transition: "background 0.15s ease" }}>
                                                            <td style={{ padding: "14px 18px", fontWeight: 700, color: "var(--text-main)", display: "flex", alignItems: "center", gap: "10px" }}>
                                                                {isColorPalette && (
                                                                    <span style={{
                                                                        display: "inline-block",
                                                                        width: "18px",
                                                                        height: "18px",
                                                                        borderRadius: "50%",
                                                                        border: "1px solid rgba(0, 0, 0, 0.15)",
                                                                        backgroundColor: item.code || item.value,
                                                                        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.15)",
                                                                        flexShrink: 0
                                                                    }} />
                                                                )}
                                                                {item.value}
                                                            </td>
                                                            <td style={{ padding: "14px 18px", fontWeight: 600, color: "var(--accent)", fontFamily: "monospace", fontSize: "0.85rem" }}>
                                                                {item.code}
                                                            </td>
                                                            <td style={{ padding: "14px 18px", fontWeight: 600, color: "var(--text-muted)" }}>
                                                                {item.display_order}
                                                            </td>
                                                            <td style={{ padding: "14px 18px" }}>
                                                                <span style={{
                                                                    display: "inline-block",
                                                                    padding: "3px 8px",
                                                                    borderRadius: "20px",
                                                                    fontSize: "0.78rem",
                                                                    fontWeight: 700,
                                                                    background: item.status === "Active" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                                                                    color: item.status === "Active" ? "var(--success)" : "var(--danger)",
                                                                    border: item.status === "Active" ? "1px solid rgba(34, 197, 94, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)"
                                                                }}>
                                                                    {item.status}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: "14px 18px", textAlign: "right" }}>
                                                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                                                                    <button
                                                                        onClick={() => handleOpenEditModal(item)}
                                                                        style={{
                                                                            background: "transparent",
                                                                            border: "1px solid var(--border)",
                                                                            borderRadius: "6px",
                                                                            padding: "4px 8px",
                                                                            color: "var(--text-main)",
                                                                            cursor: "pointer",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            gap: "4px",
                                                                            fontSize: "0.78rem"
                                                                        }}
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(item.id, item.value)}
                                                                        style={{
                                                                            background: "rgba(239, 68, 68, 0.05)",
                                                                            border: "1px solid rgba(239, 68, 68, 0.15)",
                                                                            borderRadius: "6px",
                                                                            padding: "4px 8px",
                                                                            color: "#ef4444",
                                                                            cursor: "pointer",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            gap: "4px",
                                                                            fontSize: "0.78rem"
                                                                        }}
                                                                    >
                                                                        Del
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                        </div>
                    ) : (
                        <div style={{ background: "var(--bg-card)", border: "1px dashed var(--border)", borderRadius: "14px", padding: "80px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", color: "var(--text-muted)", boxShadow: "0 2px 8px rgba(0,0,0,0.01)" }}>
                            <div style={{ fontSize: "3.5rem" }}>👈</div>
                            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-main)", margin: 0 }}>No Attribute Selected</h3>
                            <p style={{ margin: 0, fontSize: "0.9rem", maxWidth: "340px", lineHeight: "1.5" }}>
                                Please select an attribute from the hierarchy tree on the left panel to configure its values.
                            </p>
                        </div>
                    )}
                </div>

            </div>

            {/* ADD / EDIT VALUE POPUP MODAL */}
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
                        maxWidth: "460px",
                        padding: "28px",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
                                {editingValue ? "Edit Value" : "Add Value"}
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
                            {/* Attribute Name (ReadOnly) */}
                            <div style={{ marginBottom: "16px" }}>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>
                                    Attribute
                                </label>
                                <input
                                    type="text"
                                    value={selectedAttributeObj?.name || ""}
                                    readOnly
                                    disabled
                                    style={{
                                        width: "100%",
                                        padding: "10px 14px",
                                        borderRadius: "8px",
                                        border: "1px solid var(--border)",
                                        background: "rgba(0, 0, 0, 0.03)",
                                        color: "var(--text-main)",
                                        fontSize: "0.95rem",
                                        fontWeight: 600
                                    }}
                                />
                            </div>

                            {/* Value * */}
                            <div style={{ marginBottom: "16px" }}>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                                    Value <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Pink, 500 ml, Gold"
                                    value={formData.value}
                                    onChange={handleValueChange}
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

                            {/* Value Code * */}
                            <div style={{ marginBottom: "16px" }}>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                                    Value Code <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. PINK, 500_ML, GOLD"
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
                                    Uppercase code. Auto-generated from value.
                                </span>
                            </div>

                            {selectedAttributeObj?.control_type === "Color Palette" && (
                                <div style={{ marginBottom: "16px" }}>
                                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                                        Color Swatch Picker
                                    </label>
                                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                        <input
                                            type="color"
                                            value={(formData.code || "").startsWith("#") ? formData.code : "#000000"}
                                            onChange={(e) => {
                                                setIsCodeManual(true);
                                                setFormData({ ...formData, code: e.target.value.toUpperCase() });
                                            }}
                                            style={{
                                                width: "48px",
                                                height: "48px",
                                                border: "none",
                                                borderRadius: "50%",
                                                cursor: "pointer",
                                                padding: 0,
                                                background: "transparent",
                                                boxShadow: "0 2px 5px rgba(0,0,0,0.15)"
                                            }}
                                        />
                                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)", fontFamily: "monospace" }}>
                                                {formData.code || "#000000"}
                                            </span>
                                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                                Choose a color or type Hex code in "Value Code"
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Display Order & Status */}
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
                                            fontSize: "0.95rem",
                                            cursor: "pointer"
                                        }}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="btn btn-secondary"
                                    style={{
                                        padding: "10px 18px",
                                        fontSize: "0.95rem",
                                        fontWeight: 600,
                                        borderRadius: "8px",
                                        cursor: "pointer"
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
                                        borderRadius: "8px",
                                        cursor: "pointer"
                                    }}
                                >
                                    {loading ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
