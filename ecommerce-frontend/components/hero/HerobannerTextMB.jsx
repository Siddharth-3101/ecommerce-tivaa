import React from 'react';

export default function HerobannerTextMB({ title, subtitle, children, className = '', style = {}, ...props }) {
    return (
        <div className={`hero-slide-content ${className}`.trim()} style={{ display: 'flex', flexDirection: 'column', gap: '8px', ...style }} {...props}>
            {title && (
                <h1 className="hero-slide-title" style={{ fontSize: '6vw' }}>
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
                <p className="hero-slide-subtitle" style={{ fontSize: '3.5vw' }}>
                    {subtitle.toLowerCase().includes("& more") || subtitle.toLowerCase().includes("&more") ? (
                        <>
                            {subtitle.split(/& More/i)[0].trim()}
                            <br />
                            & More {subtitle.split(/& More/i)[1]?.trim()}
                        </>
                    ) : (
                        subtitle
                    )}
                </p>
            )}
            {children}
        </div>
    );
}
