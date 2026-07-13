"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Dropdown from "./Dropdown";

export default function CategorySelect({ categories = [], currentCategory, currentSort }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSelect = (categoryName) => {
        const params = new URLSearchParams(searchParams.toString());
        if (categoryName) {
            params.set("category", categoryName);
        } else {
            params.delete("category");
        }
        params.delete("page");
        params.delete("q");
        router.push(`/products?${params.toString()}`);
    };

    const activeDisplay = currentCategory || "All Collections";

    return (
        <Dropdown
            value={activeDisplay}
            isCategoryTree={true}
            categories={categories}
            currentCategory={currentCategory}
            onChange={handleSelect}
        />
    );
}
