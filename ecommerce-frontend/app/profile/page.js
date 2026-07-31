"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { saveUser, getUser, getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, MapPin, ShieldCheck, Eye, EyeOff, ArrowLeft, Save } from "lucide-react";

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", 
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
    "Uttar Pradesh", "Uttarakhand", "West Bengal", 
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function CustomerProfilePage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("personal"); // personal, address, security
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [gstStateList, setGstStateList] = useState([]);

    useEffect(() => {
        const fetchGstStates = async () => {
            try {
                const res = await api.get("/gst-states");
                setGstStateList(res.data || []);
            } catch (err) {
                console.warn("Failed to fetch GST states list", err);
            }
        };
        fetchGstStates();
    }, []);

    // Form states
    const [personalForm, setPersonalForm] = useState({
        name: "",
        email: "",
        phone: ""
    });

    const [addressForm, setAddressForm] = useState({
        address: "",
        city: "",
        state: "",
        pincode: ""
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Visibility toggles
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Live password strength indicator checks
    const passwordChecks = {
        length: passwordForm.newPassword.length >= 8,
        uppercase: /[A-Z]/.test(passwordForm.newPassword),
        lowercase: /[a-z]/.test(passwordForm.newPassword),
        number: /\d/.test(passwordForm.newPassword),
        special: /[@$!%*?&]/.test(passwordForm.newPassword)
    };

    const isPasswordStrong = (pwd) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(pwd);
    };

    // Load user data on mount
    useEffect(() => {
        const token = getToken();
        if (!token) {
            router.push("/login");
            return;
        }

        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const res = await api.get("/auth/me");
                const u = res.data;

                setPersonalForm({
                    name: u.name || "",
                    email: u.email || "",
                    phone: u.phone || ""
                });

                setAddressForm({
                    address: u.address || "",
                    city: u.city || "",
                    state: u.state || "",
                    pincode: u.pincode || ""
                });
            } catch (err) {
                setError("Failed to load profile details. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [router]);

    const handleUpdatePersonal = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Phone number length check
        const phoneRegex = /^\d{10}$/;
        if (personalForm.phone && !phoneRegex.test(personalForm.phone)) {
            setError("Mobile number must be exactly 10 digits.");
            return;
        }

        try {
            setLoading(true);
            const token = getToken();
            const res = await api.put("/auth/profile", {
                name: personalForm.name,
                email: personalForm.email,
                phone: personalForm.phone || null
            });

            if (res.data.user) {
                saveUser(res.data.user, token);
                window.dispatchEvent(new Event("cart-updated")); // Trigger Navbar refresh
            }
            setSuccess("Personal details updated successfully!");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update profile details.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAddress = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            setLoading(true);
            const token = getToken();
            const res = await api.put("/auth/profile", {
                address: addressForm.address || null,
                city: addressForm.city || null,
                state: addressForm.state || null,
                pincode: addressForm.pincode || null
            });

            if (res.data.user) {
                saveUser(res.data.user, token);
                window.dispatchEvent(new Event("cart-updated"));
            }
            setSuccess("Billing and delivery address updated successfully!");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update address details.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!isPasswordStrong(passwordForm.newPassword)) {
            setError("New password does not meet the complexity requirements.");
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            const token = getToken();
            const res = await api.put("/auth/profile", {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });

            if (res.data.user) {
                saveUser(res.data.user, token);
            }
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setSuccess("Password updated successfully!");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update password. Please check your current password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: "var(--bg, #F8FAFC)", minHeight: "100vh", padding: "40px 24px 80px" }}>
            <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                
                {/* Back Link */}
                <div style={{ marginBottom: "24px" }}>
                    <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", color: "var(--text-muted, #6B7280)", textDecoration: "none", fontWeight: 500 }}>
                        <ArrowLeft size={16} /> Back to Store
                    </Link>
                </div>

                <div style={{ marginBottom: "32px" }}>
                    <h1 style={{ fontSize: "2.2rem", fontWeight: 700, color: "var(--text-main, #173B63)", margin: "0 0 8px 0" }}>My Account</h1>
                    <p style={{ color: "var(--text-muted, #6B7280)", margin: 0 }}>Manage your profile settings, addresses, and login credentials.</p>
                </div>

                {/* Status Messages */}
                {error && (
                    <div style={{ padding: "14px", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "12px", color: "var(--danger, #EF4444)", marginBottom: "24px", fontSize: "0.9rem" }}>
                        {error}
                    </div>
                )}
                {success && (
                    <div style={{ padding: "14px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "12px", color: "var(--success, #10B981)", marginBottom: "24px", fontSize: "0.9rem" }}>
                        {success}
                    </div>
                )}

                {/* Main Profile Grid Layout */}
                <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "30px" }} className="profile-grid">
                    
                    {/* Sidebar Nav */}
                    <div className="card" style={{ padding: "16px", borderRadius: "18px", alignSelf: "start", display: "flex", flexDirection: "column", gap: "8px" }}>
                        <button
                            onClick={() => { setActiveTab("personal"); setError(""); setSuccess(""); }}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "12px 16px",
                                width: "100%",
                                border: "none",
                                borderRadius: "10px",
                                background: activeTab === "personal" ? "var(--text-main, #173B63)" : "transparent",
                                color: activeTab === "personal" ? "#ffffff" : "var(--text-muted, #6B7280)",
                                fontWeight: 600,
                                fontSize: "0.9rem",
                                cursor: "pointer",
                                textAlign: "left",
                                transition: "all 0.2s"
                            }}
                        >
                            <User size={18} /> Personal Details
                        </button>

                        <button
                            onClick={() => { setActiveTab("address"); setError(""); setSuccess(""); }}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "12px 16px",
                                width: "100%",
                                border: "none",
                                borderRadius: "10px",
                                background: activeTab === "address" ? "var(--text-main, #173B63)" : "transparent",
                                color: activeTab === "address" ? "#ffffff" : "var(--text-muted, #6B7280)",
                                fontWeight: 600,
                                fontSize: "0.9rem",
                                cursor: "pointer",
                                textAlign: "left",
                                transition: "all 0.2s"
                            }}
                        >
                            <MapPin size={18} /> Shipping Address
                        </button>

                        <button
                            onClick={() => { setActiveTab("security"); setError(""); setSuccess(""); }}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "12px 16px",
                                width: "100%",
                                border: "none",
                                borderRadius: "10px",
                                background: activeTab === "security" ? "var(--text-main, #173B63)" : "transparent",
                                color: activeTab === "security" ? "#ffffff" : "var(--text-muted, #6B7280)",
                                fontWeight: 600,
                                fontSize: "0.9rem",
                                cursor: "pointer",
                                textAlign: "left",
                                transition: "all 0.2s"
                            }}
                        >
                            <ShieldCheck size={18} /> Password &amp; Security
                        </button>
                    </div>

                    {/* Content Section */}
                    <div className="card" style={{ padding: "32px", borderRadius: "18px", boxShadow: "var(--shadow-sm)" }}>
                        
                        {/* 1. PERSONAL DETAILS FORM */}
                        {activeTab === "personal" && (
                            <form onSubmit={handleUpdatePersonal} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <h3 style={{ margin: "0 0 8px 0", color: "var(--text-main, #173B63)" }}>Personal Details</h3>
                                
                                <div>
                                    <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted, #6B7280)", fontWeight: 500 }}>Full Name</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={personalForm.name}
                                        onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted, #6B7280)", fontWeight: 500 }}>Mobile Number (10 Digits)</label>
                                    <input
                                        type="tel"
                                        className="input-field"
                                        value={personalForm.phone}
                                        onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value.replace(/\D/g, "") })}
                                        maxLength={10}
                                        required
                                    />
                                </div>

                                <div>
                                    <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted, #6B7280)", fontWeight: 500 }}>Email Address</label>
                                    <input
                                        type="email"
                                        className="input-field"
                                        value={personalForm.email}
                                        onChange={(e) => setPersonalForm({ ...personalForm, email: e.target.value })}
                                        required
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: "flex-start", padding: "12px 24px", display: "flex", alignItems: "center", gap: "8px" }}>
                                    <Save size={16} /> {loading ? "Saving..." : "Save Details"}
                                </button>
                            </form>
                        )}

                        {/* 2. SHIPPING ADDRESS FORM */}
                        {activeTab === "address" && (
                            <form onSubmit={handleUpdateAddress} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <h3 style={{ margin: "0 0 8px 0", color: "var(--text-main, #173B63)" }}>Shipping &amp; Delivery Address</h3>
                                
                                <div>
                                    <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted, #6B7280)", fontWeight: 500 }}>Street Address</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Flat, House no., Apartment, Street"
                                        value={addressForm.address}
                                        onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                                    />
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                    <div>
                                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted, #6B7280)", fontWeight: 500 }}>City</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={addressForm.city}
                                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted, #6B7280)", fontWeight: 500 }}>State</label>
                                        <select
                                            className="input-field"
                                            value={addressForm.state}
                                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                            style={{ 
                                                width: "100%", 
                                                padding: "10px 14px", 
                                                border: "1px solid var(--border)", 
                                                borderRadius: "8px", 
                                                background: "#ffffff", 
                                                fontSize: "0.95rem" 
                                            }}
                                        >
                                            <option value="">Select State</option>
                                            {(gstStateList.length > 0 ? gstStateList.map(s => s.state_name) : INDIAN_STATES).map(sName => (
                                                <option key={sName} value={sName}>{sName}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted, #6B7280)", fontWeight: 500 }}>Pincode / Postal Code</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="e.g. 500001"
                                        value={addressForm.pincode}
                                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, "") })}
                                        maxLength={10}
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: "flex-start", padding: "12px 24px", display: "flex", alignItems: "center", gap: "8px" }}>
                                    <Save size={16} /> {loading ? "Saving..." : "Save Address"}
                                </button>
                            </form>
                        )}

                        {/* 3. PASSWORD & SECURITY FORM */}
                        {activeTab === "security" && (
                            <form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <h3 style={{ margin: "0 0 8px 0", color: "var(--text-main, #173B63)" }}>Change Password</h3>
                                
                                <div>
                                    <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted, #6B7280)", fontWeight: 500 }}>Current Password</label>
                                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            className="input-field"
                                            placeholder="••••••••"
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                            style={{ width: "100%", paddingRight: "44px" }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            style={{ position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted, #6B7280)", display: "flex", alignItems: "center", justifyContent: "center" }}
                                        >
                                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted, #6B7280)", fontWeight: 500 }}>New Password</label>
                                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            className="input-field"
                                            placeholder="••••••••"
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            style={{ width: "100%", paddingRight: "44px" }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            style={{ position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted, #6B7280)", display: "flex", alignItems: "center", justifyContent: "center" }}
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>

                                    {/* Password Policy Checks */}
                                    <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <p style={{ fontSize: "0.8rem", fontWeight: 600, margin: "0 0 4px 0", color: "var(--text-main, #173B63)" }}>Password Requirements:</p>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                            <span style={{ fontSize: "0.75rem", color: passwordChecks.length ? "var(--success, #10B981)" : "var(--text-muted, #6B7280)", display: "flex", alignItems: "center", gap: "4px" }}>
                                                {passwordChecks.length ? "✓" : "•"} Min. 8 characters
                                            </span>
                                            <span style={{ fontSize: "0.75rem", color: passwordChecks.uppercase ? "var(--success, #10B981)" : "var(--text-muted, #6B7280)", display: "flex", alignItems: "center", gap: "4px" }}>
                                                {passwordChecks.uppercase ? "✓" : "•"} Uppercase letter
                                            </span>
                                            <span style={{ fontSize: "0.75rem", color: passwordChecks.lowercase ? "var(--success, #10B981)" : "var(--text-muted, #6B7280)", display: "flex", alignItems: "center", gap: "4px" }}>
                                                {passwordChecks.lowercase ? "✓" : "•"} Lowercase letter
                                            </span>
                                            <span style={{ fontSize: "0.75rem", color: passwordChecks.number ? "var(--success, #10B981)" : "var(--text-muted, #6B7280)", display: "flex", alignItems: "center", gap: "4px" }}>
                                                {passwordChecks.number ? "✓" : "•"} One number
                                            </span>
                                            <span style={{ fontSize: "0.75rem", color: passwordChecks.special ? "var(--success, #10B981)" : "var(--text-muted, #6B7280)", display: "flex", alignItems: "center", gap: "4px" }}>
                                                {passwordChecks.special ? "✓" : "•"} Special character
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-muted, #6B7280)", fontWeight: 500 }}>Confirm New Password</label>
                                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            className="input-field"
                                            placeholder="••••••••"
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                            style={{ width: "100%", paddingRight: "44px" }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            style={{ position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted, #6B7280)", display: "flex", alignItems: "center", justifyContent: "center" }}
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: "flex-start", padding: "12px 24px", display: "flex", alignItems: "center", gap: "8px" }}>
                                    <Save size={16} /> {loading ? "Updating..." : "Update Password"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @media (max-width: 768px) {
                    .profile-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}} />
        </div>
    );
}
