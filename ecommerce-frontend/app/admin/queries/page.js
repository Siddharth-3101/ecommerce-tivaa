"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { 
    MessageSquare, Send, CheckCircle, AlertCircle, 
    RefreshCw, X, Mail, Calendar, User, CornerDownRight 
} from "lucide-react";

export default function AdminQueriesPage() {
    const router = useRouter();
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("pending"); // "pending" or "replied"
    const [page, setPage] = useState(1);
    const limit = 8;
    
    // Modal & Reply State
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        setPage(1);
    }, [activeTab]);

    const currentUser = getUser();

    const fetchQueries = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/queries/admin");
            setQueries(res.data || []);
        } catch (err) {
            console.error("Failed to load queries:", err);
            setError("Could not retrieve customer queries. Please ensure you are logged in as an admin.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!currentUser || currentUser.role !== "admin") {
            router.push("/login");
            return;
        }
        fetchQueries();
    }, [currentUser, router]);

    const handleOpenReplyModal = (query) => {
        setSelectedQuery(query);
        setReplyText("");
        setSuccessMsg("");
        setError("");
    };

    const handleCloseReplyModal = () => {
        setSelectedQuery(null);
        setReplyText("");
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setSubmitting(true);
        setError("");
        try {
            await api.post(`/queries/admin/${selectedQuery.id}/reply`, { reply: replyText });
            setSuccessMsg("Reply submitted and dispatched to customer email successfully!");
            
            // Refresh list
            const updated = queries.map(q => {
                if (q.id === selectedQuery.id) {
                    return { ...q, status: "replied", reply: replyText };
                }
                return q;
            });
            setQueries(updated);
            
            setTimeout(() => {
                handleCloseReplyModal();
            }, 1800);
        } catch (err) {
            console.error("Failed to send reply:", err);
            setError(err.response?.data?.message || "Could not dispatch reply. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredQueries = queries.filter(q => q.status === activeTab);
    const total = filteredQueries.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const paginatedQueries = filteredQueries.slice(offset, offset + limit);

    const pendingCount = queries.filter(q => q.status === "pending").length;
    const repliedCount = queries.filter(q => q.status === "replied").length;

    if (loading && queries.length === 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
                <span style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid rgba(229,147,116,0.2)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
                <p style={{ color: 'var(--text-muted)' }}>Fetching inbox queries...</p>
                <style jsx>{` @keyframes spin { to { transform: rotate(360deg); } } `}</style>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ padding: '24px', color: 'var(--text-main)' }}>
            
            {/* Header block */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0, background: 'var(--gradient-logo)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Customer Queries Inbox
                    </h1>
                    <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: '0.95rem' }}>
                        Review, manage, and dispatch personal email replies directly to visitor inquiries.
                    </p>
                </div>
                <button 
                    onClick={fetchQueries} 
                    className="btn btn-secondary" 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}
                >
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {error && !selectedQuery && (
                <div style={{ padding: '14px', background: 'rgba(179, 86, 111, 0.08)', border: '1px solid rgba(179, 86, 111, 0.2)', borderRadius: '12px', color: 'var(--danger)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* Metrics cards grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="card" style={{ padding: '20px', background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Inquiries</span>
                    <strong style={{ display: 'block', fontSize: '2rem', marginTop: '6px', fontWeight: 800 }}>{queries.length}</strong>
                </div>
                <div 
                    onClick={() => setActiveTab("pending")} 
                    className="card" 
                    style={{ 
                        padding: '20px', 
                        background: 'var(--bg-glass)', 
                        border: activeTab === "pending" ? '1px solid var(--accent)' : '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s'
                    }}
                >
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Messages</span>
                    <strong style={{ display: 'block', fontSize: '2rem', marginTop: '6px', fontWeight: 800, color: 'var(--accent-yellow)' }}>{pendingCount}</strong>
                </div>
                <div 
                    onClick={() => setActiveTab("replied")} 
                    className="card" 
                    style={{ 
                        padding: '20px', 
                        background: 'var(--bg-glass)', 
                        border: activeTab === "replied" ? '1px solid var(--accent)' : '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s'
                    }}
                >
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Replied Messages</span>
                    <strong style={{ display: 'block', fontSize: '2rem', marginTop: '6px', fontWeight: 800, color: 'var(--success)' }}>{repliedCount}</strong>
                </div>
            </div>

            {/* Tabs selection */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '24px' }}>
                <button 
                    onClick={() => setActiveTab("pending")}
                    style={{ 
                        padding: '8px 16px', 
                        borderRadius: '20px', 
                        border: 'none', 
                        background: activeTab === "pending" ? 'var(--accent-glow)' : 'transparent',
                        color: activeTab === "pending" ? 'var(--accent)' : 'var(--text-muted)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s'
                    }}
                >
                    Pending ({pendingCount})
                </button>
                <button 
                    onClick={() => setActiveTab("replied")}
                    style={{ 
                        padding: '8px 16px', 
                        borderRadius: '20px', 
                        border: 'none', 
                        background: activeTab === "replied" ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                        color: activeTab === "replied" ? 'var(--success)' : 'var(--text-muted)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s'
                    }}
                >
                    Replied ({repliedCount})
                </button>
            </div>

            {/* List Queries */}
            {paginatedQueries.length === 0 ? (
                <div style={{ padding: '60px 24px', background: 'var(--bg-glass)', border: '1px dashed var(--border)', borderRadius: '16px', textAlign: 'center' }}>
                    <MessageSquare size={36} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No queries found</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                        All caught up! There are no {activeTab} customer inquiries in this folder.
                    </p>
                </div>
            ) : (
                <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {paginatedQueries.map(q => (
                            <div 
                                key={q.id} 
                                className="card animate-fade-in" 
                                style={{ 
                                    padding: '24px', 
                                    background: 'var(--bg-glass)', 
                                    border: '1px solid var(--border)', 
                                    borderRadius: '16px',
                                    boxShadow: 'var(--shadow-sm)'
                                }}
                            >
                                {/* Card Header metadata */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '14px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>{q.subject}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <User size={14} style={{ color: 'var(--accent)' }} /> {q.name}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Mail size={14} style={{ color: 'var(--accent-teal)' }} /> {q.email}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Calendar size={14} /> {new Date(q.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ 
                                        padding: '4px 12px', 
                                        borderRadius: '12px', 
                                        fontSize: '0.75rem', 
                                        fontWeight: 700, 
                                        textTransform: 'uppercase',
                                        border: q.status === 'replied' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(220, 163, 83, 0.2)',
                                        color: q.status === 'replied' ? 'var(--success)' : 'var(--accent-yellow)',
                                        background: q.status === 'replied' ? 'rgba(16, 185, 129, 0.04)' : 'rgba(220, 163, 83, 0.04)'
                                    }}>
                                        {q.status}
                                    </div>
                                </div>

                                {/* Question body */}
                                <div style={{ marginBottom: '16px' }}>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                        {q.message}
                                    </p>
                                </div>

                                {/* Reply block (if exists) */}
                                {q.status === 'replied' ? (
                                    <div style={{ display: 'flex', gap: '10px', background: 'rgba(229,147,116,0.03)', padding: '16px', borderRadius: '12px', borderLeft: '3px solid var(--accent)' }}>
                                        <CornerDownRight size={18} style={{ color: 'var(--accent)', marginTop: '2px', flexShrink: 0 }} />
                                        <div>
                                            <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Admin Response</strong>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                                                {q.reply}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                                        <button 
                                            onClick={() => handleOpenReplyModal(q)} 
                                            className="btn btn-primary" 
                                            style={{ padding: '8px 18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            <Send size={14} /> Send Response
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
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
                </div>
            )}

            {/* REPLY OVERLAY MODAL */}
            {selectedQuery && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                    <div 
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} 
                        onClick={handleCloseReplyModal}
                    />
                    
                    <div 
                        className="card animate-slide-down" 
                        style={{ 
                            position: 'relative', 
                            width: '100%', 
                            maxWidth: '560px', 
                            background: 'var(--bg-glass)', 
                            border: '1px solid var(--accent)', 
                            borderRadius: '24px', 
                            padding: '28px',
                            boxShadow: 'var(--shadow-lg)'
                        }}
                    >
                        {/* Modal Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '14px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Respond to Customer</h3>
                            <button 
                                onClick={handleCloseReplyModal}
                                style={{ background: 'transparent', border: 'none', padding: '6px', cursor: 'pointer', color: 'var(--text-muted)' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal message review */}
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.9rem', marginBottom: '20px' }}>
                            <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                <span>Sender: <strong>{selectedQuery.name}</strong> ({selectedQuery.email})</span>
                                <span>ID #{selectedQuery.id}</span>
                            </div>
                            <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '4px' }}>{selectedQuery.subject}</strong>
                            <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.5, maxHeight: '80px', overflowY: 'auto' }}>
                                "{selectedQuery.message}"
                            </p>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSendReply} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {successMsg ? (
                                <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px', color: 'var(--success)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CheckCircle size={16} />
                                    <span>{successMsg}</span>
                                </div>
                            ) : error ? (
                                <div style={{ padding: '10px 14px', background: 'rgba(179, 86, 111, 0.08)', border: '1px solid rgba(179, 86, 111, 0.2)', borderRadius: '10px', color: 'var(--danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            ) : null}

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 500 }}>Your Reply Email Message</label>
                                <textarea 
                                    value={replyText} 
                                    onChange={(e) => setReplyText(e.target.value)} 
                                    placeholder="Type your reply to the customer here. This response will be saved in the database and sent to their email instantly..." 
                                    className="input-field" 
                                    rows="6"
                                    style={{ width: '100%', resize: 'vertical', minHeight: '120px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}
                                    required 
                                    disabled={submitting || !!successMsg}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '4px' }}>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={handleCloseReplyModal}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary" 
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
                                    disabled={submitting || !replyText.trim() || !!successMsg}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="loader"></span> Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} /> Send Email Response
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .loader {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    border-bottom-color: #fff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    display: inline-block;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>

        </div>
    );
}
