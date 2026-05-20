import Link from "next/link";

export default function ProductCard({ product }) {
    return (
        <Link href={`/product/${product.id}`} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none' }}>
            <div className="product-image-container">
                <img
                    src={product.image_url || "/placeholder.png"}
                    className="product-image"
                    alt={product.name}
                    loading="lazy"
                />
                {product.stock === 0 && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(239, 68, 68, 0.9)', color: '#fff', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', fontWeight: 700, backdropFilter: 'blur(4px)' }}>
                        Out of Stock
                    </div>
                )}
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600, color: 'var(--text-main)' }}>
                        {product.name}
                    </h3>
                </div>
                
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.description || "A premium choice for exquisite taste."}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        ₹{product.price}
                    </span>
                    <span style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', transition: 'all 0.2s', border: '1px solid var(--border)' }} className="product-cart-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </span>
                </div>
            </div>
        </Link>
    );
}
