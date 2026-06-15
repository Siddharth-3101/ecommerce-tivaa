"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CategorySelect({ categories, currentCategory, currentSort }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set("category", value);
        } else {
            params.delete("category");
        }
        params.delete("page"); // Reset page on category change
        params.delete("q"); // Clear search query when explicitly selecting a category
        router.push(`/products?${params.toString()}`);
    };

    if (categories && categories.length > 10) {
        return (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '340px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500, width: '80px', flexShrink: 0 }}>Collection:</span>
                <select
                    value={currentCategory || ""}
                    onChange={handleCategoryChange}
                    style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: '#ffffff',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        outline: 'none',
                        cursor: 'pointer',
                        flexGrow: 1,
                        width: '100%',
                        minWidth: '0',
                        maxWidth: '240px',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all 0.2s ease',
                        fontFamily: 'inherit'
                    }}
                >
                    <option value="">All Collections</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>
        );
    }

    // Default to horizontal list of buttons if 10 or fewer
    return (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link
                href={`/products${currentSort ? `?sort=${currentSort}` : ''}`}
                className={`btn ${!currentCategory ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '0.85rem', borderRadius: '4px' }}
            >
                All Collections
            </Link>
            {categories && categories.length > 0 && categories.map(c => (
                <Link
                    key={c.id}
                    href={`/products?category=${encodeURIComponent(c.name)}${currentSort ? `&sort=${currentSort}` : ''}`}
                    className={`btn ${currentCategory === c.name ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '6px 12px', fontSize: '0.85rem', borderRadius: '4px' }}
                >
                    {c.name}
                </Link>
            ))}
        </div>
    );
}
