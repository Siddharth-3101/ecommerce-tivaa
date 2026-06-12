"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminSettingsPage() {
    const [desktopBanner, setDesktopBanner] = useState("");
    const [mobileBanner, setMobileBanner] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingDesktop, setUploadingDesktop] = useState(false);
    const [uploadingMobile, setUploadingMobile] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await api.get("/settings");
                if (res.data) {
                    setDesktopBanner(res.data.desktop_banner || "");
                    setMobileBanner(res.data.mobile_banner || "");
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
                    mobile_banner: mobileBanner
                }
            });
            alert("Banner settings saved successfully!");
        } catch (err) {
            console.error("Failed to save settings:", err);
            alert(err.response?.data?.message || "Failed to save settings. Please try again.");
        } finally {
            setSaving(false);
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
            <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', fontWeight: 300 }}>Banner Settings</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Upload custom images to use as the homepage hero banners.</p>

            <form onSubmit={handleSave} className="card" style={{ padding: '32px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px' }}>
                
                {/* DESKTOP BANNER */}
                <div style={{ marginBottom: '32px' }}>
                    <label style={{ display: 'block', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                        Desktop Hero Banner (Recommended size: 1920x800 px)
                    </label>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                        This banner will display on desktop, laptop, and wider viewport screens.
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* URL input */}
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="Enter image URL or upload below..."
                            value={desktopBanner}
                            onChange={(e) => setDesktopBanner(e.target.value)}
                        />
                        
                        {/* Drag and Drop/Upload row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ position: 'relative' }}>
                                <button 
                                    type="button" 
                                    disabled={uploadingDesktop}
                                    className="btn btn-secondary"
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                    {uploadingDesktop ? "Uploading..." : "Upload Image"}
                                </button>
                                <input 
                                    type="file" 
                                    accept="image/*"
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

                        {/* Image Preview */}
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
                <div style={{ marginBottom: '40px' }}>
                    <label style={{ display: 'block', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                        Mobile Hero Banner (Recommended size: 800x800 px)
                    </label>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                        This banner will display on smartphones and small tablets (screens ≤ 768px wide).
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* URL input */}
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder="Enter image URL or upload below..."
                            value={mobileBanner}
                            onChange={(e) => setMobileBanner(e.target.value)}
                        />

                        {/* Drag and Drop/Upload row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ position: 'relative' }}>
                                <button 
                                    type="button" 
                                    disabled={uploadingMobile}
                                    className="btn btn-secondary"
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                    {uploadingMobile ? "Uploading..." : "Upload Image"}
                                </button>
                                <input 
                                    type="file" 
                                    accept="image/*"
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

                        {/* Image Preview */}
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
        </div>
    );
}
