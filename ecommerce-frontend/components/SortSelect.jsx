"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SortSelect({ currentSort }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleChange = (e) => {
        const value = e.target.value;
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set("sort", value);
        } else {
            params.delete("sort");
        }
        params.delete("page"); // Reset page to 1 on sort change
        router.push(`/products?${params.toString()}`);
    };

    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <select
                value={currentSort || ""}
                onChange={handleChange}
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
                    minWidth: '180px',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit'
                }}
            >
                <option value="">Default sorting</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
            </select>
        </div>
    );
}
