import React from 'react';

export default function HerobannerTextWB({ title, subtitle, children, className = '', style = {}, ...props }) {
    return (
        <div className={`hero-slide-content ${className}`.trim()} style={{ display: 'flex', flexDirection: 'column', gap: '16px', ...style }} {...props}>
            {title && (
                <h1 className="hero-slide-title">
                    {title.toLowerCase().includes("essentials") ? (
                        <>
                            {title.replace(/Essentials/gi, "").trim()}
                            <br />
                            <span className="hero-slide-highlight">Essentials</span>
                        </>
                    ) : (
                        title
                    )}
                </h1>
            )}
            {subtitle && (
                <p className="hero-slide-subtitle">
                    {subtitle}
                </p>
            )}
            {children}
        </div>
    );
}
