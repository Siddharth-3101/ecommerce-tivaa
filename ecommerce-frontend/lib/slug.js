export function slugify(text) {
    if (!text) return "";
    return String(text)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

export function extractProductId(param) {
    if (!param) return null;
    const str = String(param).trim();
    // If str is purely numeric (e.g. "140")
    if (/^\d+$/.test(str)) {
        return Number(str);
    }
    // If str is in slug-id format (e.g. "pink-unicorn-water-bottle-140")
    const match = str.match(/-(\d+)$/);
    if (match) {
        return Number(match[1]);
    }
    return null;
}

export function getProductSlug(product) {
    if (!product || !product.id) return "";
    const nameSlug = slugify(product.name || "product");
    return `${nameSlug}-${product.id}`;
}
