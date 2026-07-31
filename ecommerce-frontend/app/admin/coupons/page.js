"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import Heading from "@/components/Heading";

export default function CouponsPage() {
    const getTodayDateString = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    };

    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        code: "",
        type: "percentage",
        value: "",
        min_bill_amount: "",
        start_date: getTodayDateString(),
        end_date: ""
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await api.get("/coupons");
            setCoupons(res.data || []);
        } catch (err) {
            console.error("Error fetching coupons:", err);
            setError("Failed to load coupons. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        setSuccess("");

        const todayStr = getTodayDateString();
        const startVal = form.start_date || todayStr;

        if (startVal < todayStr) {
            setError("Start date cannot be in the past.");
            setSubmitting(false);
            return;
        }

        if (form.end_date && form.end_date < startVal) {
            setError("End date cannot be before the start date.");
            setSubmitting(false);
            return;
        }

        try {
            const payload = {
                code: form.code.trim().toUpperCase(),
                type: form.type,
                value: (form.type === "percentage" || form.type === "flat_amount") ? parseFloat(form.value) || 0 : 0,
                min_bill_amount: parseFloat(form.min_bill_amount) || 0,
                start_date: form.start_date || null,
                end_date: form.end_date || null
            };

            await api.post("/coupons", payload);
            setSuccess("Coupon created successfully!");
            setForm({
                code: "",
                type: "percentage",
                value: "",
                min_bill_amount: "",
                start_date: getTodayDateString(),
                end_date: ""
            });
            fetchCoupons();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create coupon. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCoupon = async (id) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        setError("");
        setSuccess("");

        try {
            await api.delete(`/coupons/${id}`);
            setSuccess("Coupon deleted successfully!");
            fetchCoupons();
        } catch (err) {
            setError("Failed to delete coupon.");
        }
    };

    const handleToggleActive = async (id) => {
        setError("");
        setSuccess("");
        try {
            const res = await api.put(`/coupons/${id}/toggle`);
            setSuccess(res.data.message || "Coupon status toggled.");
            // Update state locally
            setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: res.data.is_active } : c));
        } catch (err) {
            setError("Failed to update status.");
        }
    };

    return (
        <div style={{ padding: "24px", maxWidth: "1250px", margin: "0 auto" }}>
            <Heading variant="HomeHeader2" style={{ marginBottom: "24px" }}>
                Coupon Codes Management
            </Heading>

            {error && (
                <div style={{ padding: "12px 16px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "var(--danger, #ef4444)", borderRadius: "8px", marginBottom: "20px", fontSize: "0.9rem" }}>
                    {error}
                </div>
            )}
            {success && (
                <div style={{ padding: "12px 16px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", color: "var(--accent, #10b981)", borderRadius: "8px", marginBottom: "20px", fontSize: "0.9rem" }}>
                    {success}
                </div>
            )}

            <div className="coupon-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
                {/* Create Coupon Form Card */}
                <div style={{ background: "var(--card-bg, #ffffff)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "20px", color: "var(--text-main)" }}>Create New Coupon</h3>
                    <form onSubmit={handleCreateCoupon} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", alignItems: "end" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px" }}>Coupon Code *</label>
                            <input 
                                type="text"
                                className="input-field"
                                style={{ width: "100%", textTransform: "uppercase" }}
                                placeholder="e.g. FLAT100"
                                value={form.code}
                                onChange={(e) => setForm({ ...form, code: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px" }}>Discount Type *</label>
                            <select 
                                className="input-field" 
                                style={{ width: "100%" }}
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value, value: e.target.value === "free_shipping" ? "" : form.value })}
                            >
                                <option value="percentage">Percentage Discount (%)</option>
                                <option value="flat_amount">Flat Bill Discount (₹)</option>
                                <option value="free_shipping">Free Shipping</option>
                            </select>
                        </div>

                        {(form.type === "percentage" || form.type === "flat_amount") && (
                            <div>
                                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px" }}>
                                    {form.type === "percentage" ? "Discount Percentage (%) *" : "Flat Discount Value (₹) *"}
                                </label>
                                <input 
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="input-field"
                                    style={{ width: "100%" }}
                                    placeholder={form.type === "percentage" ? "e.g. 5" : "e.g. 100"}
                                    value={form.value}
                                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px" }}>Min Bill Amount (₹)</label>
                            <input 
                                type="number"
                                min="0"
                                step="1"
                                className="input-field"
                                style={{ width: "100%" }}
                                placeholder="e.g. 500"
                                value={form.min_bill_amount}
                                onChange={(e) => setForm({ ...form, min_bill_amount: e.target.value })}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px" }}>Start Date *</label>
                            <input 
                                type="date"
                                className="input-field"
                                style={{ width: "100%" }}
                                value={form.start_date}
                                min={getTodayDateString()}
                                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px" }}>End Date</label>
                            <input 
                                type="date"
                                className="input-field"
                                style={{ width: "100%" }}
                                value={form.end_date}
                                min={form.start_date || getTodayDateString()}
                                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                            />
                        </div>

                        <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                            <button type="submit" disabled={submitting} className="pay-securely-btn" style={{ padding: "10px 24px", minWidth: "150px" }}>
                                {submitting ? "Creating..." : "Create Coupon"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* List Coupons Card */}
                <div style={{ background: "var(--card-bg, #ffffff)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px", overflow: "hidden" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "20px", color: "var(--text-main)" }}>Active Coupons ({coupons.length})</h3>

                    {loading ? (
                        <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
                            <span style={{ display: "inline-block", width: "30px", height: "30px", border: "3px solid rgba(255,255,255,0.1)", borderRadius: "50%", borderTopColor: "var(--accent)", animation: "spin 1s ease-in-out infinite" }}></span>
                        </div>
                    ) : coupons.length === 0 ? (
                        <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 0" }}>No coupons created yet.</p>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "850px" }}>
                                <thead>
                                    <tr style={{ borderBottom: "2px solid var(--border)", background: "rgba(0,0,0,0.02)" }}>
                                        <th style={{ padding: "12px 8px", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)" }}>Code</th>
                                        <th style={{ padding: "12px 8px", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)" }}>Type</th>
                                        <th style={{ padding: "12px 8px", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)" }}>Value</th>
                                        <th style={{ padding: "12px 8px", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)" }}>Min Order</th>
                                        <th style={{ padding: "12px 8px", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)" }}>Start Date</th>
                                        <th style={{ padding: "12px 8px", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)" }}>End Date</th>
                                        <th style={{ padding: "12px 8px", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>Status</th>
                                        <th style={{ padding: "12px 8px", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coupons.map(coupon => {
                                        const now = new Date();
                                        const isNotStarted = coupon.start_date && new Date(coupon.start_date) > now;
                                        const isExpired = coupon.end_date && new Date(coupon.end_date) < now;
                                        
                                        let statusLabel = "Active";
                                        let statusColor = "rgba(16, 185, 129, 0.15)";
                                        let textColor = "#10b981";

                                        if (!coupon.is_active) {
                                            statusLabel = "Inactive";
                                            statusColor = "rgba(239, 68, 68, 0.15)";
                                            textColor = "#ef4444";
                                        } else if (isNotStarted) {
                                            statusLabel = "Scheduled";
                                            statusColor = "rgba(245, 158, 11, 0.15)";
                                            textColor = "#f59e0b";
                                        } else if (isExpired) {
                                            statusLabel = "Expired";
                                            statusColor = "rgba(107, 114, 128, 0.15)";
                                            textColor = "#6b7280";
                                        }

                                        return (
                                            <tr key={coupon.id} style={{ borderBottom: "1px solid var(--border)", fontSize: "0.9rem" }}>
                                                <td style={{ padding: "14px 8px", fontWeight: "600", color: "var(--text-main)" }}>
                                                    {coupon.code}
                                                </td>
                                                <td style={{ padding: "14px 8px", textTransform: "capitalize" }}>
                                                    {coupon.type.replace("_", " ")}
                                                </td>
                                                <td style={{ padding: "14px 8px" }}>
                                                    {coupon.type === "percentage" ? `${parseFloat(coupon.value)}%` : 
                                                     coupon.type === "flat_amount" ? `₹${parseFloat(coupon.value)}` : "-"}
                                                </td>
                                                <td style={{ padding: "14px 8px" }}>
                                                    ₹{parseFloat(coupon.min_bill_amount || 0).toFixed(2)}
                                                </td>
                                                <td style={{ padding: "14px 8px" }}>
                                                    {coupon.start_date ? new Date(coupon.start_date).toLocaleDateString() : "Immediate"}
                                                </td>
                                                <td style={{ padding: "14px 8px" }}>
                                                    {coupon.end_date ? (
                                                        <span style={{ color: isExpired ? "var(--danger, #ef4444)" : "inherit" }}>
                                                            {new Date(coupon.end_date).toLocaleDateString()}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: "var(--text-muted)" }}>Never</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: "14px 8px", textAlign: "center" }}>
                                                    <button 
                                                        onClick={() => handleToggleActive(coupon.id)}
                                                        style={{ 
                                                            padding: "4px 10px", 
                                                            borderRadius: "20px", 
                                                            fontSize: "0.75rem", 
                                                            fontWeight: "600",
                                                            cursor: "pointer",
                                                            border: "none",
                                                            background: statusColor,
                                                            color: textColor
                                                        }}
                                                        disabled={isExpired}
                                                        title={isExpired ? "Cannot toggle expired coupon" : "Toggle status"}
                                                    >
                                                        {statusLabel}
                                                    </button>
                                                </td>
                                                <td style={{ padding: "14px 8px", textAlign: "center" }}>
                                                    <button 
                                                        onClick={() => handleDeleteCoupon(coupon.id)}
                                                        style={{
                                                            background: "none",
                                                            border: "none",
                                                            cursor: "pointer",
                                                            color: "var(--danger, #ef4444)",
                                                            padding: "4px",
                                                            display: "inline-flex",
                                                            alignItems: "center"
                                                        }}
                                                        title="Delete Coupon"
                                                    >
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
