import React from 'react';

export default function Heading({ as: Component = 'h2', variant = 'h2', children, className = '', style = {}, ...props }) {
    let variantStyle = {};
    let variantClassName = '';

    if (variant === 'h1') {
        variantStyle = {
            fontSize: 'clamp(0.805rem, 2.23vw, 1.246rem)',
            fontWeight: 300,
            letterSpacing: '1px',
            color: 'var(--text-main)',
            fontFamily: 'var(--font-poppins), sans-serif',
            margin: 0
        };
    } else if (variant === 'h2') {
        variantStyle = {
            fontSize: 'clamp(0.77rem, 1.96vw, 1.05rem)',
            fontWeight: 600,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-poppins), sans-serif',
            margin: 0
        };
    } else if (variant === 'h3') {
        variantStyle = {
            fontSize: '0.77rem',
            fontWeight: 500,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-poppins), sans-serif',
            margin: 0
        };
    } else if (variant === 'HomeHeader1' || variant === 'homeHeader1') {
        variantStyle = {
            fontSize: 'clamp(0.77rem, 1.96vw, 1.05rem)',
            fontWeight: 600,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-poppins), sans-serif',
            margin: 0
        };
    } else if (variant === 'HomeHeader2' || variant === 'homeHeader2') {
        variantStyle = {
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-poppins), sans-serif',
            margin: 0
        };
    } else if (variant === 'homepage') {
        variantClassName = 'section-heading-homepage';
    }

    const mergedStyle = { ...variantStyle, ...style };

    return (
        <Component className={`${variantClassName} ${className}`.trim()} style={mergedStyle} {...props}>
            {children}
        </Component>
    );
}
