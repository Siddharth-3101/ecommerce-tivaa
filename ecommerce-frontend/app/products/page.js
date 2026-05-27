import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function fetchProducts(categoryName, query, page = 1) {
    try {
        const backendUrl = process.env.BACKEND_API_URL || "http://tivaajewelery.us-east-1.elasticbeanstalk.com";
        const limit = 12;

        if (query) {
            const url = `${backendUrl}/api/products/search?q=${encodeURIComponent(query)}`;
            const res = await fetch(url, { cache: 'no-store' });
            if (!res.ok) return { products: [], page: 1, totalPages: 1, total: 0 };
            const data = await res.json();
            const total = data.length;
            const totalPages = Math.ceil(total / limit) || 1;
            const offset = (page - 1) * limit;
            return {
                products: data.slice(offset, offset + limit),
                page,
                totalPages,
                total
            };
        } else if (categoryName) {
            const url = `${backendUrl}/api/products/filter?category=${encodeURIComponent(categoryName)}`;
            const res = await fetch(url, { cache: 'no-store' });
            if (!res.ok) return { products: [], page: 1, totalPages: 1, total: 0 };
            const data = await res.json();
            const total = data.length;
            const totalPages = Math.ceil(total / limit) || 1;
            const offset = (page - 1) * limit;
            return {
                products: data.slice(offset, offset + limit),
                page,
                totalPages,
                total
            };
        } else {
            const url = `${backendUrl}/api/products?page=${page}&limit=${limit}`;
            const res = await fetch(url, { cache: 'no-store' });
            if (!res.ok) return { products: [], page: 1, totalPages: 1, total: 0 };
            const data = await res.json();
            return {
                products: data.products || [],
                page: data.page || page,
                totalPages: data.totalPages || 1,
                total: data.total || 0
            };
        }
    } catch (err) {
        return { products: [], page: 1, totalPages: 1, total: 0 };
    }
}

async function fetchCategories() {
    try {
        const backendUrl = process.env.BACKEND_API_URL || "http://tivaajewelery.us-east-1.elasticbeanstalk.com";
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
    const page = parseInt(resolvedParams.page) || 1;

    const data = await fetchProducts(category, query, page);
    const categories = await fetchCategories();
    const totalPages = data.totalPages || 1;

    return (
        <div className="animate-fade-in" style={{ padding: '40px 0 80px' }}>
            <div className="container" style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', marginBottom: '12px', fontWeight: 300, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-main)' }}>
                    {query ? `Search results` : category ? `${category}` : "Our Collections"}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', maxWidth: '600px', lineHeight: 1.5 }}>
                    {query ? `${data.total || 0} items found matching your search.` : "Explore our hand-picked selection of premium boutique essentials crafted for perfection."}
                </p>

                {/* Categories Filter Links */}
                {categories && categories.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
                        <Link href="/products" className={`btn ${!category && !query ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 12px', fontSize: '0.85rem', borderRadius: '4px' }}>
                            All Collections
                        </Link>
                        {categories.map(c => (
                            <Link
                                key={c.id}
                                href={`/products?category=${encodeURIComponent(c.name)}`}
                                className={`btn ${category === c.name ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ padding: '6px 12px', fontSize: '0.85rem', borderRadius: '4px' }}
                            >
                                {c.name}
                            </Link>
                        ))}
                    </div>
                )}
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
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--text-main)' }}>No products found</h3>
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
                                href={`/products?${category ? `category=${encodeURIComponent(category)}&` : ''}${query ? `q=${encodeURIComponent(query)}&` : ''}page=${page - 1}`}
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
                                    href={`/products?${category ? `category=${encodeURIComponent(category)}&` : ''}${query ? `q=${encodeURIComponent(query)}&` : ''}page=${p}`}
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
                                href={`/products?${category ? `category=${encodeURIComponent(category)}&` : ''}${query ? `q=${encodeURIComponent(query)}&` : ''}page=${page + 1}`}
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
