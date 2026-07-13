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
        if (!categoryName) return [];
        const backendUrl = process.env.BACKEND_API_URL || "http://api.tivaa.in";
        const res = await fetch(`${backendUrl}/api/products/filter?category=${encodeURIComponent(categoryName)}`, {
            cache: "no-store",
        });
        if (!res.ok) return [];
        const products = await res.json();
        // Exclude the current product and take at most 10 items for scrolling
        return products.filter((p) => p.id !== currentProductId).slice(0, 10);
    } catch (err) {
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
