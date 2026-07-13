import React from 'react';

export default function CategoryTitle({ children, style = {}, className = '', ...props }) {
    const defaultStyle = {
        fontSize: '0.65rem', // Increased by 10% from 0.595rem
        fontWeight: 600,
        color: 'var(--text-main)',
        fontFamily: 'var(--font-poppins), sans-serif',
        textTransform: 'capitalize',
        textAlign: 'center',
        margin: 0,
        lineHeight: 1.3,
        display: 'block'
    };

    return (
        <span 
            className={`category-title-comp ${className}`.trim()} 
            style={{ ...defaultStyle, ...style }} 
            {...props}
        >
            {children}
        </span>
    );
}
