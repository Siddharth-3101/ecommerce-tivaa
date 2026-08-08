import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import SortSelect from "@/components/SortSelect";
import FiltersSidebar from "@/components/FiltersSidebar";
import Heading from "@/components/Heading";
import RelatedProductsSlider from "@/components/RelatedProductsSlider";
import CategoryDescription from "@/components/CategoryDescription";
import { getPaginationRange } from "@/lib/pagination";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
    const sParams = await searchParams;
    const searchKeyword = sParams?.search || sParams?.q || sParams?.query || "";
    const categoryName = sParams?.category || "";

    if (searchKeyword.trim()) {
        return {
            title: `Search Results for "${searchKeyword.trim()}" | TIVAA`,
            description: `Browse search results for "${searchKeyword.trim()}" at TIVAA. Find jewellery, school supplies and more with secure online shopping.`
        };
    }

    if (categoryName.trim()) {
        const cat = categoryName.trim();
        const lowerCat = cat.toLowerCase();
        if (lowerCat.includes("jewel") || lowerCat.includes("bangle") || lowerCat.includes("earring")) {
            return {
                title: "Fashion Jewellery Online | TIVAA",
                description: "Discover beautiful bangles, earrings, necklaces, bracelets and fashion jewellery for women. Shop stylish designs at TIVAA."
            };
        }
        if (lowerCat.includes("school") || lowerCat.includes("kid") || lowerCat.includes("supply")) {
            return {
                title: "Kids School Supplies Online | TIVAA",
                description: "Shop water bottles, lunch boxes, pencil pouches, school bags and other school essentials for kids at affordable prices."
            };
        }
        return {
            title: `${cat} | TIVAA`,
            description: `Explore the latest ${cat} collection at TIVAA. Shop quality products with secure payments and fast delivery across India.`
        };
    }

    return {
        title: "Shop All Products | TIVAA Online Store",
        description: "Browse all jewellery, school supplies and lifestyle products at TIVAA. Find quality products for every occasion with secure online shopping."
    };
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

async function fetchProducts(searchParams = {}) {
    try {
        const backendUrl = process.env.BACKEND_API_URL || "http://api.tivaa.in";
        const limit = 15;
        const page = parseInt(searchParams.page) || 1;
        const query = searchParams.q;

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
        } else {
            // Build the filter URL with all searchParams
            let url = `${backendUrl}/api/products/filter?`;
            
            // Add all searchParams except q, page, limit
            Object.keys(searchParams).forEach(key => {
                if (key !== 'q' && key !== 'page' && key !== 'limit') {
                    const val = searchParams[key];
                    if (val !== undefined && val !== null && val !== '') {
                        url += `${encodeURIComponent(key)}=${encodeURIComponent(val)}&`;
                    }
                }
            });

            // If there are no filters at all, fallback to the main paginated product list to keep it fast
            const hasFilters = Object.keys(searchParams).some(k => k !== 'q' && k !== 'page' && k !== 'limit' && searchParams[k]);
            
            if (!hasFilters) {
                url = `${backendUrl}/api/products?page=${page}&limit=${limit}`;
                isPaginatedOnBackend = true;
            }

            const res = await fetch(url, { cache: 'no-store' });
            if (res.ok) {
                if (isPaginatedOnBackend) {
                    const data = await res.json();
                    products = data.products || [];
                    backendTotal = data.total || 0;
                    backendTotalPages = data.totalPages || 1;
                } else {
                    products = await res.json();
                }
            }
        }

        // Apply partitioning and sorting on frontend
        products = partitionAndSortProducts(products, searchParams.sort);

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

async function fetchFiltersList() {
    try {
        const backendUrl = process.env.BACKEND_API_URL || "http://api.tivaa.in";
        const res = await fetch(`${backendUrl}/api/products/filters-list`, {
            cache: 'no-store'
        });
        if (!res.ok) {
            return [];
        }
        return await res.json();
    } catch (err) {
        console.error("Failed to fetch public filters list:", err);
        return [];
    }
}

async function fetchSettings() {
    try {
        const backendUrl = process.env.BACKEND_API_URL || "http://api.tivaa.in";
        const res = await fetch(`${backendUrl}/api/settings`, { cache: 'no-store', next: { revalidate: 0 } });
        if (res.ok) return await res.json();
    } catch (e) {
        console.error("Failed to fetch settings in products page:", e);
    }
    return {};
}

export default async function ProductsPage({ searchParams }) {
    const resolvedParams = await searchParams || {};
    const category = resolvedParams.category;
    const query = resolvedParams.q;
    const sort = resolvedParams.sort;
    const page = parseInt(resolvedParams.page) || 1;

    const [data, categories, filtersList, settings] = await Promise.all([
        fetchProducts(resolvedParams),
        fetchCategories(),
        fetchFiltersList(),
        fetchSettings()
    ]);
    const showFilters = settings.show_filters_sidebar !== "false";
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
            const sameData = await fetchProducts({ category: sameCatName, page: 1 });
            sameList = sameData.products || [];
        }

        // Loop to find another category containing active products
        let otherList = [];
        const otherCats = showInHomeCats.filter(c => c.name.toLowerCase() !== sameCatName?.toLowerCase());
        let attempts = 0;
        while (otherCats.length > 0 && otherList.length === 0 && attempts < 5) {
            attempts++;
            const randomCat = otherCats[Math.floor(Math.random() * otherCats.length)];
            const otherData = await fetchProducts({ category: randomCat.name, page: 1 });
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
    let selectedCat = null;
    let parentCat = null;
    if (category && Array.isArray(categories)) {
        selectedCat = categories.find(
            c => c.name.trim().toLowerCase() === category.trim().toLowerCase()
        );
        if (selectedCat) {
            displayName = selectedCat.name;
            if (selectedCat.parent_id) {
                parentCat = categories.find(c => Number(c.id) === Number(selectedCat.parent_id));
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
                {/* Breadcrumbs */}
                {category && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <Link href="/" style={{ color: 'var(--text-main)', textDecoration: 'underline' }}>Home</Link>
                        <span>&gt;</span>
                        <Link href="/categories" style={{ color: 'var(--text-main)', textDecoration: 'underline' }}>Categories</Link>
                        <span>&gt;</span>
                        {parentCat && (
                            <>
                                <Link href={`/category/${slugify(parentCat.name)}`} style={{ color: 'var(--text-main)', textDecoration: 'underline' }}>
                                    {parentCat.name}
                                </Link>
                                <span>&gt;</span>
                            </>
                        )}
                        <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{selectedCat ? selectedCat.name : category}</span>
                    </div>
                )}

                <Heading as="h2" variant="HomeHeader2" className="category-page-title" style={{ fontSize: '0.85rem', marginBottom: '12px', textTransform: 'none', letterSpacing: 'normal' }}>
                    {query ? `Search results` : displayName}
                </Heading>
                {!query && selectedCat && (
                    <CategoryDescription 
                        description={selectedCat.description} 
                        style={{ marginBottom: '16px' }} 
                    />
                )}
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
                                    href={`/category/${slugify(cat.name)}`}
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


            </div>

            <section className="container">
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
                                currentCategory={category}
                            />
                        </div>
                    )}

                    {/* Right Column: Products List Grid */}
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
                            <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '60px' }}>
                                {page > 1 && (
                                    <Link
                                        href={`/products?${category ? `category=${encodeURIComponent(category)}&` : ''}${query ? `q=${encodeURIComponent(query)}&` : ''}${sort ? `sort=${sort}&` : ''}page=${page - 1}`}
                                        className="btn btn-secondary pagination-btn-prevnext"
                                        style={{ padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', flexShrink: 0 }}
                                    >
                                        <span className="pagination-text">Prev</span>
                                        <span className="pagination-arrow">←</span>
                                    </Link>
                                )}

                                {paginationPages.map((p, index) => {
                                    if (p === '...') {
                                        return (
                                            <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                                                ...
                                            </span>
                                        );
                                    }
                                    const isActive = p === page;
                                    return (
                                        <Link
                                            key={p}
                                            href={`/products?${category ? `category=${encodeURIComponent(category)}&` : ''}${query ? `q=${encodeURIComponent(query)}&` : ''}${sort ? `sort=${sort}&` : ''}page=${p}`}
                                            className={`pagination-number ${isActive ? 'active' : ''}`}
                                        >
                                            {p}
                                        </Link>
                                    );
                                })}

                                {page < totalPages && (
                                    <Link
                                        href={`/products?${category ? `category=${encodeURIComponent(category)}&` : ''}${query ? `q=${encodeURIComponent(query)}&` : ''}${sort ? `sort=${sort}&` : ''}page=${page + 1}`}
                                        className="btn btn-secondary pagination-btn-prevnext"
                                        style={{ padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', flexShrink: 0 }}
                                    >
                                        <span className="pagination-text">Next</span>
                                        <span className="pagination-arrow">→</span>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {recommendedProducts.length > 0 && (
                <section className="container" style={{ marginTop: '20px', marginBottom: '20px' }}>
                    <RelatedProductsSlider relatedProducts={recommendedProducts} />
                </section>
            )}
            <style dangerouslySetInnerHTML={{ __html: `
                @media (max-width: 768px) {
                    ${!query && category ? `.category-page-title { display: none !important; }` : ''}
                }
                .category-tile-btn:hover {
                    border-color: #0d9488 !important;
                    background-color: #f0fdfa !important;
                    transform: translateY(-1.5px);
                    box-shadow: 0 4px 10px rgba(13, 148, 136, 0.12) !important;
                }
                .pagination-number {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    font-size: 0.9rem;
                    font-weight: 400;
                    text-decoration: none;
                    transition: all 0.2s ease;
                    border: 1px solid #e0e0e0;
                    background: transparent;
                    color: var(--text-main);
                    flex-shrink: 0;
                }
                .pagination-number:hover {
                    border-color: var(--text-main);
                }
                .pagination-number.active {
                    font-weight: 600;
                    border: 1px solid var(--text-main);
                    background: var(--text-main);
                    color: #ffffff;
                }
                .pagination-ellipsis {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    flex-shrink: 0;
                }
                .pagination-arrow {
                    display: none;
                }
                .container {
                    max-width: 1600px !important;
                }
                .products-layout-wrapper {
                    display: flex !important;
                    gap: 32px !important;
                    margin-top: 24px !important;
                }
                .sidebar-column {
                    width: 320px !important;
                    flex-shrink: 0 !important;
                }
                .product-grid-boutique {
                    display: grid !important;
                    grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
                    gap: 20px !important;
                }
                @media (max-width: 1400px) {
                    .product-grid-boutique {
                        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
                    }
                }
                @media (max-width: 992px) {
                    .product-grid-boutique {
                        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                    }
                }
                @media (max-width: 768px) {
                    .products-layout-wrapper {
                        flex-direction: column !important;
                    }
                    .sidebar-column {
                        width: 100% !important;
                    }
                    .product-grid-boutique {
                        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                        gap: 12px !important;
                    }
                }
                @media (max-width: 480px) {
                    .pagination-container {
                        gap: 4px !important;
                        margin-top: 36px !important;
                    }
                    .pagination-number {
                        width: 32px;
                        height: 32px;
                        font-size: 0.75rem;
                    }
                    .pagination-ellipsis {
                        width: 24px;
                        height: 32px;
                        font-size: 0.75rem;
                    }
                    .pagination-text {
                        display: none !important;
                    }
                    .pagination-arrow {
                        display: inline-block !important;
                        font-size: 1rem !important;
                        line-height: 1 !important;
                    }
                    .pagination-btn-prevnext {
                        width: 32px !important;
                        height: 32px !important;
                        padding: 0 !important;
                        display: inline-flex !important;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50% !important;
                    }
                }
            `}} />
        </div>
    );
}
