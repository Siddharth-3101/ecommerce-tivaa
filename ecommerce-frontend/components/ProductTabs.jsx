"use client";

import { useState, useEffect } from "react";

export default function ProductTabs({ description, features }) {
    const hasDesc = description && description.trim() && description.trim() !== "<p><br></p>" && description.trim() !== "<p></p>";
    const hasFeatures = features && features.trim().length > 0;

    // Use state to track active tab
    const [activeTab, setActiveTab] = useState("description");

    // Sync active tab based on which prop is present
    useEffect(() => {
        if (!hasDesc && hasFeatures) {
            setActiveTab("features");
        } else if (hasDesc) {
            setActiveTab("description");
        }
    }, [description, features, hasDesc, hasFeatures]);

    if (!hasDesc && !hasFeatures) {
        return null;
    }

    const showHeaders = hasDesc && hasFeatures;

    return (
        <div style={{ marginTop: '40px' }}>
            {/* Tab Headers */}
            {showHeaders && (
                <div style={{ borderBottom: '1px solid var(--border)', display: 'flex', gap: '32px', marginBottom: '32px' }}>
                    <button 
                        onClick={() => setActiveTab("description")}
                        style={{ 
                            fontSize: '18px', 
                            paddingBottom: '12px', 
                            border: 'none',
                            borderBottom: activeTab === "description" ? '2px solid var(--accent)' : '2px solid transparent', 
                            color: activeTab === "description" ? 'var(--accent)' : 'var(--text-muted)', 
                            fontWeight: 600, 
                            cursor: 'pointer',
                            background: 'transparent',
                            outline: 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Description
                    </button>
                    <button 
                        onClick={() => setActiveTab("features")}
                        style={{ 
                            fontSize: '18px', 
                            paddingBottom: '12px', 
                            border: 'none',
                            borderBottom: activeTab === "features" ? '2px solid var(--accent)' : '2px solid transparent', 
                            color: activeTab === "features" ? 'var(--accent)' : 'var(--text-muted)', 
                            fontWeight: 600, 
                            cursor: 'pointer',
                            background: 'transparent',
                            outline: 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Product Features
                    </button>
                </div>
            )}
            
            {/* Tab Content */}
            <div style={{ maxWidth: '800px', minHeight: showHeaders ? '150px' : 'auto' }}>
                {((!showHeaders && hasDesc) || (showHeaders && activeTab === "description")) && (
                    <div 
                        className="quill-content"
                        style={{ color: 'var(--text-main)', fontSize: '16px', lineHeight: 1.6, fontWeight: 400 }}
                        dangerouslySetInnerHTML={{ __html: description }}
                    />
                )}
                
                {((!showHeaders && hasFeatures) || (showHeaders && activeTab === "features")) && (
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {features.split('\n').filter(f => f.trim()).map((feature, idx) => (
                            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: 'var(--text-main)', fontSize: '16px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}><polyline points="20 6 9 17 4 12"></polyline></svg>
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
