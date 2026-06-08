import ProductDetailsInfo from "@/components/ProductDetailsInfo";
import ProductReviews from "@/components/ProductReviews";
import ProductImageGallery from "@/components/ProductImageGallery";
import Link from "next/link";

async function fetchProduct(id) {
    try {
        const backendUrl = process.env.BACKEND_API_URL || "http://tivaajewelery.us-east-1.elasticbeanstalk.com";
        const res = await fetch(`${backendUrl}/api/products/${id}`, {
            cache: "no-store",
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        return null;
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

    const images = product.image_url ? product.image_url.split(',') : [];

    return (
        <div className="animate-fade-in" style={{ padding: '120px 0 40px' }}>
            <div className="container">
                <Link 
                    href={product.category_name ? `/products?category=${encodeURIComponent(product.category_name)}` : "/products"} 
                    className="btn btn-secondary" 
                    style={{ display: 'inline-flex', padding: '8px 16px', marginBottom: '32px', fontSize: '0.9rem' }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back to collection
                </Link>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "40px",
                        alignItems: "start"
                    }}
                >
                    {/* LEFT SECTION (IMAGE GALLERY) */}
                    <div className="sticky-gallery">
                        <ProductImageGallery images={images} productName={product.name} />
                    </div>

                    {/* RIGHT SECTION (DETAILS WITH DYNAMIC VARIATIONS) */}
                    <ProductDetailsInfo product={product} />
                </div>

                {/* PRODUCT CUSTOMER REVIEWS (Hidden for now as requested) */}
                {/* <ProductReviews productId={product.id} /> */}
            </div>
        </div>
    );
}
