"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";

export default function CategorySelect({ categories = [], currentCategory, currentSort }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const parents = categories.filter(c => !c.parent_id);
    const subs = categories.filter(c => c.parent_id);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (categoryName) => {
        const params = new URLSearchParams(searchParams.toString());
        if (categoryName) {
            params.set("category", categoryName);
        } else {
            params.delete("category");
        }
        params.delete("page"); // Reset page
        params.delete("q"); // Clear search query when explicitly selecting a category
        router.push(`/products?${params.toString()}`);
        setIsOpen(false);
    };

    const activeDisplay = currentCategory || "All Collections";

    return (
        <div ref={dropdownRef} style={{ position: "relative", display: "inline-block", width: "100%", maxWidth: "340px" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 500, display: "block", marginBottom: "8px" }}>Collection:</span>
            
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "#ffffff",
                    color: "var(--text-main)",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    width: "100%",
                    boxShadow: "var(--shadow-sm)",
                    transition: "all 0.2s ease",
                    fontFamily: "inherit",
                    outline: "none"
                }}
            >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeDisplay}</span>
                <ChevronDown size={16} style={{ color: "var(--text-muted)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>

            {isOpen && (
                <div 
                    className="animate-slide-down"
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        marginTop: "6px",
                        background: "#ffffff",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
                        zIndex: 100,
                        maxHeight: "340px",
                        overflowY: "auto",
                        padding: "6px"
                    }}
                >
                    {/* Option: All Collections */}
                    <button
                        type="button"
                        onClick={() => handleSelect("")}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            padding: "10px 12px",
                            fontSize: "0.85rem",
                            fontWeight: !currentCategory ? 600 : 400,
                            color: !currentCategory ? "var(--accent)" : "var(--text-main)",
                            background: !currentCategory ? "rgba(122, 56, 194, 0.04)" : "transparent",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "background 0.2s"
                        }}
                        onMouseOver={(e) => !currentCategory ? null : e.currentTarget.style.background = "#f7f7f7"}
                        onMouseOut={(e) => !currentCategory ? null : e.currentTarget.style.background = "transparent"}
                    >
                        <span>All Collections</span>
                        {!currentCategory && <Check size={14} />}
                    </button>

                    <div style={{ height: "1px", background: "var(--border)", margin: "4px 0" }}></div>

                    {/* Parents & Subcategories Tree */}
                    {parents.map(parent => {
                        const isParentSelected = currentCategory === parent.name;
                        const children = subs.filter(child => Number(child.parent_id) === Number(parent.id));

                        return (
                            <div key={parent.id} style={{ display: "flex", flexDirection: "column" }}>
                                {/* Main Category Button */}
                                <button
                                    type="button"
                                    onClick={() => handleSelect(parent.name)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        width: "100%",
                                        padding: "10px 12px",
                                        fontSize: "0.85rem",
                                        fontWeight: isParentSelected ? 600 : 500,
                                        color: isParentSelected ? "var(--accent)" : "var(--text-main)",
                                        background: isParentSelected ? "rgba(122, 56, 194, 0.04)" : "transparent",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        textAlign: "left",
                                        transition: "background 0.2s"
                                    }}
                                    onMouseOver={(e) => isParentSelected ? null : e.currentTarget.style.background = "#f7f7f7"}
                                    onMouseOut={(e) => isParentSelected ? null : e.currentTarget.style.background = "transparent"}
                                >
                                    <span>{parent.name}</span>
                                    {isParentSelected && <Check size={14} />}
                                </button>

                                {/* Nested Subcategories */}
                                {children.map(child => {
                                    const isChildSelected = currentCategory === child.name;
                                    return (
                                        <button
                                            key={child.id}
                                            type="button"
                                            onClick={() => handleSelect(child.name)}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                width: "calc(100% - 20px)",
                                                marginLeft: "20px",
                                                padding: "8px 12px",
                                                fontSize: "0.8rem",
                                                fontWeight: isChildSelected ? 600 : 400,
                                                color: isChildSelected ? "var(--accent)" : "var(--text-muted)",
                                                background: isChildSelected ? "rgba(122, 56, 194, 0.04)" : "transparent",
                                                border: "none",
                                                borderRadius: "6px",
                                                cursor: "pointer",
                                                textAlign: "left",
                                                transition: "background 0.2s"
                                            }}
                                            onMouseOver={(e) => isChildSelected ? null : e.currentTarget.style.background = "#f7f7f7"}
                                            onMouseOut={(e) => isChildSelected ? null : e.currentTarget.style.background = "transparent"}
                                        >
                                            <span>↳ {child.name}</span>
                                            {isChildSelected && <Check size={14} />}
                                        </button>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
