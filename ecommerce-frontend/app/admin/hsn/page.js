"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function HsnMasterPage() {
    const [hsnList, setHsnList] = useState([]);
    const [initLoading, setInitLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHsn, setEditingHsn] = useState(null);
    const [formData, setFormData] = useState({
        hsn_code: "",
        hsn_name: "",
        tax_percentage: ""
    });

    useEffect(() => {
        fetchHsnCodes();
    }, []);

    const fetchHsnCodes = async () => {
        try {
            const res = await api.get("/admin/hsn");
            setHsnList(res.data || []);
        } catch (err) {
            console.error("Error fetching HSN codes:", err);
            setHsnList([]);
        } finally {
            setInitLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setEditingHsn(null);
        setFormData({ hsn_code: "", hsn_name: "", tax_percentage: "" });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        setEditingHsn(item);
        setFormData({
            hsn_code: item.hsn_code || "",
            hsn_name: item.hsn_name || "",
            tax_percentage: item.tax_percentage !== undefined && item.tax_percentage !== null ? String(item.tax_percentage) : ""
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingHsn(null);
        setFormData({ hsn_code: "", hsn_name: "", tax_percentage: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.hsn_code.trim()) {
            alert("Please enter a valid HSN Code");
            return;
        }
        if (!formData.hsn_name.trim()) {
            alert("Please enter a valid HSN Name");
            return;
        }
        if (formData.tax_percentage === "" || isNaN(formData.tax_percentage)) {
            alert("Please enter a valid Tax Percentage");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                hsn_code: formData.hsn_code.trim(),
                hsn_name: formData.hsn_name.trim(),
                tax_percentage: parseFloat(formData.tax_percentage)
            };

            if (editingHsn) {
                await api.put(`/admin/hsn/${editingHsn.id}`, payload);
            } else {
                await api.post("/admin/hsn", payload);
            }
            handleCloseModal();
            await fetchHsnCodes();
        } catch (err) {
            console.error("Failed to save HSN code:", err);
            alert(err.response?.data?.message || "Failed to save HSN code");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Are you sure you want to delete HSN Code "${name}"?`)) return;
        try {
            await api.delete(`/admin/hsn/${id}`);
            await fetchHsnCodes();
        } catch (err) {
            console.error("Failed to delete HSN code:", err);
            alert(err.response?.data?.message || "Failed to delete HSN code");
        }
    };

    // Filter list by search query
    const filteredHsnList = hsnList.filter(item => {
        const query = searchQuery.toLowerCase();
        return (
            item.hsn_code?.toLowerCase().includes(query) ||
            item.hsn_name?.toLowerCase().includes(query) ||
            String(item.tax_percentage).includes(query) ||
            String(item.id).includes(query)
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
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            
            {/* Header section */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                        <span style={{ background: "var(--accent-glow)", color: "var(--accent)", padding: "4px 10px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Masters</span>
                        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--text-main)", margin: 0 }}>HSN Codes</h1>
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: 0 }}>
                        Manage HSN Code master definitions and associated tax percentages.
                    </p>
                </div>

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
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add HSN Code
                </button>
            </div>

            {/* Top Bar: Search & Stats */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: "1", minWidth: "260px", maxWidth: "420px" }}>
                    <input
                        type="text"
                        placeholder="Search by HSN Code or Tax %..."
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
                    Showing <strong style={{ color: "var(--text-main)" }}>{filteredHsnList.length}</strong> of <strong style={{ color: "var(--text-main)" }}>{hsnList.length}</strong> HSN Codes
                </div>
            </div>

            {/* HSN Table Card */}
            <div style={{ background: "var(--bg-card)", borderRadius: "14px", border: "1px solid var(--border)", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.92rem" }}>
                    <thead>
                        <tr style={{ background: "rgba(0,0,0,0.02)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            <th style={{ padding: "14px 20px", width: "80px" }}>ID</th>
                            <th style={{ padding: "14px 20px", width: "140px" }}>HSN Code</th>
                            <th style={{ padding: "14px 20px" }}>HSN Name</th>
                            <th style={{ padding: "14px 20px", width: "180px" }}>Tax Percentage</th>
                            <th style={{ padding: "14px 20px", width: "200px" }}>Created At</th>
                            <th style={{ padding: "14px 20px", width: "140px", textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredHsnList.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: "48px 20px", textAlign: "center", color: "var(--text-muted)" }}>
                                    <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>📋</div>
                                    <p style={{ margin: 0, fontWeight: 500 }}>No HSN codes found.</p>
                                    {searchQuery && <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>Try clearing your search query.</p>}
                                </td>
                            </tr>
                        ) : (
                            filteredHsnList.map((item) => (
                                <tr key={item.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s ease" }}>
                                    <td style={{ padding: "16px 20px", fontWeight: 600, color: "var(--text-muted)" }}>#{item.id}</td>
                                    <td style={{ padding: "16px 20px", fontWeight: 700, color: "var(--accent)" }}>
                                        {item.hsn_code || "-"}
                                    </td>
                                    <td style={{ padding: "16px 20px", fontWeight: 600, color: "var(--text-main)" }}>
                                        {item.hsn_name || item.hsn_code || "-"}
                                    </td>
                                    <td style={{ padding: "16px 20px" }}>
                                        <span style={{
                                            display: "inline-block",
                                            padding: "4px 12px",
                                            borderRadius: "20px",
                                            fontSize: "0.85rem",
                                            fontWeight: 700,
                                            background: "rgba(16, 185, 129, 0.1)",
                                            color: "#10b981",
                                            border: "1px solid rgba(16, 185, 129, 0.2)"
                                        }}>
                                            {item.tax_percentage}% GST
                                        </span>
                                    </td>
                                    <td style={{ padding: "16px 20px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                        {item.created_at ? new Date(item.created_at).toLocaleDateString("en-IN", { year: 'numeric', month: 'short', day: 'numeric' }) : "-"}
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
                                                title="Edit HSN Code"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => handleDelete(item.id, item.hsn_code || item.hsn_name)}
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
                                                title="Delete HSN Code"
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

            {/* Add / Edit HSN Modal */}
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
                        maxWidth: "480px",
                        padding: "28px",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
                                {editingHsn ? "Edit HSN Code" : "Add New HSN Code"}
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
                                    HSN Code <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. 7323"
                                    value={formData.hsn_code}
                                    onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })}
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
                                    HSN Name <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. SteelItems"
                                    value={formData.hsn_name}
                                    onChange={(e) => setFormData({ ...formData, hsn_name: e.target.value })}
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

                            <div style={{ marginBottom: "24px" }}>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                                    Tax Percentage (%) <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    placeholder="e.g. 5"
                                    value={formData.tax_percentage}
                                    onChange={(e) => setFormData({ ...formData, tax_percentage: e.target.value })}
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

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="btn btn-secondary"
                                    style={{ padding: "10px 18px", fontSize: "0.9rem" }}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ padding: "10px 20px", fontSize: "0.9rem" }}
                                    disabled={loading}
                                >
                                    {loading ? "Saving..." : editingHsn ? "Update HSN" : "Save HSN"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
