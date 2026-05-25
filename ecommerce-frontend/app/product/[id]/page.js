import AddToCartButton from "@/components/AddToCartButton";
import WishlistButton from "@/components/WishlistButton";
import ProductReviews from "@/components/ProductReviews";
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

    if (!product)
        return (
            <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>Product not found</h1>
                <p style={{ color: 'var(--text-muted)' }}>The product you are looking for does not exist or has been removed.</p>
                <Link href="/" className="btn btn-primary" style={{ marginTop: '24px' }}>Back to Home</Link>
            </div>
        );

    return (
        <div className="animate-fade-in" style={{ padding: '120px 0 40px' }}>
            <div className="container">
                <Link href="/products" className="btn btn-secondary" style={{ display: 'inline-flex', padding: '8px 16px', marginBottom: '32px', fontSize: '0.9rem' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back to collection
                </Link>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(300px, 1fr) minmax(300px, 1fr)",
                        gap: "60px",
                        alignItems: "start"
                    }}
                >
                    {/* LEFT SECTION (IMAGE) */}
                    <div style={{ position: 'sticky', top: '100px' }}>
                        <div className="card" style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                            <img
                                src={product.image_url || "/placeholder.png"}
                                alt={product.name}
                                style={{ width: '100%', height: 'auto', borderRadius: '12px', objectFit: 'cover' }}
                            />
                        </div>
                    </div>

                    {/* RIGHT SECTION (DETAILS) */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        <div>
                            <span style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {product.category_name || "Premium Collection"}
                            </span>
                            <h1 style={{ fontSize: '3rem', margin: '12px 0', lineHeight: 1.1 }}>
                                {product.name}
                            </h1>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                    ₹{product.price}
                                </span>
                            </div>
                        </div>

                        <div style={{ height: '1px', background: 'var(--border)' }}></div>

                        <div>
                            <p style={{ color: "var(--text-muted)", fontSize: '1.1rem', lineHeight: 1.8 }}>
                                {product.description || "An absolute masterpiece. Elegantly designed and crafted for perfection. Add this to your collection."}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '16px' }}>
                            <div style={{ flex: '1' }}>
                                <AddToCartButton productId={product.id} disabled={product.stock <= 0} />
                            </div>
                            <div>
                                <WishlistButton productId={product.id} />
                            </div>
                        </div>

                        {product.stock <= 0 ? (
                            <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                <strong>Currently Out of Stock.</strong> Please check back later.
                            </div>
                        ) : (
                            <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.05)', color: 'var(--success)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                <strong>{product.stock} units available.</strong> Order now to secure yours.
                            </div>
                        )}

                        <div className="card" style={{ marginTop: '24px', padding: '24px' }}>
                            <h3 style={{ marginBottom: '16px' }}>Product Features</h3>
                            <ul style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '20px' }}>
                                <li><strong>Premium Quality:</strong> Built with high quality materials.</li>
                                <li><strong>Express Delivery:</strong> Delivered to your door.</li>
                                <li><strong>Secure Warranty:</strong> 30-day return window.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* PRODUCT CUSTOMER REVIEWS */}
                <ProductReviews productId={product.id} />
            </div>
        </div>
    );
}
