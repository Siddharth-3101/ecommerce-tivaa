"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function GstStateMasterPage() {
    const [stateList, setStateList] = useState([]);
    const [initLoading, setInitLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingState, setEditingState] = useState(null);
    const [formData, setFormData] = useState({
        state_code: "",
        state_name: ""
    });

    useEffect(() => {
        fetchGstStates();
    }, []);

    const fetchGstStates = async () => {
        try {
            const res = await api.get("/admin/gst-states");
            setStateList(res.data || []);
        } catch (err) {
            console.error("Error fetching GST states:", err);
            setStateList([]);
        } finally {
            setInitLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setEditingState(null);
        setFormData({ state_code: "", gst_state: "", state_name: "" });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        setEditingState(item);
        setFormData({
            state_code: item.state_code || "",
            gst_state: item.gst_state || "",
            state_name: item.state_name || ""
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingState(null);
        setFormData({ state_code: "", gst_state: "", state_name: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const codeStr = String(formData.state_code || "").trim();
        const nameStr = String(formData.state_name || "").trim();
        const formattedCode = codeStr.padStart(2, '0');
        const gstStateStr = String(formData.gst_state || "").trim() || `${formattedCode}-${nameStr}`;

        if (!codeStr) {
            alert("Please enter a valid State Code");
            return;
        }
        if (!nameStr) {
            alert("Please enter a valid State Name");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                state_code: formattedCode,
                gst_state: gstStateStr,
                state_name: nameStr
            };

            if (editingState) {
                await api.put(`/admin/gst-states/${editingState.id}`, payload);
            } else {
                await api.post("/admin/gst-states", payload);
            }
            handleCloseModal();
            await fetchGstStates();
        } catch (err) {
            console.error("Failed to save GST State:", err);
            alert(err.response?.data?.message || "Failed to save GST State");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Are you sure you want to delete GST State "${name}"?`)) return;
        try {
            await api.delete(`/admin/gst-states/${id}`);
            await fetchGstStates();
        } catch (err) {
            console.error("Failed to delete GST State:", err);
            alert(err.response?.data?.message || "Failed to delete GST State");
        }
    };

    const filteredStates = stateList.filter(item => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        const codeMatch = item.state_code && String(item.state_code).toLowerCase().includes(query);
        const nameMatch = item.state_name && item.state_name.toLowerCase().includes(query);
        return codeMatch || nameMatch;
    });

    return (
        <div className="container animate-fade-in" style={{ paddingBottom: "80px" }}>
            {/* Header section */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                    <h1 style={{ fontSize: "2.2rem", fontWeight: 300, margin: 0, color: "var(--text-main)" }}>
                        GST State Master
                    </h1>
                    <p style={{ color: "var(--text-muted)", margin: "4px 0 0 0", fontSize: "0.95rem" }}>
                        Manage State Codes and GST States for tax identification.
                    </p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="btn btn-primary"
                    style={{
                        padding: "12px 24px",
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        borderRadius: "10px",
                        boxShadow: "0 4px 14px rgba(16, 185, 129, 0.25)"
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add New GST State
                </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="card" style={{ padding: "20px", marginBottom: "24px", display: "flex", gap: "16px", alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1 }}>
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
                    <input
                        type="text"
                        placeholder="Search by Code or GST State name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field"
                        style={{ paddingLeft: "42px", height: "44px", width: "100%" }}
                    />
                </div>
            </div>

            {/* GST State Table */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                {initLoading ? (
                    <div style={{ padding: "60px", textAlign: "center" }}>
                        <span style={{ display: "inline-block", width: "32px", height: "32px", border: "3px solid var(--border)", borderRadius: "50%", borderTopColor: "var(--accent)", animation: "spin 1s ease-in-out infinite" }}></span>
                        <p style={{ color: "var(--text-muted)", marginTop: "12px" }}>Loading GST States...</p>
                        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : filteredStates.length === 0 ? (
                    <div style={{ padding: "60px 20px", textAlign: "center" }}>
                        <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-muted)" }}>
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                        </div>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 600, margin: "0 0 6px" }}>No GST States Found</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "0 0 20px" }}>
                            {searchQuery ? "No matching records found for your search query." : "You haven't added any GST States yet."}
                        </p>
                        {!searchQuery && (
                            <button onClick={handleOpenAddModal} className="btn btn-secondary" style={{ fontSize: "0.88rem" }}>
                                Add First GST State
                            </button>
                        )}
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.95rem" }}>
                            <thead>
                                <tr style={{ background: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid var(--border)" }}>
                                    <th style={{ padding: "16px 20px", fontWeight: 600, color: "var(--text-muted)", width: "120px" }}>Code</th>
                                    <th style={{ padding: "16px 20px", fontWeight: 600, color: "var(--text-muted)" }}>GST State</th>
                                    <th style={{ padding: "16px 20px", fontWeight: 600, color: "var(--text-muted)" }}>State Name</th>
                                    <th style={{ padding: "16px 20px", fontWeight: 600, color: "var(--text-muted)", textAlign: "right", width: "140px" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStates.map((item) => (
                                    <tr
                                        key={item.id}
                                        style={{
                                            borderBottom: "1px solid var(--border)",
                                            transition: "background 0.15s ease"
                                        }}
                                    >
                                        <td style={{ padding: "16px 20px", fontWeight: 700, fontFamily: "monospace", fontSize: "1rem", color: "var(--accent)" }}>
                                            {String(item.state_code).padStart(2, '0')}
                                        </td>
                                        <td style={{ padding: "16px 20px", fontWeight: 600, color: "var(--text-main)" }}>
                                            {item.gst_state || `${String(item.state_code).padStart(2, '0')}-${(item.state_name || '').replace(/^[0-9]+-/, '')}`}
                                        </td>
                                        <td style={{ padding: "16px 20px", fontWeight: 500, color: "var(--text-muted)" }}>
                                            {(item.state_name || '').replace(/^[0-9]+-/, '')}
                                        </td>
                                        <td style={{ padding: "16px 20px", textAlign: "right" }}>
                                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                                <button
                                                    onClick={() => handleOpenEditModal(item)}
                                                    title="Edit GST State"
                                                    style={{
                                                        background: "rgba(255, 255, 255, 0.05)",
                                                        border: "1px solid var(--border)",
                                                        borderRadius: "8px",
                                                        padding: "6px 10px",
                                                        cursor: "pointer",
                                                        color: "var(--text-main)",
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "4px",
                                                        fontSize: "0.85rem"
                                                    }}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id, item.state_name)}
                                                    title="Delete GST State"
                                                    style={{
                                                        background: "rgba(239, 68, 68, 0.1)",
                                                        border: "1px solid rgba(239, 68, 68, 0.2)",
                                                        borderRadius: "8px",
                                                        padding: "6px 10px",
                                                        cursor: "pointer",
                                                        color: "#ef4444",
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "4px",
                                                        fontSize: "0.85rem"
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ADD / EDIT MODAL */}
            {isModalOpen && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0, 0, 0, 0.65)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justify: "center",
                    zIndex: 1000,
                    padding: "20px"
                }}>
                    <div className="animate-fade-in" style={{
                        background: "var(--card-bg, #1a1d2d)",
                        border: "1px solid var(--border)",
                        borderRadius: "16px",
                        width: "100%",
                        maxWidth: "460px",
                        padding: "28px",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h2 style={{ fontSize: "1.3rem", fontWeight: 600, margin: 0 }}>
                                {editingState ? "Edit GST State" : "Add New GST State"}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>
                                    Code (e.g. 33, 29, 27) <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. 33"
                                    value={formData.state_code}
                                    onChange={(e) => setFormData({ ...formData, state_code: e.target.value })}
                                    className="input-field"
                                    required
                                    style={{ width: "100%", height: "42px" }}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px" }}>
                                    GST State Name <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Tamil Nadu"
                                    value={formData.state_name}
                                    onChange={(e) => setFormData({ ...formData, state_name: e.target.value })}
                                    className="input-field"
                                    required
                                    style={{ width: "100%", height: "42px" }}
                                />
                            </div>

                            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "12px" }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="btn btn-secondary"
                                    disabled={loading}
                                    style={{ padding: "10px 18px", fontSize: "0.9rem" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                    style={{ padding: "10px 22px", fontSize: "0.9rem", fontWeight: 600 }}
                                >
                                    {loading ? "Saving..." : editingState ? "Update State" : "Save State"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
