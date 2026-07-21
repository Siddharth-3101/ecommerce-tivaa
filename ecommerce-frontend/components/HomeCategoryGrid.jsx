"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { slugify } from "@/lib/slug";

export default function HomeCategoryGrid({ categories = [], products = [] }) {
    const router = useRouter();
    const dropdownRef = useRef(null);
    
    const parents = categories.filter(c => !c.parent_id);
    
    // State for the selected parent category and dropdown visibility
    const [selectedParentId, setSelectedParentId] = useState(parents[0]?.id || "");
    const [isOpen, setIsOpen] = useState(false);

    // Detect click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (parents.length === 0) return null;

    const activeParent = parents.find(p => Number(p.id) === Number(selectedParentId)) || parents[0];
    const subcategories = categories.filter(c => Number(c.parent_id) === Number(activeParent.id));

    const handleMainCategoryClick = () => {
        router.push(`/category/${slugify(activeParent.name)}`);
    };

    const handleSelectParent = (parentId) => {
        setSelectedParentId(parentId);
        setIsOpen(false);
    };

    // Resolves a subcategory image dynamically
    const getSubcategoryImage = (subcategory) => {
        if (subcategory.image_url && subcategory.image_url.trim()) {
            return subcategory.image_url.trim();
        }

        // Curated brand graphics fallbacks
        const fallbacks = {
            'hairbows': 'https://res.cloudinary.com/dft1i2ozo/image/upload/v1779700729/tivaa-products/dstpoqprasvcizdlox8n.jpg',
            'meenakaari bangles': 'https://res.cloudinary.com/dft1i2ozo/image/upload/v1779700873/tivaa-products/dr1hiyiwgdfhphf4f8cz.jpg',
            'general': '/placeholder.png'
        };
        
        const catNameLower = subcategory.name.trim().toLowerCase();
        
        // Find product image under this subcategory ID
        const matchedProd = products.find(p => p.category_id === subcategory.id && p.image_url);
        if (matchedProd && matchedProd.image_url) {
            return matchedProd.image_url.split(",")[0].trim();
        }

        return fallbacks[catNameLower] || fallbacks['general'];
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            
            {/* Split Dropdown Selector for Parent Categories */}
            <div 
                ref={dropdownRef} 
                style={{ 
                    display: "flex", 
                    justifyContent: "center", 
                    marginBottom: "50px",
                    width: "100%"
                }}
            >
                <div className="category-dropdown-split">
                    {/* Left: Clickable Category Name to View All Products */}
                    <button
                        type="button"
                        onClick={handleMainCategoryClick}
                        className="category-dropdown-name"
                        title={`View all products under ${activeParent.name}`}
                    >
                        {activeParent.name}
                    </button>
                    
                    {/* Right: Dropdown Chevron to select other categories */}
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="category-dropdown-trigger"
                        aria-label="Toggle category selection list"
                    >
                        <ChevronDown 
                            size={18} 
                            style={{ 
                                transform: isOpen ? "rotate(180deg)" : "none", 
                                transition: "transform 0.2s ease" 
                            }} 
                        />
                    </button>

                    {/* Dropdown list popup */}
                    {isOpen && (
                        <div className="category-dropdown-list animate-slide-down">
                            {parents.map(p => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => handleSelectParent(p.id)}
                                    className={`category-dropdown-item ${Number(p.id) === Number(selectedParentId) ? "active" : ""}`}
                                >
                                    {p.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Sub-categories card grid */}
            <div className="category-container" style={{ width: "100%" }}>
                {subcategories.length > 0 ? (
                    subcategories.map((sub) => (
                        <Link 
                            key={sub.id} 
                            href={`/category/${slugify(activeParent.name)}/${slugify(sub.name)}`} 
                            className="category-item animate-fade-in"
                        >
                            <div className="category-image-container">
                                <img 
                                    src={getSubcategoryImage(sub)} 
                                    alt={sub.name} 
                                    className="category-image"
                                    loading="lazy"
                                />
                            </div>
                            <div className="category-title">
                                {sub.name} 
                                <span style={{ fontSize: "1.1rem", transition: "transform 0.2s" }}>→</span>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div 
                        style={{ 
                            padding: "60px 40px", 
                            background: "rgba(122, 56, 194, 0.02)", 
                            border: "1px dashed rgba(122, 56, 194, 0.15)",
                            borderRadius: "16px",
                            gridColumn: "1 / -1", 
                            textAlign: "center", 
                            color: "var(--text-muted)", 
                            fontSize: "0.95rem",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "16px",
                            width: "100%"
                        }}
                    >
                        <span>No subcollections in "{activeParent.name}" at the moment.</span>
                        <button
                            type="button"
                            onClick={handleMainCategoryClick}
                            className="btn-black-solid"
                            style={{ padding: "8px 20px", fontSize: "0.8rem" }}
                        >
                            View All {activeParent.name} Products
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
