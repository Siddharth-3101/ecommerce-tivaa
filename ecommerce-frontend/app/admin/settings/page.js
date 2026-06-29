"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminSettingsPage() {
    const [desktopBanner, setDesktopBanner] = useState("");
    const [mobileBanner, setMobileBanner] = useState("");
    const [showHeroBanner, setShowHeroBanner] = useState(true);
    const [shippingCost, setShippingCost] = useState("0");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingDesktop, setUploadingDesktop] = useState(false);
    const [uploadingMobile, setUploadingMobile] = useState(false);
    const [resetting, setResetting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await api.get("/settings");
                if (res.data) {
                    setDesktopBanner(res.data.desktop_banner || "");
                    setMobileBanner(res.data.mobile_banner || "");
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

    const handleImageUpload = async (file, type) => {
        const isDesktop = type === "desktop";
        if (isDesktop) setUploadingDesktop(true);
        else setUploadingMobile(true);

        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await api.post("/upload/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (res.data && res.data.url) {
                if (isDesktop) {
                    setDesktopBanner(res.data.url);
                } else {
                    setMobileBanner(res.data.url);
                }
            }
        } catch (err) {
            console.error("Failed to upload image:", err);
            alert("Image upload failed. Please try again.");
        } finally {
            if (isDesktop) setUploadingDesktop(false);
            else setUploadingMobile(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put("/settings", {
                settings: {
                    desktop_banner: desktopBanner,
                    mobile_banner: mobileBanner,
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
            <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Upload custom images to use as the homepage hero banners or disable it entirely.</p>

            <form onSubmit={handleSave} className="card" style={{ padding: '32px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px' }}>
                
                {/* ENABLE / DISABLE HERO BANNER */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', background: 'rgba(122, 56, 194, 0.03)', padding: '16px 20px', border: '1px solid var(--border)', borderRadius: '8px' }}>
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

                <div style={{ height: '1px', background: 'var(--border)', marginBottom: '32px' }}></div>

                {/* DESKTOP BANNER */}
                <div style={{ marginBottom: '32px', opacity: showHeroBanner ? 1 : 0.5, pointerEvents: showHeroBanner ? 'auto' : 'none' }}>
                    <label style={{ display: 'block', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                        Desktop Hero Banner (Recommended size: 1920x800 px)
                    </label>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                        This banner will display on desktop, laptop, and wider viewport screens.
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="Enter image URL or upload below..."
                            value={desktopBanner}
                            onChange={(e) => setDesktopBanner(e.target.value)}
                            disabled={!showHeroBanner}
                        />
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ position: 'relative' }}>
                                <button 
                                    type="button" 
                                    disabled={uploadingDesktop || !showHeroBanner}
                                    className="btn btn-secondary"
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                    {uploadingDesktop ? "Uploading..." : "Upload Image"}
                                </button>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    disabled={!showHeroBanner}
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            handleImageUpload(e.target.files[0], "desktop");
                                        }
                                    }}
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                />
                            </div>
                            {desktopBanner && (
                                <button 
                                    type="button" 
                                    onClick={() => setDesktopBanner("")} 
                                    className="btn" 
                                    style={{ padding: '8px 16px', background: 'transparent', color: 'var(--danger)', border: 'none', cursor: 'pointer' }}
                                >
                                    Remove Preview
                                </button>
                            )}
                        </div>

                        {desktopBanner && (
                            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', maxHeight: '200px', background: '#fcfcfc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img 
                                    src={desktopBanner} 
                                    alt="Desktop Banner Preview" 
                                    style={{ width: '100%', height: 'auto', objectFit: 'contain', maxHeight: '200px' }} 
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ height: '1px', background: 'var(--border)', marginBottom: '32px' }}></div>

                {/* MOBILE BANNER */}
                <div style={{ marginBottom: '40px', opacity: showHeroBanner ? 1 : 0.5, pointerEvents: showHeroBanner ? 'auto' : 'none' }}>
                    <label style={{ display: 'block', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                        Mobile Hero Banner (Recommended size: 800x800 px)
                    </label>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                        This banner will display on smartphones and small tablets (screens ≤ 768px wide).
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="Enter image URL or upload below..."
                            value={mobileBanner}
                            onChange={(e) => setMobileBanner(e.target.value)}
                            disabled={!showHeroBanner}
                        />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ position: 'relative' }}>
                                <button 
                                    type="button" 
                                    disabled={uploadingMobile || !showHeroBanner}
                                    className="btn btn-secondary"
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                    {uploadingMobile ? "Uploading..." : "Upload Image"}
                                </button>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    disabled={!showHeroBanner}
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            handleImageUpload(e.target.files[0], "mobile");
                                        }
                                    }}
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                />
                            </div>
                            {mobileBanner && (
                                <button 
                                    type="button" 
                                    onClick={() => setMobileBanner("")} 
                                    className="btn" 
                                    style={{ padding: '8px 16px', background: 'transparent', color: 'var(--danger)', border: 'none', cursor: 'pointer' }}
                                >
                                    Remove Preview
                                </button>
                            )}
                        </div>

                        {mobileBanner && (
                            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', maxHeight: '200px', maxWidth: '200px', background: '#fcfcfc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img 
                                    src={mobileBanner} 
                                    alt="Mobile Banner Preview" 
                                    style={{ width: '100%', height: 'auto', objectFit: 'contain', maxHeight: '200px' }} 
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ height: '1px', background: 'var(--border)', marginBottom: '32px' }}></div>

                {/* SHIPPING COST */}
                <div style={{ marginBottom: '40px' }}>
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
                    />
                </div>

                {/* SAVE BUTTON */}
                <button 
                    type="submit" 
                    disabled={saving || uploadingDesktop || uploadingMobile}
                    className="btn btn-black-solid"
                    style={{ width: '100%', padding: '16px', fontSize: '1rem', fontWeight: 600 }}
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

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', padding: '16px', background: 'rgba(239, 68, 68, 0.02)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px' }}>
                    <div style={{ flex: '1', minWidth: '240px' }}>
                        <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, color: 'var(--danger)', marginBottom: '4px' }}>
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
                        style={{ padding: '12px 20px', fontSize: '0.9rem', flexShrink: 0 }}
                    >
                        {resetting ? "Resetting..." : "Reset Counter"}
                    </button>
                </div>
            </div>
        </div>
    );
}
