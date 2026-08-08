"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function DeletionRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // stores request.id currently processing

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/deletion-requests");
            setRequests(res.data || []);
        } catch (err) {
            console.error("Failed to fetch deletion requests:", err);
            alert("Error loading deletion requests. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        const confirmMsg = "Are you sure you want to approve this deletion request?\n\nThis will soft-delete the user record, anonymize personal profile identifiers (name, email, phone, addresses), and wipe their saved carts, wishlists, and sessions. Past statutory records (orders, tax invoices) will be preserved.";
        if (!window.confirm(confirmMsg)) return;

        setActionLoading(id);
        try {
            await api.put(`/admin/deletion-requests/${id}/approve`);
            alert("Account deletion request successfully approved and processed.");
            await fetchRequests();
        } catch (err) {
            console.error("Failed to approve deletion request:", err);
            alert(err.response?.data?.message || "Failed to approve deletion request.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Are you sure you want to reject this account deletion request?")) return;

        setActionLoading(id);
        try {
            await api.put(`/admin/deletion-requests/${id}/reject`);
            alert("Deletion request rejected successfully.");
            await fetchRequests();
        } catch (err) {
            console.error("Failed to reject deletion request:", err);
            alert(err.response?.data?.message || "Failed to reject deletion request.");
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text-main)", margin: "0 0 8px 0" }}>Customer Deletion Requests</h1>
                <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.95rem" }}>
                    Manage customer accounts requesting anonymization and deletion under DPDP regulations.
                </p>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
                    Loading deletion requests...
                </div>
            ) : requests.length === 0 ? (
                <div className="card" style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>🔒</div>
                    <h3 style={{ color: "var(--text-main)", fontSize: "1.2rem", fontWeight: 600, marginBottom: "8px" }}>No Deletion Requests Found</h3>
                    <p style={{ margin: 0, fontSize: "0.9rem" }}>There are currently no active account deletion requests to review.</p>
                </div>
            ) : (
                <div className="card" style={{ overflow: "hidden" }}>
                    <div style={{ overflowX: "auto", width: "100%", WebkitOverflowScrolling: "touch" }}>
                        <table style={{ width: "100%", minWidth: "900px", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                    <th style={{ padding: "16px 24px", fontWeight: 600, textAlign: "left" }}>Customer</th>
                                    <th style={{ padding: "16px 24px", fontWeight: 600, textAlign: "left" }}>Requested On</th>
                                    <th style={{ padding: "16px 24px", fontWeight: 600, textAlign: "left" }}>Reason</th>
                                    <th style={{ padding: "16px 24px", fontWeight: 600, textAlign: "left" }}>Status</th>
                                    <th style={{ padding: "16px 24px", fontWeight: 600, textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((req) => (
                                    <tr 
                                        key={req.id} 
                                        style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }}
                                        onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                                        onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                                    >
                                        <td style={{ padding: "16px 24px" }}>
                                            <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{req.user_name}</div>
                                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                                                {req.user_email} {req.user_phone ? `• ${req.user_phone}` : ""}
                                            </div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--accent)", marginTop: "4px" }}>
                                                ID: #{req.user_id}
                                            </div>
                                        </td>
                                        <td style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                            {formatDate(req.requested_at)}
                                        </td>
                                        <td style={{ padding: "16px 24px", color: "var(--text-main)", fontSize: "0.9rem", maxWidth: "250px", wordBreak: "break-word" }}>
                                            {req.reason || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No reason specified</span>}
                                        </td>
                                        <td style={{ padding: "16px 24px" }}>
                                            <span style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                padding: "4px 10px",
                                                borderRadius: "12px",
                                                fontSize: "0.8rem",
                                                fontWeight: 600,
                                                background: req.status === "Approved" ? "rgba(16, 185, 129, 0.08)" : 
                                                            req.status === "Rejected" ? "rgba(239, 68, 68, 0.08)" : 
                                                            "rgba(245, 158, 11, 0.08)",
                                                color: req.status === "Approved" ? "var(--success)" : 
                                                       req.status === "Rejected" ? "var(--danger)" : 
                                                       "var(--accent)",
                                                border: `1px solid ${
                                                    req.status === "Approved" ? "rgba(16, 185, 129, 0.2)" : 
                                                    req.status === "Rejected" ? "rgba(239, 68, 68, 0.2)" : 
                                                    "rgba(245, 158, 11, 0.2)"
                                                }`
                                            }}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: "16px 24px", textAlign: "right" }}>
                                            {req.status === "Pending" ? (
                                                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                                    <button 
                                                        className="btn btn-secondary" 
                                                        onClick={() => handleReject(req.id)}
                                                        disabled={actionLoading !== null}
                                                        style={{ padding: "6px 14px", fontSize: "0.82rem", borderRadius: "6px", cursor: "pointer" }}
                                                    >
                                                        Reject
                                                    </button>
                                                    <button 
                                                        className="btn btn-primary" 
                                                        onClick={() => handleApprove(req.id)}
                                                        disabled={actionLoading !== null}
                                                        style={{ padding: "6px 14px", fontSize: "0.82rem", borderRadius: "6px", cursor: "pointer", background: "var(--success)", borderColor: "var(--success)" }}
                                                    >
                                                        {actionLoading === req.id ? "Processing..." : "Approve"}
                                                    </button>
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                                                    Processed
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
