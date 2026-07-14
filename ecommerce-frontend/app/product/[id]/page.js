import ProductDetailsInfo from "@/components/ProductDetailsInfo";
import ProductReviews from "@/components/ProductReviews";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductCard from "@/components/ProductCard";
import ProductTabs from "@/components/ProductTabs";
import RelatedProductsSlider from "@/components/RelatedProductsSlider";
import Link from "next/link";

async function fetchProduct(id) {
    try {
        const backendUrl = process.env.BACKEND_API_URL || "http://api.tivaa.in";
        const res = await fetch(`${backendUrl}/api/products/${id}`, {
            cache: "no-store",
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        return null;
    }
}

async function fetchRelatedProducts(categoryName, currentProductId) {
    try {
        const backendUrl = process.env.BACKEND_API_URL || "http://api.tivaa.in";
        
        // 1. Fetch products from the same category
        let sameCatProducts = [];
        if (categoryName) {
            const sameRes = await fetch(`${backendUrl}/api/products/filter?category=${encodeURIComponent(categoryName)}`, {
                cache: "no-store",
            });
            if (sameRes.ok) {
                const sameList = await sameRes.json();
                sameCatProducts = sameList.filter((p) => p.id !== currentProductId);
            }
        }
        
        // 2. Fetch categories to select a different random category (ensuring it contains products)
        let randomCatProducts = [];
        const catRes = await fetch(`${backendUrl}/api/categories`, {
            cache: "no-store",
        });
        if (catRes.ok) {
            const categories = await catRes.json();
            const homepageCats = Array.isArray(categories) 
                ? categories.filter(c => c.show_in_homepage === 1 || c.show_in_homepage === true)
                : [];
            const pool = homepageCats.length > 0 ? homepageCats : (categories || []);
            
            // Exclude current category name
            const otherCats = pool.filter(c => c.name.toLowerCase() !== categoryName?.toLowerCase());
            
            // Loop to find another category that actually has products
            let attempts = 0;
            while (otherCats.length > 0 && randomCatProducts.length === 0 && attempts < 5) {
                attempts++;
                const randomCat = otherCats[Math.floor(Math.random() * otherCats.length)];
                const diffRes = await fetch(`${backendUrl}/api/products/filter?category=${encodeURIComponent(randomCat.name)}`, {
                    cache: "no-store",
                });
                if (diffRes.ok) {
                    const diffList = await diffRes.json();
                    const filteredDiff = diffList.filter((p) => p.id !== currentProductId);
                    if (filteredDiff.length > 0) {
                        randomCatProducts = filteredDiff;
                        break;
                    }
                }
            }
        }
        
        const shuffle = (arr) => arr.sort(() => 0.5 - Math.random());
        const shuffledSame = shuffle(sameCatProducts);
        const shuffledRandom = shuffle(randomCatProducts);
        
        let chosenSame = shuffledSame.slice(0, 5);
        let chosenRandom = shuffledRandom.slice(0, 5);
        
        // Backfill if one category doesn't have enough products to reach 10 in total
        const totalCount = chosenSame.length + chosenRandom.length;
        if (totalCount < 10) {
            const needed = 10 - totalCount;
            if (chosenSame.length < 5 && shuffledRandom.length > 5) {
                const extraRandom = shuffledRandom.slice(5, 5 + needed);
                chosenRandom = [...chosenRandom, ...extraRandom];
            } else if (chosenRandom.length < 5 && shuffledSame.length > 5) {
                const extraSame = shuffledSame.slice(5, 5 + needed);
                chosenSame = [...chosenSame, ...extraSame];
            }
        }
        
        const combined = shuffle([...chosenSame, ...chosenRandom]);
        return combined.slice(0, 10);
    } catch (err) {
        console.error("Error in fetchRelatedProducts:", err);
        return [];
    }
}

export default async function ProductPage({ params }) {
    const { id } = await params;
    const product = await fetchProduct(id);

    if (!product) {
        return (
            <div className="container" style={{ paddingTop: '140px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '16px', fontWeight: 300 }}>Product not found</h1>
                <p style={{ color: 'var(--text-muted)' }}>The product you are looking for does not exist or has been removed.</p>
                <Link href="/" className="btn btn-black-solid" style={{ marginTop: '24px' }}>Back to Home</Link>
            </div>
        );
    }

    // Parse variations to extract images
    let variationImages = [];
    if (product.variations) {
        try {
            const parsedObj = typeof product.variations === 'string' ? JSON.parse(product.variations) : product.variations;
            if (Array.isArray(parsedObj)) {
                parsedObj.forEach((group) => {
                    if (group.options) {
                        group.options.forEach((opt) => {
                            if (opt.image_url && opt.image_url.trim() && !variationImages.includes(opt.image_url.trim())) {
                                variationImages.push(opt.image_url.trim());
                            }
                        });
                    }
                });
            }
        } catch (e) {
            console.error("Failed to parse variations for image extraction", e);
        }
    }

    const baseImages = product.image_url ? product.image_url.split(',') : [];
    const imagesSet = new Set([...baseImages, ...variationImages].map(img => img.trim()).filter(Boolean));
    const images = Array.from(imagesSet);

    const relatedProducts = await fetchRelatedProducts(product.category_name, product.id);

    // Calculate a mock discount for demo purposes, or derive from price/discounted_price
    let discountBadge = null;
    if (product.discounted_price && product.price > product.discounted_price) {
        const disc = Math.round((1 - (product.discounted_price / product.price)) * 100);
        discountBadge = `-${disc}%`;
    }

    return (
        <div className="animate-fade-in" style={{ padding: '30px 0 0', backgroundColor: '#fff', fontFamily: 'var(--font-poppins), sans-serif' }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                
                {/* Breadcrumbs */}
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <Link href="/" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>Home</Link>
                    <span>&gt;</span>
                    {product.category_name ? (
                        <>
                            <Link href={`/products?category=${encodeURIComponent(product.category_name)}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                                {product.category_name}
                            </Link>
                            <span>&gt;</span>
                        </>
                    ) : null}
                    <span>{product.name}</span>
                </div>

                <div className="product-details-grid" style={{ gap: '48px', alignItems: 'stretch' }}>
                    {/* LEFT SECTION (IMAGE GALLERY) */}
                    <div className="sticky-gallery" style={{ height: '100%' }}>
                        <ProductImageGallery key={`gallery-${product.id}`} images={images} productName={product.name} discount={discountBadge} />
                    </div>

                    {/* RIGHT SECTION (DETAILS WITH DYNAMIC VARIATIONS) */}
                    <div>
                        <ProductDetailsInfo key={`info-${product.id}`} product={product} />
                    </div>
                </div>

                {/* Tabs Section */}
                <ProductTabs description={product.description} features={product.features} />

            {/* Related Products Slider (Client Component) */}
            {relatedProducts && relatedProducts.length > 0 && (
                <RelatedProductsSlider relatedProducts={relatedProducts} categoryName={product.category_name} />
            )}
        </div>

            <style dangerouslySetInnerHTML={{__html: `
                .product-scroll-container::-webkit-scrollbar {
                    display: none;
                }
            `}} />
        </div>
    );
}
