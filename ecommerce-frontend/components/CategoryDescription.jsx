"use client";

import { useState } from "react";

export default function CategoryDescription({ description, style = {} }) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!description) return null;

    const combinedStyle = {
        color: 'var(--text-muted)',
        fontSize: '0.72rem',
        width: '100%',
        lineHeight: 1.4,
        ...style
    };

    if (description.length <= 100) {
        return <p style={combinedStyle}>{description}</p>;
    }

    const displayText = isExpanded ? description : description.substring(0, 100) + "...";

    return (
        <p style={combinedStyle}>
            {displayText}{" "}
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    background: "none",
                    border: "none",
                    color: "var(--accent)",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                    fontSize: "0.72rem",
                    textDecoration: "underline",
                    display: "inline",
                    marginLeft: "4px"
                }}
            >
                {isExpanded ? "Read Less" : "Read More"}
            </button>
        </p>
    );
}
