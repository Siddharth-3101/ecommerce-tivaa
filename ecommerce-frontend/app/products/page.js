import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import SortSelect from "@/components/SortSelect";
import CategorySelect from "@/components/CategorySelect";
import Heading from "@/components/Heading";

export const dynamic = "force-dynamic";

function partitionAndSortProducts(products, sort) {
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

    const sortFn = (a, b) => {
        if (sort === "price_low") {
            return Number(a.price) - Number(b.price);
        } else if (sort === "price_high") {
            return Number(b.price) - Number(a.price);
        } else if (sort === "name_asc") {
            return (a.name || "").localeCompare(b.name || "");
        } else if (sort === "name_desc") {
            return (b.name || "").localeCompare(a.name || "");
        }
        return 0;
    };

    if (sort) {
        inStock.sort(sortFn);
        outOfStock.sort(sortFn);
    }

    return [...inStock, ...outOfStock];
}

async function fetchProducts(categoryName, query, sort, page = 1) {
    try {
        const backendUrl = process.env.BACKEND_API_URL || "http://api.tivaa.in";
        const limit = 12;

        let products = [];
        let isPaginatedOnBackend = false;
        let backendTotal = 0;
        let backendTotalPages = 1;

        if (query) {
            const url = `${backendUrl}/api/products/search?q=${encodeURIComponent(query)}`;
            const res = await fetch(url, { cache: 'no-store' });
            if (res.ok) {
                products = await res.json();
            }
        } else if (categoryName || sort) {
            let url = `${backendUrl}/api/products/filter?`;
            if (categoryName) url += `category=${encodeURIComponent(categoryName)}&`;
            if (sort) url += `sort=${encodeURIComponent(sort)}&`;
            const res = await fetch(url, { cache: 'no-store' });
            if (res.ok) {
                products = await res.json();
            }
        } else {
            const url = `${backendUrl}/api/products?page=${page}&limit=${limit}`;
            const res = await fetch(url, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                products = data.products || [];
                isPaginatedOnBackend = true;
                backendTotal = data.total || 0;
                backendTotalPages = data.totalPages || 1;
            }
        }

        // Apply partitioning and sorting on frontend
        products = partitionAndSortProducts(products, sort);

        if (isPaginatedOnBackend) {
            return {
                products,
                page,
                totalPages: backendTotalPages,
                total: backendTotal
            };
        }

        const total = products.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const offset = (page - 1) * limit;
        return {
            products: products.slice(offset, offset + limit),
            page,
            totalPages,
            total
        };
    } catch (err) {
        return { products: [], page: 1, totalPages: 1, total: 0 };
    }
}

async function fetchCategories() {
    try {
        const backendUrl = process.env.BACKEND_API_URL || "http://api.tivaa.in";
        const res = await fetch(`${backendUrl}/api/categories`, {
            cache: 'no-store'
        });
        if (!res.ok) {
            return [];
        }
        return await res.json();
    } catch (err) {
        return [];
    }
}

export default async function ProductsPage({ searchParams }) {
    const resolvedParams = await searchParams || {};
    const category = resolvedParams.category;
    const query = resolvedParams.q;
    const sort = resolvedParams.sort;
    const page = parseInt(resolvedParams.page) || 1;

    const [data, categories] = await Promise.all([
        fetchProducts(category, query, sort, page),
        fetchCategories()
    ]);
    const totalPages = data.totalPages || 1;

    const showInHomeCats = Array.isArray(categories) 
        ? categories.filter(c => c.show_in_homepage === 1 || c.show_in_homepage === true)
        : [];
    let recommendedProducts = [];
    if (showInHomeCats.length > 0) {
        const candidates = category 
            ? showInHomeCats.filter(c => c.name.toLowerCase() !== category.toLowerCase())
            : showInHomeCats;
        const chosenCat = candidates.length > 0 
            ? candidates[Math.floor(Math.random() * candidates.length)]
            : showInHomeCats[Math.floor(Math.random() * showInHomeCats.length)];
        
        if (chosenCat) {
            const recData = await fetchProducts(chosenCat.name, null, null, 1);
            recommendedProducts = (recData.products || []).slice(0, 4);
        }
    }
 
    let displayName = category || "Our Collections";
    if (category && Array.isArray(categories)) {
        const selectedCat = categories.find(
            c => c.name.trim().toLowerCase() === category.trim().toLowerCase()
        );
        if (selectedCat) {
            if (selectedCat.parent_id) {
                const parentCat = categories.find(c => c.id === selectedCat.parent_id);
                if (parentCat) {
                    displayName = `${parentCat.name} -> ${selectedCat.name}`;
                }
            } else {
                displayName = selectedCat.name;
            }
        }
    }
 
    return (
        <div className="animate-fade-in" style={{ padding: '20px 0 60px' }}>
            <div className="container" style={{ marginBottom: '12px' }}>
                <Heading as="h2" variant="HomeHeader2" style={{ marginBottom: '12px', textTransform: 'none', letterSpacing: 'normal' }}>
                    {query ? `Search results` : displayName}
                </Heading>
                <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', maxWidth: '600px', lineHeight: 1.5 }}>
                    {query ? `${data.total || 0} items found matching your search "${query}"` : ""}
                </p>


                {/* Categories and Sort Filter Bar */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginTop: '12px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid var(--border)'
                }}>
                    {/* Categories Filter Links or Dropdown */}
                    <CategorySelect
                        categories={categories}
                        currentCategory={category}
                        currentSort={sort}
                    />

                    {/* Sorting Selector */}
                    <SortSelect currentSort={sort} />
                </div>
            </div>

            <section className="container">
                <div className="product-grid-boutique">
                    {data.products && data.products.length > 0 ? (
                        data.products.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))
                    ) : (
                        <div style={{ padding: '60px', background: 'var(--bg-card)', borderRadius: '16px', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ width: '80px', height: '80px', margin: '0 auto 20px', borderRadius: '50%', background: 'rgba(54, 46, 42, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </div>
                            <Heading as="h3" variant="h3" style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--text-main)' }}>No products found</Heading>
                            <p>Try adjusting your search or filter criteria.</p>
                            <Link href="/products" className="btn btn-secondary" style={{ marginTop: '24px' }}>Clear Filters</Link>
                        </div>
                    )}
                </div>

                {/* Sleek Boutique Pagination Selector */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '60px' }}>
                        {page > 1 && (
                            <Link
                                href={`/products?${category ? `category=${encodeURIComponent(category)}&` : ''}${query ? `q=${encodeURIComponent(query)}&` : ''}${sort ? `sort=${sort}&` : ''}page=${page - 1}`}
                                className="btn btn-secondary"
                                style={{ padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}
                            >
                                Prev
                            </Link>
                        )}

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                            const isActive = p === page;
                            return (
                                <Link
                                    key={p}
                                    href={`/products?${category ? `category=${encodeURIComponent(category)}&` : ''}${query ? `q=${encodeURIComponent(query)}&` : ''}${sort ? `sort=${sort}&` : ''}page=${p}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        fontSize: '0.9rem',
                                        fontWeight: isActive ? '600' : '400',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s ease',
                                        border: isActive ? '1px solid var(--text-main)' : '1px solid #e0e0e0',
                                        background: isActive ? 'var(--text-main)' : 'transparent',
                                        color: isActive ? '#ffffff' : 'var(--text-main)',
                                    }}
                                >
                                    {p}
                                </Link>
                            );
                        })}

                        {page < totalPages && (
                            <Link
                                href={`/products?${category ? `category=${encodeURIComponent(category)}&` : ''}${query ? `q=${encodeURIComponent(query)}&` : ''}${sort ? `sort=${sort}&` : ''}page=${page + 1}`}
                                className="btn btn-secondary"
                                style={{ padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}
                            >
                                Next
                            </Link>
                        )}
                    </div>
                )}
            </section>

            {recommendedProducts.length > 0 && (
                <section className="container" style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid var(--border)', marginBottom: '40px' }}>
                    <Heading as="h2" variant="HomeHeader2" style={{ marginBottom: '20px' }}>
                        You May Also Like
                    </Heading>
                    <div className="product-grid-boutique">
                        {recommendedProducts.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
