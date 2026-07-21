"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function AdminReportsPage() {
    const [periodType, setPeriodType] = useState("Monthly");
    const [financialYear, setFinancialYear] = useState("2025-2026");
    const [periodValue, setPeriodValue] = useState("2026-03");
    const [downloadingGst, setDownloadingGst] = useState(false);
    const [downloadingOrder, setDownloadingOrder] = useState(false);

    const monthlyOptions = [
        { label: "March 2026", value: "2026-03" },
        { label: "February 2026", value: "2026-02" },
        { label: "January 2026", value: "2026-01" },
        { label: "December 2025", value: "2025-12" },
        { label: "November 2025", value: "2025-11" },
        { label: "October 2025", value: "2025-10" },
        { label: "September 2025", value: "2025-09" },
        { label: "August 2025", value: "2025-08" },
        { label: "July 2025", value: "2025-07" },
        { label: "June 2025", value: "2025-06" },
        { label: "May 2025", value: "2025-05" },
        { label: "April 2025", value: "2025-04" },
        { label: "Full Financial Year (FY 2025-2026)", value: "" }
    ];

    const quarterlyOptions = [
        { label: "Q4 (Jan 2026 - Mar 2026)", value: "Q4" },
        { label: "Q3 (Oct 2025 - Dec 2025)", value: "Q3" },
        { label: "Q2 (Jul 2025 - Sep 2025)", value: "Q2" },
        { label: "Q1 (Apr 2025 - Jun 2025)", value: "Q1" },
        { label: "Full Financial Year (FY 2025-2026)", value: "" }
    ];

    const handleDownload = async (type) => {
        const isGst = type === "gst-ready";
        if (isGst) setDownloadingGst(true);
        else setDownloadingOrder(true);

        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
            const endpoint = isGst ? "/admin/reports/gst-ready" : "/admin/reports/orders";
            
            const response = await api.get(endpoint, {
                params: {
                    periodType,
                    financialYear,
                    periodValue
                },
                responseType: "blob",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Create download blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            const periodLabel = periodValue || "FullYear";
            const filename = isGst 
                ? `GST_Ready_Report_${periodLabel}.xlsx` 
                : `Order_Sales_Report_${periodLabel}.xlsx`;
            
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error downloading report:", err);
            alert("Failed to download report. Please check server logs.");
        } finally {
            if (isGst) setDownloadingGst(false);
            else setDownloadingOrder(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
            
            {/* Header Title */}
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                    Reports & GST Analytics
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Generate GSTR-1 compliant tax reports and comprehensive order sales audit logs for accounting.
                </p>
            </div>

            {/* Filter Toolbar Card */}
            <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '32px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                    Report Period Filter
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
                    {/* Period Type */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                            Report Frequency
                        </label>
                        <select
                            value={periodType}
                            onChange={(e) => {
                                setPeriodType(e.target.value);
                                setPeriodValue(e.target.value === "Monthly" ? "2026-03" : "Q4");
                            }}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: '1px solid var(--border)',
                                background: 'var(--bg)',
                                color: 'var(--text-main)',
                                fontSize: '0.9rem',
                                fontWeight: 500
                            }}
                        >
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                        </select>
                    </div>

                    {/* Financial Year */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                            Financial Year
                        </label>
                        <select
                            value={financialYear}
                            onChange={(e) => setFinancialYear(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: '1px solid var(--border)',
                                background: 'var(--bg)',
                                color: 'var(--text-main)',
                                fontSize: '0.9rem',
                                fontWeight: 500
                            }}
                        >
                            <option value="2025-2026">FY 2025-2026</option>
                        </select>
                    </div>

                    {/* Period Selection */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                            {periodType === "Monthly" ? "Select Month" : "Select Quarter"}
                        </label>
                        <select
                            value={periodValue}
                            onChange={(e) => setPeriodValue(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                border: '1px solid var(--border)',
                                background: 'var(--bg)',
                                color: 'var(--text-main)',
                                fontSize: '0.9rem',
                                fontWeight: 500
                            }}
                        >
                            {(periodType === "Monthly" ? monthlyOptions : quarterlyOptions).map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Reports Section Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
                
                {/* LINE ITEM 1: GST READY REPORT */}
                <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '18px',
                    padding: '28px',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 4px 25px rgba(0,0,0,0.04)'
                }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #10B981, #059669)' }}></div>
                    
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                                    GST Ready Report
                                </h3>
                                <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    GSTR-1 Compliant
                                </span>
                            </div>
                        </div>

                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '20px' }}>
                            Generates an official GSTR-1 Excel workbook formatted with 2 worksheets:
                        </p>

                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>1</span>
                                <strong>Tab 1: B2CS</strong> &mdash; B2C Small Supplies by State & Tax Rate
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>2</span>
                                <strong>Tab 2: HSN Summary</strong> &mdash; Sales aggregated by Category HSN Code
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={() => handleDownload("gst-ready")}
                        disabled={downloadingGst}
                        style={{
                            width: '100%',
                            padding: '12px 20px',
                            borderRadius: '12px',
                            background: '#10B981',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            border: 'none',
                            cursor: downloadingGst ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            fontSize: '0.92rem',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                            opacity: downloadingGst ? 0.7 : 1
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        {downloadingGst ? "Generating Excel..." : "Download GST Ready Report"}
                    </button>
                </div>

                {/* LINE ITEM 2: ORDER REPORTS */}
                <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '18px',
                    padding: '28px',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 4px 25px rgba(0,0,0,0.04)'
                }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #3B82F6, #2563EB)' }}></div>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                                    Order Reports
                                </h3>
                                <span style={{ fontSize: '0.78rem', color: '#3B82F6', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Order Level Audit
                                </span>
                            </div>
                        </div>

                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '20px' }}>
                            Generates a complete Order Sales Audit Report workbook with 1 row per order containing:
                        </p>

                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#3B82F6' }}>&bull;</span> Invoice Number, Date, Order Type & Status
                            </li>
                            <li style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#3B82F6' }}>&bull;</span> Customer Contact, Address & Place of Supply
                            </li>
                            <li style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#3B82F6' }}>&bull;</span> Subtotal Taxable Value, CGST, SGST, IGST Totals
                            </li>
                            <li style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#3B82F6' }}>&bull;</span> Payment Method, Reference ID & Delivery Dates
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={() => handleDownload("orders")}
                        disabled={downloadingOrder}
                        style={{
                            width: '100%',
                            padding: '12px 20px',
                            borderRadius: '12px',
                            background: '#3B82F6',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            border: 'none',
                            cursor: downloadingOrder ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            fontSize: '0.92rem',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
                            opacity: downloadingOrder ? 0.7 : 1
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        {downloadingOrder ? "Generating Excel..." : "Download Order Reports"}
                    </button>
                </div>

            </div>

        </div>
    );
}
