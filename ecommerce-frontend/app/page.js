import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

async function fetchSampleProducts() {
    try {
        const res = await fetch("http://localhost:5000/api/products", {
            cache: 'no-store'
        });

        if (!res.ok) {
            return { products: [] };
        }

        const data = await res.json();
        return Array.isArray(data) ? { products: data.slice(0, 4) } : { products: (data.products || []).slice(0, 4) };
    } catch (err) {
        return { products: [] };
    }
}

export default async function Home() {
    const data = await fetchSampleProducts();

    return (
        <div className="animate-fade-in">
            <Hero />

            {/* Basic Company Details / About Section */}
            <section className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '24px', letterSpacing: '-0.5px' }}>
                        Welcome to PremiumShop
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: 1.8, marginBottom: '32px' }}>
                        We are passionate creators and curators of exquisite jewelry.
                        Every piece in our collection is carefully crafted with the highest quality materials
                        to ensure perfection in every detail. With over a decade of excellence, we specialize in timeless
                        masterpieces that embody elegance, luxury, and sophistication.
                    </p>
                    <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'center', flex: 1, minWidth: '150px' }}>
                            <h4 style={{ fontSize: '2rem', color: 'var(--accent)', margin: '0 0 8px' }}>10+</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Years of Excellence</p>
                        </div>
                        <div style={{ width: '1px', background: 'var(--border)' }}></div>
                        <div style={{ textAlign: 'center', flex: 1, minWidth: '150px' }}>
                            <h4 style={{ fontSize: '2rem', color: 'var(--accent)', margin: '0 0 8px' }}>100%</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Pure Materials</p>
                        </div>
                        <div style={{ width: '1px', background: 'var(--border)' }}></div>
                        <div style={{ textAlign: 'center', flex: 1, minWidth: '150px' }}>
                            <h4 style={{ fontSize: '2rem', color: 'var(--accent)', margin: '0 0 8px' }}>Lifetime</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Craftsmanship Warranty</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sample Products Section */}
            <section className="container" style={{ paddingBottom: '100px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                    <div>
                        <h2 style={{ fontSize: '2.2rem', margin: '0 0 8px 0' }}>Featured Collections</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>Discover a glimpse of our most exquisite artifacts.</p>
                    </div>
                    <Link href="/products" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                        View All Collections
                    </Link>
                </div>

                <div className="grid">
                    {data.products && data.products.length > 0 ? (
                        data.products.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))
                    ) : (
                        <div style={{ padding: '60px', background: 'var(--bg-card)', borderRadius: '16px', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No sample products currently available.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
