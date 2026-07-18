import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import SortSelect from "@/components/SortSelect";
import CategorySelect from "@/components/CategorySelect";
import Heading from "@/components/Heading";
import RelatedProductsSlider from "@/components/RelatedProductsSlider";
import { getPaginationRange } from "@/lib/pagination";

export const dynamic = "force-dynamic";

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
    const paginationPages = getPaginationRange(page, totalPages);

    const showInHomeCats = Array.isArray(categories) 
        ? categories.filter(c => c.show_in_homepage === 1 || c.show_in_homepage === true)
        : [];
    let recommendedProducts = [];
    if (showInHomeCats.length > 0) {
        const shuffle = (arr) => arr.sort(() => 0.5 - Math.random());
        
        let sameCatName = category;
        if (!sameCatName && showInHomeCats.length > 0) {
            sameCatName = showInHomeCats[Math.floor(Math.random() * showInHomeCats.length)].name;
        }

        let sameList = [];
        if (sameCatName) {
            const sameData = await fetchProducts(sameCatName, null, null, 1);
            sameList = sameData.products || [];
        }

        // Loop to find another category containing active products
        let otherList = [];
        const otherCats = showInHomeCats.filter(c => c.name.toLowerCase() !== sameCatName?.toLowerCase());
        let attempts = 0;
        while (otherCats.length > 0 && otherList.length === 0 && attempts < 5) {
            attempts++;
            const randomCat = otherCats[Math.floor(Math.random() * otherCats.length)];
            const otherData = await fetchProducts(randomCat.name, null, null, 1);
            if (otherData.products && otherData.products.length > 0) {
                otherList = otherData.products;
                break;
            }
        }

        const shuffledSame = shuffle(sameList);
        const shuffledOther = shuffle(otherList);

        let chosenSame = shuffledSame.slice(0, 5);
        let chosenOther = shuffledOther.slice(0, 5);

        // Backfill if one list has fewer than 5 items
        const totalCount = chosenSame.length + chosenOther.length;
        if (totalCount < 10) {
            const needed = 10 - totalCount;
            if (chosenSame.length < 5 && shuffledOther.length > 5) {
                const extraOther = shuffledOther.slice(5, 5 + needed);
                chosenOther = [...chosenOther, ...extraOther];
            } else if (chosenOther.length < 5 && shuffledSame.length > 5) {
                const extraSame = shuffledSame.slice(5, 5 + needed);
                chosenSame = [...chosenSame, ...extraSame];
            }
        }

        recommendedProducts = shuffle([...chosenSame, ...chosenOther]).slice(0, 10);
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
 
    const lowerQuery = (query || "").toLowerCase();
    const queryWords = lowerQuery.trim().split(/\s+/).filter(Boolean);
    const matchingCats = queryWords.length > 0 && Array.isArray(categories)
        ? categories.filter(c => {
            const catName = c.name.toLowerCase();
            return catName.includes(lowerQuery) || queryWords.some(word => catName.includes(word));
        })
        : [];

    return (
        <div className="animate-fade-in" style={{ padding: '20px 0 60px' }}>
            <div className="container" style={{ marginBottom: '12px' }}>
                <Heading as="h2" variant="HomeHeader2" style={{ marginBottom: '12px', textTransform: 'none', letterSpacing: 'normal' }}>
                    {query ? `Search results` : displayName}
                </Heading>
                <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', maxWidth: '600px', lineHeight: 1.5, marginBottom: '20px' }}>
                    {query ? `${data.total || 0} items found matching your search "${query}"` : ""}
                </p>

                {/* Category Match Tiles */}
                {matchingCats.length > 0 && (
                    <div style={{ marginTop: '16px', marginBottom: '28px', background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '12px', padding: '16px 20px' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                            Related Categories
                        </div>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {matchingCats.map(cat => (
                                <Link 
                                    key={cat.id} 
                                    href={`/products?category=${encodeURIComponent(cat.name)}`}
                                    style={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: '8px', 
                                        background: '#ffffff', 
                                        border: '1px solid #cbd5e1', 
                                        borderRadius: '8px', 
                                        padding: '8px 16px', 
                                        textDecoration: 'none', 
                                        color: 'var(--text-main)',
                                        fontWeight: 500,
                                        fontSize: '0.9rem',
                                        transition: 'all 0.2s',
                                        boxShadow: 'var(--shadow-sm)'
                                    }}
                                    className="category-tile-btn"
                                >
                                    <span>📁</span>
                                    <span>{cat.name}</span>
                                    <span style={{ color: '#0d9488', fontSize: '0.8rem', marginLeft: '4px' }}>→</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}


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

                        {paginationPages.map((p, index) => {
                            if (p === '...') {
                                return (
                                    <span
                                        key={`ellipsis-${index}`}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '40px',
                                            height: '40px',
                                            fontSize: '0.9rem',
                                            color: 'var(--text-muted)'
                                        }}
                                    >
                                        ...
                                    </span>
                                );
                            }
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
                <section className="container" style={{ marginTop: '20px', marginBottom: '20px' }}>
                    <RelatedProductsSlider relatedProducts={recommendedProducts} />
                </section>
            )}
            <style dangerouslySetInnerHTML={{ __html: `
                .category-tile-btn:hover {
                    border-color: #0d9488 !important;
                    background-color: #f0fdfa !important;
                    transform: translateY(-1.5px);
                    box-shadow: 0 4px 10px rgba(13, 148, 136, 0.12) !important;
                }
            `}} />
        </div>
    );
}
