"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

export default function AddProductPage() {
    const router = useRouter();
    const [product, setProduct] = useState({
        name: "",
        price: "",
        purchase_price: "",
        discounted_price: "",
        stock: "",
        description: "",
        features: "",
        category_id: "",
        image_url: "",
    });
    const [variationGroups, setVariationGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState([]);

    const handleOptionImageUpload = async (groupIndex, optionIndex, file) => {
        setUploading(true);
        const formData = new FormData();
        formData.append("image", file);
        
        const cat = categories.find(c => c.id === parseInt(product.category_id));
        const categoryName = cat ? cat.name : "Uncategorized";
        formData.append("folder", `tivaa-products/${categoryName}`);

        try {
            const res = await api.post("/upload/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
            setVariationGroups(prev => {
                const newGroups = [...prev];
                newGroups[groupIndex].options[optionIndex].image_url = res.data.url;
                return newGroups;
            });
        } catch (err) {
            console.error("Upload error:", err);
            alert("Failed to upload variation image.");
        } finally {
            setUploading(false);
        }
    };

    const handleFileUpload = async (file) => {
        setUploading(true);
        const formData = new FormData();
        formData.append("image", file);

        const cat = categories.find(c => c.id === parseInt(product.category_id));
        const categoryName = cat ? cat.name : "Uncategorized";
        formData.append("folder", `tivaa-products/${categoryName}`);

        try {
            const res = await api.post("/upload/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setProduct((prev) => {
                const current = prev.image_url ? prev.image_url.split(",").map(u => u.trim()).filter(Boolean) : [];
                const updated = [...current, res.data.url];
                return { ...prev, image_url: updated.join(",") };
            });
        } catch (err) {
            console.error("Upload error:", err);
            alert(err.response?.data?.message || err.response?.data?.error || "Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        setProduct((prev) => {
            const current = prev.image_url ? prev.image_url.split(",").map(u => u.trim()).filter(Boolean) : [];
            const updated = current.filter((_, idx) => idx !== indexToRemove);
            return { ...prev, image_url: updated.join(",") };
        });
    };

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await api.get("/categories");
                setCategories(res.data || []);
            } catch (err) {
                console.error("Failed to load categories.");
            }
        }
        fetchCategories();
    }, []);

    const addProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Parse variations from the visual builder
            let parsedVariations = null;
            const validGroups = variationGroups.filter(g => g.name.trim() !== "" && g.options.some(o => o.value.trim() !== ""));
            if (validGroups.length > 0) {
                // Filter out empty options inside valid groups
                const cleanGroups = validGroups.map(g => ({
                    ...g,
                    options: g.options.filter(o => o.value.trim() !== "")
                }));
                parsedVariations = JSON.stringify(cleanGroups);
            }

            const payload = {
                ...product,
                variations: parsedVariations
            };

            await api.post("/admin/product", payload);
            router.push("/admin/products");
            setTimeout(() => alert("Product added securely."), 100);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "32px" }}>
                <Link href="/admin/products" className="btn btn-secondary" style={{ padding: "8px 12px" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </Link>
                <div>
                    <h1 style={{ fontSize: "2.5rem", margin: 0 }}>Add Product</h1>
                    <p style={{ color: "var(--text-muted)", margin: "8px 0 0 0" }}>Create a new item in your catalog</p>
                </div>
            </div>

            <div className="card" style={{ padding: "32px", maxWidth: "800px" }}>
                <form onSubmit={addProduct} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div className="product-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Product Name *</label>
                            <input
                                className="input-field"
                                placeholder="E.g. Premium Wireless Headphones"
                                value={product.name}
                                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Category</label>
                            <select
                                className="input-field"
                                value={product.category_id}
                                onChange={(e) => setProduct({ ...product, category_id: e.target.value })}
                                style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none', cursor: 'pointer' }}
                            >
                                <option value="" disabled>Select a Category...</option>
                                {(() => {
                                    const parents = categories.filter(c => !c.parent_id);
                                    const subs = categories.filter(c => c.parent_id);
                                    const sorted = [];
                                    parents.forEach(p => {
                                        sorted.push(p);
                                        const children = subs.filter(s => Number(s.parent_id) === Number(p.id));
                                        children.forEach(c => {
                                            sorted.push({ ...c, displayName: `${p.name} > ${c.name}` });
                                        });
                                    });
                                    const orphans = subs.filter(s => !parents.some(p => Number(p.id) === Number(s.parent_id)));
                                    orphans.forEach(s => {
                                        sorted.push({ ...s, displayName: `Orphan > ${s.name}` });
                                    });
                                    return sorted.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.displayName || c.name}
                                        </option>
                                    ));
                                })()}
                            </select>
                        </div>
                    </div>

                    <div className="product-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Selling Price (₹) *</label>
                            <input
                                className="input-field"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={product.price}
                                onChange={(e) => setProduct({ ...product, price: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Discounted Price (₹)</label>
                            <input
                                className="input-field"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={product.discounted_price}
                                onChange={(e) => setProduct({ ...product, discounted_price: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="product-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "20px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Purchase Price (₹)</label>
                            <input
                                className="input-field"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={product.purchase_price}
                                onChange={(e) => setProduct({ ...product, purchase_price: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Stock Available *</label>
                            <input
                                className="input-field"
                                type="number"
                                placeholder="0"
                                value={product.stock}
                                onChange={(e) => setProduct({ ...product, stock: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Product Image</label>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {/* Drag & Drop File Upload Area */}
                            <div 
                                style={{ 
                                    border: "2px dashed var(--border)", 
                                    borderRadius: "12px", 
                                    padding: "32px", 
                                    textAlign: "center", 
                                    background: "rgba(255,255,255,0.01)", 
                                    cursor: "pointer",
                                    transition: "all 0.2s ease"
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.style.borderColor = "var(--accent)";
                                    e.currentTarget.style.background = "rgba(16, 185, 129, 0.03)";
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.style.borderColor = "var(--border)";
                                    e.currentTarget.style.background = "rgba(255,255,255,0.01)";
                                }}
                                onDrop={async (e) => {
                                    e.preventDefault();
                                    e.currentTarget.style.borderColor = "var(--border)";
                                    e.currentTarget.style.background = "rgba(255,255,255,0.01)";
                                    const file = e.dataTransfer.files[0];
                                    if (file) await handleFileUpload(file);
                                }}
                                onClick={() => document.getElementById("product-file-input").click()}
                            >
                                <input 
                                    id="product-file-input" 
                                    type="file" 
                                    accept="image/*" 
                                    style={{ display: "none" }} 
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (file) await handleFileUpload(file);
                                    }}
                                />
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                    <div>
                                        <span style={{ color: "var(--accent)", fontWeight: 600 }}>Click to upload</span> or drag and drop
                                    </div>
                                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>PNG, JPG, JPEG up to 5MB</span>
                                </div>
                            </div>

                            {/* Upload Loading Progress */}
                            {uploading && (
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                    <span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.2)", borderRadius: "50%", borderTopColor: "var(--accent)", animation: "spin 1s linear infinite" }}></span>
                                    Uploading image to secure storage...
                                </div>
                            )}

                            {/* Upload Preview & Action */}
                            {(() => {
                                const imageUrls = product.image_url ? product.image_url.split(",").map(u => u.trim()).filter(Boolean) : [];
                                return imageUrls.length > 0 && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "12px" }}>
                                        <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-main)" }}>Uploaded Images ({imageUrls.length})</div>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                                            {imageUrls.map((url, idx) => (
                                                <div 
                                                    key={idx} 
                                                    style={{ 
                                                        position: "relative", 
                                                        width: "90px", 
                                                        height: "90px", 
                                                        borderRadius: "8px", 
                                                        border: "1px solid var(--border)",
                                                        overflow: "hidden"
                                                    }}
                                                >
                                                    <img 
                                                        src={url} 
                                                        alt={`Upload preview ${idx + 1}`} 
                                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveImage(idx)}
                                                        style={{
                                                            position: "absolute",
                                                            top: "4px",
                                                            right: "4px",
                                                            background: "rgba(239, 68, 68, 0.9)",
                                                            color: "#ffffff",
                                                            border: "none",
                                                            borderRadius: "50%",
                                                            width: "20px",
                                                            height: "20px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontSize: "12px",
                                                            cursor: "pointer",
                                                            fontWeight: "bold",
                                                            padding: 0,
                                                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                                            transition: "background 0.2s"
                                                        }}
                                                        title="Remove Image"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* URL Textbox fallback */}
                            <div>
                                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                                    Or paste image URLs (separate multiple URLs with commas)
                                </label>
                                <input
                                    className="input-field"
                                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                                    value={product.image_url}
                                    onChange={(e) => setProduct({ ...product, image_url: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Description</label>
                        <ReactQuill
                            theme="snow"
                            value={product.description}
                            onChange={(val) => setProduct({ ...product, description: val })}
                            style={{ background: "transparent", color: "var(--text-main)", borderRadius: "8px" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>Product Features (Optional)</label>
                        <textarea
                            className="input-field"
                            placeholder="Format: Feature Name: Description&#10;E.g.:&#10;Premium Quality: Built with high quality materials.&#10;Express Delivery: Delivered directly to your door."
                            value={product.features}
                            onChange={(e) => setProduct({ ...product, features: e.target.value })}
                            style={{ minHeight: "100px", resize: "vertical" }}
                        ></textarea>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                            Place each feature on its own line. Use a colon (:) to bold the feature name.
                        </span>
                    </div>

                    <div style={{ border: "1px solid var(--border)", padding: "24px", borderRadius: "12px", background: "rgba(0,0,0,0.01)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                            <label style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "var(--text-main)" }}>Visual Variations (Optional)</label>
                            <button 
                                type="button" 
                                onClick={() => setVariationGroups([...variationGroups, { name: "", options: [{ value: "", image_url: "" }] }])}
                                className="btn btn-secondary"
                                style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                            >
                                + Add Variation Group
                            </button>
                        </div>
                        
                        {variationGroups.length === 0 && (
                            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>No variations added. Product will be standard without size or color options.</p>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            {variationGroups.map((group, gIndex) => (
                                <div key={gIndex} style={{ padding: "16px", background: "#ffffff", border: "1px solid var(--border)", borderRadius: "8px", position: "relative" }}>
                                    <button 
                                        type="button" 
                                        onClick={() => setVariationGroups(variationGroups.filter((_, i) => i !== gIndex))}
                                        style={{ position: "absolute", top: "12px", right: "12px", background: "transparent", color: "var(--danger)", border: "none", cursor: "pointer", fontSize: "0.8rem" }}
                                    >
                                        Remove Group
                                    </button>
                                    
                                    <div style={{ marginBottom: "16px", maxWidth: "300px" }}>
                                        <label style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", color: "var(--text-muted)" }}>Group Name (e.g., Color, Size)</label>
                                        <input
                                            className="input-field"
                                            value={group.name}
                                            onChange={(e) => {
                                                const newGroups = [...variationGroups];
                                                newGroups[gIndex].name = e.target.value;
                                                setVariationGroups(newGroups);
                                            }}
                                            placeholder="Group Name"
                                        />
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                        <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Options</label>
                                        {group.options.map((option, oIndex) => (
                                            <div key={oIndex} style={{ display: "flex", gap: "12px", alignItems: "center", background: "rgba(0,0,0,0.02)", padding: "12px", borderRadius: "6px", flexWrap: "wrap" }}>
                                                <div style={{ flex: 2, minWidth: "120px" }}>
                                                    <input
                                                        className="input-field"
                                                        value={option.value}
                                                        onChange={(e) => {
                                                            const newGroups = [...variationGroups];
                                                            newGroups[gIndex].options[oIndex].value = e.target.value;
                                                            setVariationGroups(newGroups);
                                                        }}
                                                        placeholder="Option Value (e.g., Red, Small)"
                                                    />
                                                </div>

                                                {/* Price Override */}
                                                <div style={{ flex: 1, minWidth: "80px" }}>
                                                    <input
                                                        className="input-field"
                                                        type="number"
                                                        value={option.price || ""}
                                                        onChange={(e) => {
                                                            const newGroups = [...variationGroups];
                                                            newGroups[gIndex].options[oIndex].price = e.target.value;
                                                            setVariationGroups(newGroups);
                                                        }}
                                                        placeholder="Price (Amount) (₹)"
                                                    />
                                                </div>

                                                {/* Stock Override */}
                                                <div style={{ flex: 1, minWidth: "80px" }}>
                                                    <input
                                                        className="input-field"
                                                        type="number"
                                                        value={option.stock || ""}
                                                        onChange={(e) => {
                                                            const newGroups = [...variationGroups];
                                                            newGroups[gIndex].options[oIndex].stock = e.target.value;
                                                            setVariationGroups(newGroups);
                                                        }}
                                                        placeholder="Stock (Qty)"
                                                    />
                                                </div>
                                                
                                                {/* Option Image Upload */}
                                                <div style={{ flex: 1.5, minWidth: "100px", display: "flex", alignItems: "center", gap: "8px" }}>
                                                    {option.image_url ? (
                                                        <div style={{ position: "relative", width: "40px", height: "40px", borderRadius: "4px", overflow: "hidden", border: "1px solid var(--border)" }}>
                                                            <img src={option.image_url} alt="Variant" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                            <button 
                                                                type="button" 
                                                                onClick={() => {
                                                                    const newGroups = [...variationGroups];
                                                                    newGroups[gIndex].options[oIndex].image_url = "";
                                                                    setVariationGroups(newGroups);
                                                                }}
                                                                style={{ position: "absolute", top: 0, right: 0, background: "rgba(0,0,0,0.5)", color: "white", border: "none", cursor: "pointer", padding: "2px 4px", fontSize: "10px" }}
                                                            >×</button>
                                                        </div>
                                                    ) : (
                                                        <div style={{ position: "relative" }}>
                                                            <button 
                                                                type="button" 
                                                                className="btn btn-secondary" 
                                                                style={{ padding: "6px 10px", fontSize: "0.75rem" }}
                                                                onClick={() => document.getElementById(`var-img-${gIndex}-${oIndex}`).click()}
                                                            >
                                                                Upload Image
                                                            </button>
                                                            <input 
                                                                id={`var-img-${gIndex}-${oIndex}`}
                                                                type="file" 
                                                                accept="image/*" 
                                                                style={{ display: "none" }} 
                                                                onChange={(e) => {
                                                                    const file = e.target.files[0];
                                                                    if (file) handleOptionImageUpload(gIndex, oIndex, file);
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <button 
                                                    type="button" 
                                                    onClick={() => {
                                                        const newGroups = [...variationGroups];
                                                        newGroups[gIndex].options = newGroups[gIndex].options.filter((_, i) => i !== oIndex);
                                                        setVariationGroups(newGroups);
                                                    }}
                                                    style={{ background: "transparent", color: "var(--text-muted)", border: "none", cursor: "pointer", fontSize: "1.2rem", padding: "0 8px" }}
                                                    title="Remove Option"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                const newGroups = [...variationGroups];
                                                newGroups[gIndex].options.push({ value: "", image_url: "", price: "", stock: "" });
                                                setVariationGroups(newGroups);
                                            }}
                                            style={{ alignSelf: "flex-start", background: "transparent", color: "var(--accent)", border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, padding: 0 }}
                                        >
                                            + Add Option
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: "24px", display: "flex", justifyContent: "flex-end" }}>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: "12px 24px" }}>
                            {loading ? "Adding..." : "Publish Product"}
                        </button>
                    </div>
                </form>
            </div>
            <style jsx>{`
                @media (max-width: 600px) {
                    .product-form-grid {
                        grid-template-columns: 1fr !important;
                        gap: 16px !important;
                    }
                }
            `}</style>
        </div>
    );
}
