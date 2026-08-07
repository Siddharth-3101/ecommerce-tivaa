import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { slugify } from "@/lib/slug";
import SortSelect from "@/components/SortSelect";
import FiltersSidebar from "@/components/FiltersSidebar";
import CategoryDescription from "@/components/CategoryDescription";

export const dynamic = "force-dynamic";

async function fetchCategoriesData() {
    try {
        const backendUrl = process.env.BACKEND_API_URL || "http://api.tivaa.in";
        const res = await fetch(`${backendUrl}/api/categories`, { cache: 'no-store' });
        if (res.ok) return await res.json();
    } catch (e) {
        console.error("Failed to fetch categories in category page:", e);
    }
    return [];
}

async function fetchProductsData() {
    try {
        const backendUrl = process.env.BACKEND_API_URL || "http://api.tivaa.in";
        const res = await fetch(`${backendUrl}/api/products?limit=1000`, { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            return Array.isArray(data) ? data : (data.products || []);
        }
    } catch (e) {
        console.error("Failed to fetch products in category page:", e);
    }
    return [];
}

async function fetchFiltersListData() {
    try {
        const backendUrl = process.env.BACKEND_API_URL || "http://api.tivaa.in";
        const res = await fetch(`${backendUrl}/api/products/filters-list`, { cache: 'no-store' });
        if (res.ok) return await res.json();
    } catch (e) {
        console.error("Failed to fetch public filters list in category page:", e);
    }
    return [];
}

async function fetchSettingsData() {
    try {
        const backendUrl = process.env.BACKEND_API_URL || "http://api.tivaa.in";
        const res = await fetch(`${backendUrl}/api/settings`, { cache: 'no-store', next: { revalidate: 0 } });
        if (res.ok) return await res.json();
    } catch (e) {
        console.error("Failed to fetch settings in category page:", e);
    }
    return {};
}

function partitionAndSortProducts(products, sort) {
    const sortFn = (a, b) => {
        const priceA = a.discounted_price && Number(a.discounted_price) > 0 ? Number(a.discounted_price) : Number(a.price || 0);
        const priceB = b.discounted_price && Number(b.discounted_price) > 0 ? Number(b.discounted_price) : Number(b.price || 0);

        if (sort === "price_low") {
            return priceA - priceB;
        } else if (sort === "price_high") {
            return priceB - priceA;
        } else if (sort === "name_asc") {
            return (a.name || "").localeCompare(b.name || "");
        } else if (sort === "name_desc") {
            return (b.name || "").localeCompare(a.name || "");
        }
        return 0;
    };

    if (sort) {
        const sorted = [...products];
        sorted.sort(sortFn);
        return sorted;
    }

    const inStock = [];
    const outOfStock = [];

    for (const p of products) {
        const stockVal = p.stock === null || p.stock === undefined ? 0 : Number(p.stock);
        if (stockVal > 0) {
            inStock.push(p);
        } else {
            outOfStock.push(p);
        }
    }

    return [...inStock, ...outOfStock];
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const categories = await fetchCategoriesData();

    const slugArray = Array.isArray(slug) ? slug : [slug];
    const parentSlug = slugArray[0] || "";
    const subSlug = slugArray[1] || "";

    const parentCat = categories.find(c => !c.parent_id && slugify(c.name) === parentSlug);
    const subCat = subSlug && parentCat ? categories.find(c => Number(c.parent_id) === Number(parentCat.id) && slugify(c.name) === subSlug) : null;

    if (subCat && parentCat) {
        const subName = subCat.name;
        const parentName = parentCat.name;
        return {
            title: `${subName} | ${parentName} | TIVAA`,
            description: `Shop premium ${subName} from TIVAA. Find quality products at affordable prices with quick delivery across India.`,
            alternates: {
                canonical: `https://tivaa.in/category/${slugify(parentName)}/${slugify(subName)}`,
            },
        };
    }

    if (parentCat) {
        const catName = parentCat.name;
        return {
            title: `${catName} | TIVAA`,
            description: `Explore the latest ${catName} collection at TIVAA. Shop quality products with secure payments and fast delivery across India.`,
            alternates: {
                canonical: `https://tivaa.in/category/${slugify(catName)}`,
            },
        };
    }

    return {
        title: "Shop Categories | TIVAA",
        description: "Explore quality products across TIVAA categories with fast delivery across India.",
    };
}

export default async function CategorySlugPage({ params, searchParams }) {
    const resolvedParams = await params;
    const sParams = await searchParams || {};
    const sort = sParams.sort || "";
    
    const slug = resolvedParams.slug;
    const [categories, allProducts, filtersList, settings] = await Promise.all([
        fetchCategoriesData(),
        fetchProductsData(),
        fetchFiltersListData(),
        fetchSettingsData()
    ]);
    const showFilters = settings.show_filters_sidebar !== "false";

    const slugArray = Array.isArray(slug) ? slug : [slug];
    const parentSlug = slugArray[0] || "";
    const subSlug = slugArray[1] || "";

    const parentCat = categories.find(c => !c.parent_id && slugify(c.name) === parentSlug);
    const subCat = subSlug && parentCat ? categories.find(c => Number(c.parent_id) === Number(parentCat.id) && slugify(c.name) === subSlug) : null;

    let targetCategoryIds = [];
    let titleText = "Category Products";
    let breadcrumbParent = null;
    let categoryDescription = "";

    if (subCat && parentCat) {
        targetCategoryIds = [subCat.id];
        titleText = subCat.name;
        breadcrumbParent = parentCat;
        categoryDescription = subCat.description;
    } else if (parentCat) {
        const childCatIds = categories.filter(c => Number(c.parent_id) === Number(parentCat.id)).map(c => c.id);
        targetCategoryIds = [parentCat.id, ...childCatIds];
        titleText = parentCat.name;
        categoryDescription = parentCat.description;
    } else {
        // Fallback matching by name slug
        const matched = categories.find(c => slugify(c.name) === parentSlug);
        if (matched) {
            targetCategoryIds = [matched.id];
            titleText = matched.name;
            categoryDescription = matched.description;
        }
    }

    let filteredProducts = allProducts.filter(p => {
        if (targetCategoryIds.length === 0) return true;
        return targetCategoryIds.includes(p.category_id);
    });

    // Apply Price Range filtering
    const minPrice = Number(sParams.min_price) || 0;
    const maxPrice = Number(sParams.max_price) || 5000;
    filteredProducts = filteredProducts.filter(p => {
        const price = p.discounted_price && Number(p.discounted_price) > 0 ? Number(p.discounted_price) : Number(p.price || 0);
        return price >= minPrice && price <= maxPrice;
    });

    // Extract dynamic variations filters from search params
    const attrFilters = {};
    const reservedKeys = ['sort', 'min_price', 'max_price'];
    Object.keys(sParams).forEach(key => {
        if (!reservedKeys.includes(key)) {
            const vals = String(sParams[key]).split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
            if (vals.length > 0) {
                attrFilters[key.toLowerCase()] = vals;
            }
        }
    });

    // Filter by Dynamic Variations Attributes
    if (Object.keys(attrFilters).length > 0) {
        filteredProducts = filteredProducts.filter(p => {
            let variations = [];
            if (p.variations) {
                try {
                    variations = typeof p.variations === 'string' ? JSON.parse(p.variations) : p.variations;
                } catch (e) {
                    console.error("Failed to parse variations for product in category view:", p.id, e);
                }
            }
            if (!Array.isArray(variations)) variations = [];

            for (const [filterName, filterVals] of Object.entries(attrFilters)) {
                const group = variations.find(g => g.name && g.name.toLowerCase() === filterName);
                if (!group || !Array.isArray(group.options)) {
                    return false;
                }
                const hasMatchingOption = group.options.some(opt => opt.value && filterVals.includes(opt.value.toLowerCase()));
                if (!hasMatchingOption) {
                    return false;
                }
            }
            return true;
        });
    }

    // Apply sorting and stock partitioning
    filteredProducts = partitionAndSortProducts(filteredProducts, sort);

    return (
        <div style={{ maxWidth: '1600px', width: '95%', margin: '0 auto', padding: '30px 16px' }}>
            {/* Breadcrumbs */}
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <Link href="/" style={{ color: 'var(--text-main)', textDecoration: 'underline' }}>Home</Link>
                <span>&gt;</span>
                <Link href="/categories" style={{ color: 'var(--text-main)', textDecoration: 'underline' }}>Categories</Link>
                <span>&gt;</span>
                {breadcrumbParent && (
                    <>
                        <Link href={`/category/${slugify(breadcrumbParent.name)}`} style={{ color: 'var(--text-main)', textDecoration: 'underline' }}>
                            {breadcrumbParent.name}
                        </Link>
                        <span>&gt;</span>
                    </>
                )}
                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{titleText}</span>
            </div>

            {/* Title Header */}
            <div style={{ marginBottom: '28px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
                <h1 className="category-page-title" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                    {titleText}
                </h1>
                {categoryDescription && (
                    <CategoryDescription 
                        description={categoryDescription} 
                        style={{ marginTop: '8px', marginBottom: '0' }} 
                    />
                )}
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '12px', marginBottom: '0' }}>
                    Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                </p>
            </div>

            {/* Responsive 2-column Layout */}
            <div style={{
                display: "flex",
                gap: "32px",
                marginTop: "24px",
            }} className="products-layout-wrapper">
                
                {/* Left Column: Filters Sidebar */}
                {showFilters && (
                    <div style={{ width: "320px", flexShrink: 0 }} className="sidebar-column">
                        <FiltersSidebar
                            categories={categories}
                            filtersList={filtersList}
                            currentCategory={titleText}
                        />
                    </div>
                )}

                {/* Right Column: Products Grid */}
                <div style={{ flexGrow: 1 }} className="listing-column">
                    {/* Header bar inside right column */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        marginBottom: '20px',
                        paddingBottom: '12px',
                        borderBottom: '1px solid var(--border)'
                    }}>
                        <SortSelect currentSort={sort} />
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>No products found</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>No products are currently available matching this filter.</p>
                            <Link href="/products" className="btn btn-primary">Browse All Products</Link>
                        </div>
                    ) : (
                        <div className="product-grid-boutique" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .products-layout-wrapper {
                    display: flex !important;
                    gap: 32px !important;
                    margin-top: 24px !important;
                }
                .sidebar-column {
                    width: 320px !important;
                    flex-shrink: 0 !important;
                }
                .listing-column {
                    flex-grow: 1 !important;
                }
                @media (max-width: 768px) {
                    .products-layout-wrapper {
                        flex-direction: column !important;
                    }
                    .sidebar-column {
                        width: 100% !important;
                    }
                    .category-page-title {
                        display: none !important;
                    }
                    .product-grid-boutique {
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 12px !important;
                    }
                }
            `}} />
        </div>
    );
}
