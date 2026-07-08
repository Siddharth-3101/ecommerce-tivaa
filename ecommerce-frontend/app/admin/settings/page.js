"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminSettingsPage() {
    const [slides, setSlides] = useState([]);
    const [showHeroBanner, setShowHeroBanner] = useState(true);
    const [shippingCost, setShippingCost] = useState("0");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [resequencing, setResequencing] = useState(false);
    const [resettingAll, setResettingAll] = useState(false);
    const [checking, setChecking] = useState(false);
    const [integrityResult, setIntegrityResult] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await api.get("/settings");
                if (res.data) {
                    let parsedSlides = [];
                    if (res.data.hero_slides) {
                        try {
                            parsedSlides = JSON.parse(res.data.hero_slides);
                        } catch (e) {
                            console.error("Failed to parse hero_slides:", e);
                        }
                    }
                    // If no slides exist, convert the existing desktop/mobile banner as the initial slide
                    if (parsedSlides.length === 0 && (res.data.desktop_banner || res.data.mobile_banner)) {
                        parsedSlides = [{
                            id: Date.now().toString(),
                            desktop_url: res.data.desktop_banner || "",
                            mobile_url: res.data.mobile_banner || "",
                            title: "Discover Everyday Essentials",
                            subtitle: "Fashion, Jewellery & More that you'll love",
                            link: "/products",
                            button_text: "Shop Now"
                        }];
                    }
                    setSlides(parsedSlides);
                    setShowHeroBanner(res.data.show_hero_banner !== "false");
                    setShippingCost(res.data.shipping_cost || "0");
                }
            } catch (err) {
                console.error("Failed to load settings:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchSettings();
    }, []);

    const handleSlideImageUpload = async (file, slideId, type) => {
        const formData = new FormData();
        formData.append("image", file);

        // Mark upload loading status for this slide
        setSlides(prev => prev.map(s => s.id === slideId ? { ...s, [`uploading_${type}`]: true } : s));

        try {
            const res = await api.post("/upload/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (res.data && res.data.url) {
                setSlides(prev => prev.map(s => s.id === slideId ? { ...s, [`${type}_url`]: res.data.url } : s));
            }
        } catch (err) {
            console.error("Failed to upload slide image:", err);
            alert("Image upload failed. Please try again.");
        } finally {
            setSlides(prev => prev.map(s => s.id === slideId ? { ...s, [`uploading_${type}`]: false } : s));
        }
    };

    const handleAddSlide = () => {
        const newSlide = {
            id: Date.now().toString(),
            desktop_url: "",
            mobile_url: "",
            title: "Discover Everyday Essentials",
            subtitle: "Fashion, Jewellery & More that you'll love",
            link: "/products",
            button_text: "Shop Now"
        };
        setSlides(prev => [...prev, newSlide]);
    };

    const handleRemoveSlide = (slideId) => {
        if (slides.length <= 1) {
            alert("At least one slide banner must remain.");
            return;
        }
        setSlides(prev => prev.filter(s => s.id !== slideId));
    };

    const handleSlideChange = (slideId, field, value) => {
        setSlides(prev => prev.map(s => s.id === slideId ? { ...s, [field]: value } : s));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        // Remove temporary uploading states
        const cleanedSlides = slides.map(({ uploading_desktop, uploading_mobile, ...s }) => s);

        try {
            await api.put("/settings", {
                settings: {
                    hero_slides: JSON.stringify(cleanedSlides),
                    // Backwards compatible single fallbacks
                    desktop_banner: cleanedSlides[0]?.desktop_url || "",
                    mobile_banner: cleanedSlides[0]?.mobile_url || "",
                    show_hero_banner: showHeroBanner ? "true" : "false",
                    shipping_cost: shippingCost
                }
            });
            alert("Settings saved successfully!");
        } catch (err) {
            console.error("Failed to save settings:", err);
            alert(err.response?.data?.message || "Failed to save settings. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleResetAutoIncrement = async () => {
        if (!confirm("Are you sure you want to reset the product ID auto-increment counter?\n\nThis will safely reset the next product ID to start from the next sequential ID, but will not re-index existing products.")) {
            return;
        }

        setResetting(true);
        try {
            const res = await api.post("/admin/products/reset-auto-increment");
            alert(res.data?.message || "Product ID counter reset successfully!");
        } catch (err) {
            console.error("Failed to reset auto-increment:", err);
            alert(err.response?.data?.message || "Failed to reset product ID counter.");
        } finally {
            setResetting(false);
        }
    };

    const handleResequenceProductIds = async () => {
        if (!confirm("WARNING: Resequencing product IDs is a force operation that will re-sequence all existing product IDs (1, 2, 3...).\n\nIf you have any active testing orders, wishlists, shopping carts, or reviews, their relations will become mismatched.\n\nAre you sure you want to proceed?")) {
            return;
        }

        setResequencing(true);
        try {
            const res = await api.post("/admin/products/resequence-ids");
            alert(res.data?.message || "Product IDs re-sequenced successfully!");
        } catch (err) {
            console.error("Failed to resequence product IDs:", err);
            alert(err.response?.data?.message || "Failed to resequence product IDs.");
        } finally {
            setResequencing(false);
        }
    };

    const handleResetAllProducts = async () => {
        if (!confirm("WARNING: This is a destructive operation that will permanently delete ALL products in the database.\n\nAll existing product categories, feature lists, images, and pricing will be lost. This action cannot be undone.\n\nDo you want to proceed?")) {
            return;
        }
        
        if (!confirm("CONFIRMATION REQUIRED: Please confirm once more that you want to delete ALL products. This will completely clear your catalog.")) {
            return;
        }

        setResettingAll(true);
        try {
            const res = await api.post("/admin/products/reset-all");
            alert(res.data?.message || "Catalog cleared successfully!");
        } catch (err) {
            console.error("Failed to reset products catalog:", err);
            alert(err.response?.data?.message || "Failed to reset products catalog.");
        } finally {
            setResettingAll(false);
        }
    };

    const handleCheckDatabaseAlignment = async () => {
        setChecking(true);
        setIntegrityResult(null);
        try {
            const res = await api.get("/admin/db/check-integrity");
            setIntegrityResult(res.data);
        } catch (err) {
            console.error("Failed to check database alignment:", err);
            alert("Failed to run database check. Please check the backend connection.");
        } finally {
            setChecking(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                <span style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(0,0,0,0.05)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="container animate-fade-in" style={{ paddingBottom: '80px', maxWidth: '800px' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', fontWeight: 300 }}>General Settings</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Configure shipping costs and manage multiple homepage slider banner images.</p>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* 1. ENABLE / DISABLE HERO BANNER */}
                <div className="card" style={{ padding: '24px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ paddingRight: '16px' }}>
                        <label style={{ display: 'block', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                            Enable Homepage Hero Banner
                        </label>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Uncheck this to completely remove the banner from the home page. The site layout will adjust automatically.
                        </span>
                    </div>
                    <input 
                        type="checkbox" 
                        checked={showHeroBanner}
                        onChange={(e) => setShowHeroBanner(e.target.checked)}
                        style={{ width: '24px', height: '24px', cursor: 'pointer', accentColor: 'var(--accent)', flexShrink: 0 }}
                    />
                </div>

                {/* 2. MULTIPLE BANNER SLIDES MANAGER */}
                {showHeroBanner && (
                    <div className="card" style={{ padding: '32px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 4px 0' }}>Homepage Banner Slides</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                                Add and manage multiple slidable banners. Upload desktop and mobile image pairs for optimal responsive display.
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {slides.map((slide, index) => (
                                <div key={slide.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', position: 'relative', background: '#fafbfc' }}>
                                    
                                    {/* Header & Remove Button */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>Slide #{index + 1}</h3>
                                        {slides.length > 1 && (
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveSlide(slide.id)} 
                                                style={{ border: 'none', background: 'transparent', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                                            >
                                                Remove Slide
                                            </button>
                                        )}
                                    </div>

                                    {/* Input fields */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Title Overlay</label>
                                            <input 
                                                type="text" 
                                                className="input-field" 
                                                value={slide.title || ""} 
                                                onChange={(e) => handleSlideChange(slide.id, "title", e.target.value)} 
                                                placeholder="e.g. Discover Everyday Essentials"
                                                style={{ width: '100%', height: '38px', fontSize: '0.85rem', padding: '0 12px' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Subtitle Overlay</label>
                                            <input 
                                                type="text" 
                                                className="input-field" 
                                                value={slide.subtitle || ""} 
                                                onChange={(e) => handleSlideChange(slide.id, "subtitle", e.target.value)} 
                                                placeholder="e.g. Fashion & Jewellery"
                                                style={{ width: '100%', height: '38px', fontSize: '0.85rem', padding: '0 12px' }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Redirect Link URL</label>
                                            <input 
                                                type="text" 
                                                className="input-field" 
                                                value={slide.link || ""} 
                                                onChange={(e) => handleSlideChange(slide.id, "link", e.target.value)} 
                                                placeholder="/products or https://..."
                                                style={{ width: '100%', height: '38px', fontSize: '0.85rem', padding: '0 12px' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Button Text</label>
                                            <input 
                                                type="text" 
                                                className="input-field" 
                                                value={slide.button_text || ""} 
                                                onChange={(e) => handleSlideChange(slide.id, "button_text", e.target.value)} 
                                                placeholder="Shop Now"
                                                style={{ width: '100%', height: '38px', fontSize: '0.85rem', padding: '0 12px' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Desktop & Mobile image upload pairs */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        
                                        {/* Desktop image */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                                Desktop Image (1920x800 px)
                                            </label>
                                            <input 
                                                type="text" 
                                                className="input-field" 
                                                placeholder="Image URL..."
                                                value={slide.desktop_url || ""} 
                                                onChange={(e) => handleSlideChange(slide.id, "desktop_url", e.target.value)}
                                                style={{ width: '100%', height: '36px', fontSize: '0.8rem', padding: '0 10px' }}
                                            />
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ position: 'relative' }}>
                                                    <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem', height: '32px' }}>
                                                        {slide.uploading_desktop ? "Uploading..." : "Upload File"}
                                                    </button>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                handleSlideImageUpload(e.target.files[0], slide.id, "desktop");
                                                            }
                                                        }}
                                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                                    />
                                                </div>
                                            </div>
                                            {slide.desktop_url && (
                                                <div style={{ border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                                                    <img src={slide.desktop_url} alt="Desktop Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Mobile image */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                                Mobile Image (800x800 px)
                                            </label>
                                            <input 
                                                type="text" 
                                                className="input-field" 
                                                placeholder="Image URL..."
                                                value={slide.mobile_url || ""} 
                                                onChange={(e) => handleSlideChange(slide.id, "mobile_url", e.target.value)}
                                                style={{ width: '100%', height: '36px', fontSize: '0.8rem', padding: '0 10px' }}
                                            />
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ position: 'relative' }}>
                                                    <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem', height: '32px' }}>
                                                        {slide.uploading_mobile ? "Uploading..." : "Upload File"}
                                                    </button>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                handleSlideImageUpload(e.target.files[0], slide.id, "mobile");
                                                            }
                                                        }}
                                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                                    />
                                                </div>
                                            </div>
                                            {slide.mobile_url && (
                                                <div style={{ border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                                                    <img src={slide.mobile_url} alt="Mobile Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                                </div>
                                            )}
                                        </div>

                                    </div>

                                </div>
                            ))}
                        </div>

                        <button 
                            type="button" 
                            onClick={handleAddSlide}
                            className="btn btn-secondary" 
                            style={{ alignSelf: 'center', padding: '10px 24px', fontSize: '0.88rem', fontWeight: 600 }}
                        >
                            + Add New Slide
                        </button>
                    </div>
                )}

                {/* 3. SHIPPING COST */}
                <div className="card" style={{ padding: '32px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px' }}>
                    <label style={{ display: 'block', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                        Default Shipping Cost (INR)
                    </label>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                        Configure the default shipping rate added to checkout. Set to 0 for free shipping.
                    </p>
                    <input 
                        type="number" 
                        step="0.01"
                        min="0"
                        className="input-field" 
                        placeholder="e.g. 50"
                        value={shippingCost}
                        onChange={(e) => setShippingCost(e.target.value)}
                        required
                        style={{ height: '42px', padding: '0 12px' }}
                    />
                </div>

                {/* 4. SAVE BUTTON */}
                <button 
                    type="submit" 
                    disabled={saving}
                    className="btn btn-primary"
                    style={{ padding: '16px', fontSize: '1rem', fontWeight: 600, background: 'var(--accent)', color: '#ffffff', border: 'none', borderRadius: 'var(--radius-btn, 10px)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
                >
                    {saving ? "Saving Changes..." : "Save Settings"}
                </button>
            </form>

            {/* Database Maintenance / Operations */}
            <div className="card" style={{ padding: '32px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', marginTop: '40px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>Database Maintenance</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '24px' }}>
                    Perform administrative database operations. Make sure you understand the effects before running these commands.
                </p>

                {/* DATABASE INTEGRITY CHECKER */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', padding: '16px', background: 'rgba(15, 157, 148, 0.02)', border: '1px solid rgba(15, 157, 148, 0.15)', borderRadius: '8px', marginBottom: '24px' }}>
                    <div style={{ flex: '1', minWidth: '240px' }}>
                        <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '4px' }}>
                            Verify Database Alignment (Integrity Check)
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Check if any products are currently linked to order items, wishlists, or user shopping carts before executing deletions.
                        </span>
                    </div>
                    <button 
                        type="button"
                        onClick={handleCheckDatabaseAlignment}
                        disabled={checking}
                        className="btn btn-secondary"
                        style={{ padding: '12px 20px', fontSize: '0.9rem', flexShrink: 0, background: '#ffffff' }}
                    >
                        {checking ? "Checking Alignment..." : "Run Database Check"}
                    </button>
                </div>

                {integrityResult && (
                    <div style={{ 
                        background: 'rgba(255, 255, 255, 0.02)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '8px', 
                        padding: '20px', 
                        marginBottom: '24px',
                        fontSize: '0.92rem'
                    }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 600 }}>Database Alignment Results:</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '6px' }}>
                                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Total Active Products</span>
                                <strong style={{ fontSize: '1.25rem' }}>{integrityResult.totalProducts}</strong>
                            </div>
                            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '6px' }}>
                                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Linked to Order History</span>
                                <strong style={{ fontSize: '1.25rem', color: integrityResult.linkedOrders > 0 ? '#ef4444' : 'var(--text-main)' }}>{integrityResult.linkedOrders} products</strong>
                            </div>
                            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '6px' }}>
                                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Present in Wishlists</span>
                                <strong style={{ fontSize: '1.25rem' }}>{integrityResult.linkedWishlists} products</strong>
                            </div>
                            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '6px' }}>
                                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Present in Carts</span>
                                <strong style={{ fontSize: '1.25rem' }}>{integrityResult.linkedCarts} products</strong>
                            </div>
                        </div>

                        {integrityResult.linkedOrders > 0 && (
                            <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.15)', marginBottom: '12px', fontWeight: 500 }}>
                                🚨 Warning: {integrityResult.linkedOrders} products have associated order items in history. If you delete these products, those historical orders will point to invalid product information.
                            </div>
                        )}

                        {(integrityResult.linkedWishlists > 0 || integrityResult.linkedCarts > 0) && (
                            <div style={{ padding: '12px 16px', background: 'rgba(245, 158, 11, 0.08)', color: '#d97706', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.15)', fontWeight: 500 }}>
                                ⚠️ Notice: Deleting these products will automatically remove them from customer shopping carts and wishlists.
                            </div>
                        )}

                        {integrityResult.linkedOrders === 0 && integrityResult.linkedWishlists === 0 && integrityResult.linkedCarts === 0 && (
                            <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.08)', color: 'var(--success)', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.15)', fontWeight: 500 }}>
                                ✓ Database is fully aligned! No products are currently linked to orders, wishlists, or carts. You can safely clear or re-sequence your products catalog.
                            </div>
                        )}
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', padding: '16px', background: 'rgba(239, 68, 68, 0.02)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px' }}>
                    <div style={{ flex: '1', minWidth: '240px' }}>
                        <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, color: '#ef4444', marginBottom: '4px' }}>
                            Reset Product ID Counter
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Resets the auto-increment sequencer to the next logical ID (e.g., 1 if empty, or MAX(id) + 1). Use this to fill gaps after deleting products.
                        </span>
                    </div>
                    <button 
                        type="button"
                        onClick={handleResetAutoIncrement}
                        disabled={resetting}
                        className="btn btn-danger"
                        style={{ padding: '12px 20px', fontSize: '0.9rem', flexShrink: 0, background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        {resetting ? "Resetting..." : "Reset Counter"}
                    </button>
                </div>

                <div style={{ height: '1px', background: 'var(--border)', margin: '24px 0' }}></div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', padding: '16px', background: 'rgba(239, 68, 68, 0.02)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px' }}>
                    <div style={{ flex: '1', minWidth: '240px' }}>
                        <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, color: '#ef4444', marginBottom: '4px' }}>
                            Force Resequence Product IDs
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Re-numbers all existing products sequentially starting from 1 (e.g. 1, 2, 3...) and resets the sequencer counter. WARNING: Links to orders, carts, and wishlists will become mismatched.
                        </span>
                    </div>
                    <button 
                        type="button"
                        onClick={handleResequenceProductIds}
                        disabled={resequencing}
                        className="btn btn-danger"
                        style={{ padding: '12px 20px', fontSize: '0.9rem', flexShrink: 0, background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        {resequencing ? "Resequencing..." : "Force Resequence"}
                    </button>
                </div>

                <div style={{ height: '1px', background: 'var(--border)', margin: '24px 0' }}></div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', padding: '16px', background: 'rgba(239, 68, 68, 0.02)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px' }}>
                    <div style={{ flex: '1', minWidth: '240px' }}>
                        <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, color: '#ef4444', marginBottom: '4px' }}>
                            Reset Products Catalog (Delete All)
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Permanently deletes all products in the database and resets the auto-increment ID counter to 1. WARNING: This action is destructive and cannot be undone.
                        </span>
                    </div>
                    <button 
                        type="button"
                        onClick={handleResetAllProducts}
                        disabled={resettingAll}
                        className="btn btn-danger"
                        style={{ padding: '12px 20px', fontSize: '0.9rem', flexShrink: 0, background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        {resettingAll ? "Resetting..." : "Reset All Products"}
                    </button>
                </div>
            </div>
        </div>
    );
}
