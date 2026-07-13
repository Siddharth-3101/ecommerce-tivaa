"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Dropdown from "./Dropdown";

export default function SortSelect({ currentSort }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleChange = (sortValue) => {
        const params = new URLSearchParams(searchParams.toString());
        if (sortValue) {
            params.set("sort", sortValue);
        } else {
            params.delete("sort");
        }
        params.delete("page");
        router.push(`/products?${params.toString()}`);
    };

    const sortOptions = [
        { value: "", label: "Default sorting" },
        { value: "price_low", label: "Price: Low to High" },
        { value: "price_high", label: "Price: High to Low" },
        { value: "name_asc", label: "Name: A to Z" },
        { value: "name_desc", label: "Name: Z to A" }
    ];

    const activeOpt = sortOptions.find(o => o.value === (currentSort || ""));
    const activeLabel = activeOpt ? activeOpt.label : "Default sorting";

    return (
        <Dropdown
            label="Sort by:"
            value={activeLabel}
            options={sortOptions}
            onChange={handleChange}
        />
    );
}
