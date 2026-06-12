import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import SortSelect from "@/components/SortSelect";

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

async function fetchRelatedProducts(query, sort) {
    try {
        const backendUrl = process.env.BACKEND_API_URL || "http://tivaajewelery.us-east-1.elasticbeanstalk.com";
        
        // 1. Fetch direct matching products
        const searchRes = await fetch(`${backendUrl}/api/products/search?q=${encodeURIComponent(query)}`, { cache: 'no-store' });
        if (!searchRes.ok) return { related: [], categories: [], searchProductIds: new Set() };
        
        const searchProducts = await searchRes.json();
        const searchProductIds = new Set(searchProducts.map(p => p.id));
        
        // Extract unique categories
        const categories = [...new Set(searchProducts.map(p => p.category_name).filter(Boolean))];
        if (categories.length === 0) {
            return { related: [], categories: [], searchProductIds };
        }
        
        // 2. Fetch products in those categories
        const allRelatedPromises = categories.map(async (cat) => {
            try {
                const res = await fetch(`${backendUrl}/api/products/filter?category=${encodeURIComponent(cat)}`, { cache: 'no-store' });
                if (res.ok) return await res.json();
            } catch (e) {
                console.error(e);
            }
            return [];
        });
        
        const results = await Promise.all(allRelatedPromises);
        
        // Flatten and de-duplicate
        const seenIds = new Set();
        const related = [];
        
        for (const list of results) {
            for (const p of list) {
                // Exclude if it is in the direct search results or already seen
                if (!searchProductIds.has(p.id) && !seenIds.has(p.id)) {
                    seenIds.add(p.id);
                    related.push(p);
                }
            }
        }
        
        // Sort and partition
        const sortedRelated = partitionAndSortProducts(related, sort);
        
        return {
            related: sortedRelated,
            categories,
            searchProductIds
        };
    } catch (err) {
        console.error(err);
        return { related: [], categories: [], searchProductIds: new Set() };
    }
}

export default async function RelatedProductsPage({ searchParams }) {
    const resolvedParams = await searchParams || {};
    const query = resolvedParams.q || "";
    const sort = resolvedParams.sort;
    const page = parseInt(resolvedParams.page) || 1;
    const limit = 12;

    const { related, categories } = query 
        ? await fetchRelatedProducts(query, sort)
        : { related: [], categories: [] };

    const total = related.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const paginatedProducts = related.slice(offset, offset + limit);

    return (
        <div className="animate-fade-in" style={{ padding: '40px 0 80px' }}>
            <div className="container" style={{ marginBottom: '24px' }}>
                {/* Back Link */}
                <div style={{ marginBottom: '20px' }}>
                    <Link href={`/products?q=${encodeURIComponent(query)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        Back to Search Results
                    </Link>
                </div>

                <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', marginBottom: '12px', fontWeight: 300, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-main)' }}>
                    Related Products
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', maxWidth: '600px', lineHeight: 1.5 }}>
                    Showing {total} related items based on categories matching your search query &ldquo;{query}&rdquo;.
                </p>

                {categories.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginTop: '16px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Matched Categories:</span>
                        {categories.map((cat, idx) => (
                            <span key={idx} style={{ fontSize: '0.8rem', padding: '4px 12px', background: 'rgba(122, 56, 194, 0.06)', border: '1px solid rgba(122, 56, 194, 0.15)', borderRadius: '100px', color: 'var(--accent)', fontWeight: 500 }}>
                                {cat}
                            </span>
                        ))}
                    </div>
                )}

                {/* Categories and Sort Filter Bar */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginTop: '24px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid var(--border)'
                }}>
                    {/* Sorting Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Sort by:</span>
                        <SortSelect currentSort={sort} />
                    </div>
                </div>
            </div>

            <section className="container">
                <div className="product-grid-boutique">
                    {paginatedProducts.length > 0 ? (
                        paginatedProducts.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))
                    ) : (
                        <div style={{ padding: '60px', background: 'var(--bg-card)', borderRadius: '16px', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ width: '80px', height: '80px', margin: '0 auto 20px', borderRadius: '50%', background: 'rgba(54, 46, 42, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--text-main)' }}>No related products found</h3>
                            <p>No other items are currently listed under the categories matching your query.</p>
                        </div>
                    )}
                </div>

                {/* Sleek Boutique Pagination Selector */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '60px' }}>
                        {page > 1 && (
                            <Link
                                href={`/products/related?q=${encodeURIComponent(query)}&${sort ? `sort=${sort}&` : ''}page=${page - 1}`}
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
                                    href={`/products/related?q=${encodeURIComponent(query)}&${sort ? `sort=${sort}&` : ''}page=${p}`}
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
                                href={`/products/related?q=${encodeURIComponent(query)}&${sort ? `sort=${sort}&` : ''}page=${page + 1}`}
                                className="btn btn-secondary"
                                style={{ padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}
                            >
                                Next
                            </Link>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}
