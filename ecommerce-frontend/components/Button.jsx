import React from 'react';

export default function Button({ 
    variant = 'primary', 
    size = 'md', 
    children, 
    className = '', 
    style = {}, 
    ...props 
}) {
    let sizeStyle = {};
    if (size === 'sm') {
        sizeStyle = {
            padding: '6px 16px',
            fontSize: '0.8rem',
            borderRadius: '8px'
        };
    } else if (size === 'lg') {
        sizeStyle = {
            padding: '12px 32px',
            fontSize: '1rem',
            borderRadius: '12px'
        };
    }

    let variantClass = 'btn-primary';
    if (variant === 'secondary') variantClass = 'btn-secondary';
    else if (variant === 'danger') variantClass = 'btn-danger';
    else if (variant === 'lav') variantClass = 'btn-lav';
    else if (variant === 'black-solid') variantClass = 'btn-black-solid';
    else if (variant === 'brand-solid') variantClass = 'btn-brand-solid';
    else if (variant === 'outline') variantClass = 'btn-outline-black';
    else if (variant === 'outline-white') variantClass = 'btn-outline-white';
    else if (variant === 'outline-black') variantClass = 'btn-outline-black';
    else if (variant === 'ghost') {
        variantClass = '';
        sizeStyle = {
            ...sizeStyle,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-main)',
            padding: '8px',
            cursor: 'pointer'
        };
    }

    const mergedStyle = { ...sizeStyle, ...style };

    return (
        <button 
            className={`btn ${variantClass} ${className}`.trim()} 
            style={mergedStyle} 
            {...props}
        >
            {children}
        </button>
    );
}
