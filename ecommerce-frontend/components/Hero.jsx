import Link from "next/link";

export default function Hero() {
    return (
        <section className="hero">
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: '800px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', marginBottom: '24px', fontSize: '0.9rem', color: 'var(--accent)' }}>
                        <span style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent)' }}></span>
                        New Collection Available
                    </div>

                    <h1 className="hero-title animate-fade-in">
                        Elevate your lifestyle with premium quality.
                    </h1>

                    <p className="hero-subtitle animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        Discover our curated selection of exclusive products designed for those who appreciate the finer things in life. Uncompromising quality meets breathtaking design.
                    </p>

                    <div className="animate-fade-in" style={{ display: "flex", gap: "16px", animationDelay: '0.2s' }}>
                        <Link href="/products" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
                            Explore Collection
                        </Link>
                    </div>
                </div>
            </div>

            {/* Decorative Elements */}
            <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', zIndex: 0 }}></div>
        </section>
    );
}
