"use client";

import { useState, useEffect } from "react";
import Button from "./Button";

export default function ProductTabs({ description, features }) {
    const hasDesc = description && description.trim() && description.trim() !== "<p><br></p>" && description.trim() !== "<p></p>";
    const hasFeatures = features && features.trim() && features.trim() !== "<p><br></p>" && features.trim() !== "<p></p>";

    const formatHyphens = (html) => {
        if (!html) return "";
        // Replaces hyphens only when they are not part of HTML tag structures (class names, styles, etc.)
        return html.replace(/-(?=[^<>]*<|[^<>]*$)/g, '\u2011');
    };

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

    const showHeaders = hasDesc || hasFeatures;

    return (
        <div style={{ marginTop: '40px' }}>
            {/* Tab Headers */}
            {showHeaders && (
                <div style={{ borderBottom: '1px solid var(--border)', display: 'flex', gap: '32px', marginBottom: '32px' }}>
                    {hasDesc && (
                        <Button 
                            variant="ghost"
                            onClick={() => setActiveTab("description")}
                            style={{ 
                                fontSize: '14px', 
                                paddingBottom: '12px', 
                                paddingTop: '8px',
                                paddingLeft: '8px',
                                paddingRight: '8px',
                                border: 'none',
                                borderBottom: activeTab === "description" ? '2px solid var(--accent)' : '2px solid transparent', 
                                color: activeTab === "description" ? 'var(--accent)' : 'var(--text-muted)', 
                                fontWeight: 600, 
                                cursor: 'pointer',
                                background: 'transparent',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                borderRadius: 0
                            }}
                        >
                            Description
                        </Button>
                    )}
                    {hasFeatures && (
                        <Button 
                            variant="ghost"
                            onClick={() => setActiveTab("features")}
                            style={{ 
                                fontSize: '14px', 
                                paddingBottom: '12px', 
                                paddingTop: '8px',
                                paddingLeft: '8px',
                                paddingRight: '8px',
                                border: 'none',
                                borderBottom: activeTab === "features" ? '2px solid var(--accent)' : '2px solid transparent', 
                                color: activeTab === "features" ? 'var(--accent)' : 'var(--text-muted)', 
                                fontWeight: 600, 
                                cursor: 'pointer',
                                background: 'transparent',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                borderRadius: 0
                            }}
                        >
                            Product Features
                        </Button>
                    )}
                </div>
            )}
            
            {/* Tab Content */}
            <div style={{ maxWidth: '800px', minHeight: '150px' }}>
                {hasDesc && activeTab === "description" && (
                    <div 
                        className="quill-content"
                        style={{ color: 'var(--text-main)', fontSize: '13px', lineHeight: 1.6, fontWeight: 400 }}
                        dangerouslySetInnerHTML={{ __html: formatHyphens(description) }}
                    />
                )}
                
                {hasFeatures && activeTab === "features" && (
                    <div 
                        className="quill-content"
                        style={{ color: 'var(--text-main)', fontSize: '13px', lineHeight: 1.6, fontWeight: 400 }}
                        dangerouslySetInnerHTML={{ __html: formatHyphens(features) }}
                    />
                )}
            </div>
        </div>
    );
}
