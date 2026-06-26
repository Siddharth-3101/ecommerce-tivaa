"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

export default function HomeCategorySelector({ categories = [] }) {
    const router = useRouter();
    const parents = categories.filter(c => !c.parent_id);
    const subs = categories.filter(c => c.parent_id);

    // Default to the first parent category if available, otherwise empty
    const [selectedParentId, setSelectedParentId] = useState(parents[0]?.id || "");

    const activeParent = parents.find(p => Number(p.id) === Number(selectedParentId));
    const activeSubs = activeParent 
        ? subs.filter(s => Number(s.parent_id) === Number(activeParent.id))
        : [];

    const handleParentChange = (e) => {
        setSelectedParentId(e.target.value);
    };

    const handleCategoryClick = (categoryName) => {
        router.push(`/products?category=${encodeURIComponent(categoryName)}`);
    };

    if (parents.length === 0) return null;

    return (
        <div style={{ 
            maxWidth: "600px", 
            margin: "0 auto 40px", 
            padding: "24px", 
            background: "rgba(255, 255, 255, 0.4)", 
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(122, 56, 194, 0.15)",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(122, 56, 194, 0.05)",
            textAlign: "center"
        }} className="animate-fade-in">
            <h3 style={{ fontSize: "1.1rem", marginBottom: "16px", fontWeight: 600, color: "var(--text-main)", textTransform: "uppercase", letterSpacing: "1px" }}>
                Explore Our Collections
            </h3>
            
            {/* Main Categories Dropdown Selector */}
            <div style={{ position: "relative", marginBottom: "20px", display: "inline-block", width: "100%", maxWidth: "340px" }}>
                <select
                    value={selectedParentId}
                    onChange={handleParentChange}
                    style={{
                        width: "100%",
                        padding: "12px 20px",
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        color: "var(--text-main)",
                        background: "#ffffff",
                        border: "1.5px solid var(--accent)",
                        borderRadius: "30px",
                        outline: "none",
                        cursor: "pointer",
                        boxShadow: "var(--shadow-sm)",
                        appearance: "none",
                        WebkitAppearance: "none",
                        MozAppearance: "none"
                    }}
                >
                    {parents.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
                <div style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--accent)" }}>
                    <ChevronDown size={18} />
                </div>
            </div>

            {/* Sub-categories horizontal scrollbar */}
            {activeParent && (
                <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
                    <div style={{ 
                        display: "flex", 
                        gap: "8px", 
                        overflowX: "auto", 
                        width: "100%",
                        padding: "4px 0 8px",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        WebkitOverflowScrolling: "touch",
                        justifyContent: activeSubs.length > 0 ? "flex-start" : "center"
                    }} className="hide-scrollbar">
                        {/* Option: View All */}
                        <button
                            type="button"
                            onClick={() => handleCategoryClick(activeParent.name)}
                            style={{
                                padding: "8px 16px",
                                fontSize: "0.82rem",
                                fontWeight: 600,
                                color: "#ffffff",
                                background: "var(--accent)",
                                border: "none",
                                borderRadius: "20px",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                boxShadow: "var(--shadow-sm)",
                                transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                        >
                            All {activeParent.name}
                        </button>

                        {/* Specific child sub-categories */}
                        {activeSubs.map(sub => (
                            <button
                                key={sub.id}
                                type="button"
                                onClick={() => handleCategoryClick(sub.name)}
                                style={{
                                    padding: "8px 16px",
                                    fontSize: "0.82rem",
                                    fontWeight: 500,
                                    color: "var(--text-muted)",
                                    background: "rgba(255, 255, 255, 0.7)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "20px",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                    transition: "all 0.2s ease"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = "var(--accent)";
                                    e.currentTarget.style.color = "var(--accent)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = "var(--border)";
                                    e.currentTarget.style.color = "var(--text-muted)";
                                }}
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
