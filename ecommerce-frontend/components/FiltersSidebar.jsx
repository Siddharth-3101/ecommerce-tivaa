"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import CategorySelect from "./CategorySelect";

export default function FiltersSidebar({ categories = [], filtersList = [], currentCategory }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // 1. Initial State parsing from URL SearchParams
    const initialMinPrice = Number(searchParams.get("min_price")) || 0;
    const initialMaxPrice = Number(searchParams.get("max_price")) || 5000;
    
    const [minPrice, setMinPrice] = useState(initialMinPrice);
    const [maxPrice, setMaxPrice] = useState(initialMaxPrice);

    // Collapsible sections and "Show More Filters" state
    const [expandedSections, setExpandedSections] = useState({});
    const [showMore, setShowMore] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Initialize/sync sections expansion
    useEffect(() => {
        const initial = {};
        filtersList.forEach(attr => {
            const key = attr.code.toLowerCase();
            // By default, collapse all attributes
            initial[key] = false;
        });
        setExpandedSections(initial);
    }, [filtersList]);

    const toggleSection = (attrCode) => {
        const key = attrCode.toLowerCase();
        setExpandedSections(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Dynamic attributes state: { [attribute_code_lower]: [array of selected value codes/names] }
    const [selectedAttrs, setSelectedAttrs] = useState({});

    useEffect(() => {
        // Sync states when URL params change (e.g. on load or clear)
        setMinPrice(Number(searchParams.get("min_price")) || 0);
        setMaxPrice(Number(searchParams.get("max_price")) || 5000);

        const newSelected = {};
        // Parse search params for all dynamic attributes
        filtersList.forEach(attr => {
            const codeKey = attr.code.toLowerCase();
            const paramVal = searchParams.get(codeKey);
            if (paramVal) {
                newSelected[codeKey] = paramVal.split(",").map(v => v.trim().toLowerCase());
            } else {
                newSelected[codeKey] = [];
            }
        });
        setSelectedAttrs(newSelected);
    }, [searchParams, filtersList]);

    // 2. Handle Toggling checkboxes
    const handleCheckboxToggle = (attrCode, valCode) => {
        const key = attrCode.toLowerCase();
        const value = valCode.toLowerCase();
        setSelectedAttrs(prev => {
            const currentList = prev[key] || [];
            let newList;
            if (currentList.includes(value)) {
                newList = currentList.filter(v => v !== value);
            } else {
                newList = [...currentList, value];
            }
            return {
                ...prev,
                [key]: newList
            };
        });
    };

    // 3. Handle Color swatches
    const handleColorToggle = (attrCode, valCode) => {
        handleCheckboxToggle(attrCode, valCode);
    };

    // 4. Apply Filters navigation
    const handleApplyFilters = () => {
        setIsMobileOpen(false); // Close mobile drawer
        const params = new URLSearchParams(searchParams.toString());

        // Set Price Range
        if (minPrice > 0) {
            params.set("min_price", minPrice.toString());
        } else {
            params.delete("min_price");
        }
        
        if (maxPrice < 5000) {
            params.set("max_price", maxPrice.toString());
        } else {
            params.delete("max_price");
        }

        // Set Dynamic Attributes
        Object.entries(selectedAttrs).forEach(([key, values]) => {
            if (values.length > 0) {
                params.set(key, values.join(","));
            } else {
                params.delete(key);
            }
        });

        // Reset page to 1 on filter apply
        params.delete("page");

        if (pathname.startsWith("/category/")) {
            // Keep user on the category specific route page, remove generic category parameter
            params.delete("category");
            router.push(`${pathname}?${params.toString()}`);
        } else {
            // Main search page
            if (currentCategory) {
                params.set("category", currentCategory);
            } else {
                params.delete("category");
            }
            router.push(`/products?${params.toString()}`);
        }
    };

    // 5. Clear Filters navigation
    const handleClearFilters = () => {
        setIsMobileOpen(false); // Close mobile drawer
        const params = new URLSearchParams();
        // Preserve search query if active
        const q = searchParams.get("q");
        if (q) params.set("q", q);
        
        // Preserve sort if active
        const sort = searchParams.get("sort");
        if (sort) params.set("sort", sort);

        if (pathname.startsWith("/category/")) {
            router.push(`${pathname}?${params.toString()}`);
        } else {
            if (currentCategory) {
                params.set("category", currentCategory);
            }
            router.push(`/products?${params.toString()}`);
        }
    };

    // Filters that should be rendered (show_in_filter must be true/1)
    const catObj = categories.find(c => c.name.toLowerCase() === (currentCategory || "").toLowerCase());

    const visibleFilters = filtersList.filter(attr => {
        // Must be marked to show in filters
        if (!(attr.show_in_filter === 1 || attr.show_in_filter === true || attr.show_in_filter === "1")) {
            return false;
        }

        if (!catObj) {
            // Case 1: All categories selected -> show only Universal attributes
            return attr.level === "Universal";
        }

        const isSubcategory = catObj.parent_id !== null && catObj.parent_id !== undefined;

        if (isSubcategory) {
            // Case 3: Subcategory is selected -> show Universal, parent Category attributes, and its own Subcategory attributes
            if (attr.level === "Universal") return true;
            if (attr.level === "Category" && Number(attr.category_id) === Number(catObj.parent_id)) return true;
            if (attr.level === "Subcategory" && Number(attr.subcategory_id) === Number(catObj.id)) return true;
            return false;
        } else {
            // Case 2: Main Category is selected -> show Universal and Category-level attributes for this category
            if (attr.level === "Universal") return true;
            if (attr.level === "Category" && Number(attr.category_id) === Number(catObj.id)) return true;
            return false;
        }
    });



    // Split visible filters by level
    const universalFilters = visibleFilters.filter(attr => attr.level === "Universal");
    const extraFilters = visibleFilters.filter(attr => attr.level !== "Universal");

    const renderAttributeSection = (attr) => {
        const key = attr.code.toLowerCase();
        const selectedVals = selectedAttrs[key] || [];
        const isColor = attr.control_type === "Color Palette";
        const isExpanded = !!expandedSections[key];

        return (
            <div key={attr.id} style={{ borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
                <div
                    onClick={() => toggleSection(attr.code)}
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        userSelect: "none"
                    }}
                >
                    <label style={{ 
                        display: "block", 
                        fontSize: "0.85rem", 
                        fontWeight: 700, 
                        color: "var(--text-main)", 
                        textTransform: "uppercase", 
                        letterSpacing: "0.5px",
                        margin: 0,
                        cursor: "pointer"
                    }}>
                        {attr.name}
                    </label>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700 }}>
                        {isExpanded ? "▲" : "▼"}
                    </span>
                </div>
                
                {isExpanded && (
                    <div style={{ marginTop: "16px" }}>
                        {isColor ? (
                            /* Circular Color Swatches */
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                {attr.values.map(val => {
                                    const valLower = (val.code || val.value).toLowerCase();
                                    const isSelected = selectedVals.includes(valLower);
                                    const circleColor = val.code || val.value;

                                    return (
                                        <button
                                            key={val.id}
                                            type="button"
                                            onClick={() => handleColorToggle(attr.code, val.code || val.value)}
                                            title={val.value}
                                            style={{
                                                width: "26px",
                                                height: "26px",
                                                borderRadius: "50%",
                                                backgroundColor: circleColor,
                                                border: isSelected ? "2.5px solid var(--accent)" : "1px solid rgba(0,0,0,0.15)",
                                                cursor: "pointer",
                                                padding: 0,
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                boxShadow: isSelected ? "0 0 5px rgba(16, 185, 129, 0.4)" : "inset 0 1px 2px rgba(0,0,0,0.1)",
                                                transition: "transform 0.15s ease, border-color 0.15s ease",
                                                transform: isSelected ? "scale(1.1)" : "scale(1)"
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                                            onMouseLeave={(e) => {
                                                if (!isSelected) e.currentTarget.style.transform = "scale(1)";
                                            }}
                                        >
                                            {isSelected && (
                                                <span style={{
                                                    width: "6px",
                                                    height: "6px",
                                                    borderRadius: "50%",
                                                    backgroundColor: ["#ffffff", "white", "#fff", "#ffff00", "yellow", "gold"].includes(circleColor.toLowerCase()) ? "#000000" : "#ffffff"
                                                }} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            /* Standard Attributes Checkboxes */
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {attr.values.map(val => {
                                    const valLower = (val.code || val.value).toLowerCase();
                                    const isChecked = selectedVals.includes(valLower);

                                    return (
                                        <label
                                            key={val.id}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                fontSize: "0.9rem",
                                                fontWeight: isChecked ? 600 : 500,
                                                color: isChecked ? "var(--text-main)" : "var(--text-muted)",
                                                cursor: "pointer",
                                                userSelect: "none",
                                                transition: "color 0.15s ease"
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handleCheckboxToggle(attr.code, val.code || val.value)}
                                                style={{
                                                    width: "16px",
                                                    height: "16px",
                                                    cursor: "pointer",
                                                    accentColor: "var(--accent)"
                                                }}
                                            />
                                            {val.value}
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const activeFiltersCount = 
        (minPrice > 0 ? 1 : 0) + 
        (maxPrice < 5000 ? 1 : 0) + 
        Object.values(selectedAttrs).filter(arr => Array.isArray(arr) && arr.length > 0).length;

    return (
        <>
            {/* Mobile Filter Trigger Button */}
            <div className="mobile-filter-bar-trigger">
                <button 
                    type="button"
                    onClick={() => setIsMobileOpen(true)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 20px",
                        borderRadius: "30px",
                        border: "1px solid var(--border)",
                        background: "var(--bg-card)",
                        color: "var(--text-main)",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "var(--shadow-sm)",
                        transition: "all 0.2s ease"
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </button>
            </div>

            {/* Mobile Sidebar Overlay Backdrop */}
            {isMobileOpen && (
                <div 
                    className="mobile-filter-drawer-backdrop"
                    onClick={() => setIsMobileOpen(false)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0, 0, 0, 0.4)",
                        backdropFilter: "blur(4px)",
                        zIndex: 9999
                    }}
                />
            )}

            <div className={`filters-sidebar-container ${isMobileOpen ? 'mobile-open' : ''}`}>
                {/* Mobile Drawer Header */}
                <div className="mobile-drawer-header">
                    <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text-main)" }}>Filters</span>
                    <button 
                        type="button" 
                        onClick={() => setIsMobileOpen(false)}
                        style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--text-main)",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Filter Actions */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", paddingBottom: "20px", borderBottom: "1px solid var(--border)" }}>
                <button
                    onClick={handleApplyFilters}
                    className="btn btn-primary"
                    style={{
                        width: "100%",
                        padding: "10px 12px",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                    }}
                >
                    Apply
                </button>
                <button
                    onClick={handleClearFilters}
                    className="btn btn-secondary"
                    style={{
                        width: "100%",
                        padding: "10px 12px",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                    }}
                >
                    Clear
                </button>
            </div>

            {/* Category Dropdown */}
            <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
                    Collections
                </label>
                <CategorySelect
                    categories={categories}
                    currentCategory={currentCategory}
                />
            </div>

            {/* Price Filter */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
                    Price Range
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <input
                        type="range"
                        min="0"
                        max="5000"
                        step="50"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        style={{
                            width: "100%",
                            cursor: "pointer",
                            accentColor: "var(--accent)"
                        }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginTop: "4px" }}>
                        <span>₹0</span>
                        <span style={{ color: "var(--accent)", fontWeight: 700 }}>₹{minPrice} — ₹{maxPrice}</span>
                    </div>
                </div>
            </div>

            {/* Dynamic Attributes (Universal list) */}
            {universalFilters.map(renderAttributeSection)}

            {/* Dynamic Attributes (Extra list) under Show More Filters */}
            {extraFilters.length > 0 && (
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    {showMore && extraFilters.map(renderAttributeSection)}
                    <button
                        type="button"
                        onClick={() => setShowMore(!showMore)}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--accent)",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "0",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            outline: "none"
                        }}
                    >
                        {showMore ? "— Hide Extra Filters" : "+ Show More Filters"}
                    </button>
                </div>
            )}
        </div>
            <style dangerouslySetInnerHTML={{ __html: `
                .mobile-filter-bar-trigger {
                    display: none;
                }
                .mobile-drawer-header {
                    display: none;
                }
                .filters-sidebar-container {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 24px;
                    width: 100%;
                    box-shadow: var(--shadow-sm);
                    align-self: flex-start;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    color: var(--text-main);
                }
                @media (max-width: 768px) {
                    .mobile-filter-bar-trigger {
                        display: block;
                        margin-bottom: 12px;
                    }
                    .mobile-drawer-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding-bottom: 16px;
                        border-bottom: 1px solid var(--border);
                    }
                    .filters-sidebar-container {
                        position: fixed;
                        top: 0;
                        left: 0;
                        height: 100vh;
                        width: 320px;
                        max-width: 85vw;
                        background: var(--bg-card);
                        z-index: 10000;
                        box-shadow: var(--shadow-lg);
                        border-radius: 0;
                        border: none;
                        border-right: 1px solid var(--border);
                        padding: 24px;
                        overflow-y: auto;
                        transform: translateX(-100%);
                        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .filters-sidebar-container.mobile-open {
                        transform: translateX(0);
                    }
                }
            `}} />
        </>
    );
}
