"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function Dropdown({
    value,
    placeholder = "Select Option",
    options = [],
    onChange,
    label,
    style = {},
    maxWidth = "340px",
    isCategoryTree = false,
    categories = [],
    currentCategory
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

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

    const handleSelect = (optionValue) => {
        if (onChange) onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div 
            ref={dropdownRef} 
            style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "8px", 
                width: "100%", 
                maxWidth: maxWidth,
                position: "relative",
                ...style 
            }}
        >
            {label && (
                <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 500, flexShrink: 0 }}>
                    {label}
                </span>
            )}
            
            <div style={{ position: "relative", flexGrow: 1, minWidth: 0 }}>
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
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {value || placeholder}
                    </span>
                    <ChevronDown 
                        size={16} 
                        style={{ 
                            color: "var(--text-muted)", 
                            transform: isOpen ? "rotate(180deg)" : "none", 
                            transition: "transform 0.2s",
                            marginLeft: "8px",
                            flexShrink: 0
                        }} 
                    />
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
                        {isCategoryTree ? (
                            <>
                                {/* All Collections Option */}
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
                                
                                {categories.filter(c => !c.parent_id).map(parent => {
                                    const isParentSelected = currentCategory === parent.name;
                                    const children = categories.filter(c => Number(c.parent_id) === Number(parent.id));

                                    return (
                                        <div key={parent.id} style={{ display: "flex", flexDirection: "column" }}>
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
                            </>
                        ) : (
                            options.map(opt => {
                                const isSelected = String(opt.value) === String(value) || opt.label === value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleSelect(opt.value)}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            width: "100%",
                                            padding: "10px 12px",
                                            fontSize: "0.85rem",
                                            fontWeight: isSelected ? 600 : 400,
                                            color: isSelected ? "var(--accent)" : "var(--text-main)",
                                            background: isSelected ? "rgba(122, 56, 194, 0.04)" : "transparent",
                                            border: "none",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            textAlign: "left",
                                            transition: "background 0.2s"
                                        }}
                                        onMouseOver={(e) => isSelected ? null : e.currentTarget.style.background = "#f7f7f7"}
                                        onMouseOut={(e) => isSelected ? null : e.currentTarget.style.background = "transparent"}
                                    >
                                        <span>{opt.label}</span>
                                        {isSelected && <Check size={14} />}
                                    </button>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
