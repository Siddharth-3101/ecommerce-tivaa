import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import HomeCategoryGrid from "@/components/HomeCategoryGrid";


export const revalidate = 10;

async function fetchLandingData() {
    const backendUrl = process.env.BACKEND_API_URL || "http://api.tivaa.in";
    
    try {
        const [prodRes, catRes] = await Promise.all([
            fetch(`${backendUrl}/api/products?limit=1000`, { cache: 'no-store' }),
            fetch(`${backendUrl}/api/categories`, { cache: 'no-store' })
        ]);

        let products = [];
        let categories = [];

        if (prodRes.ok) {
            const data = await prodRes.json();
            products = Array.isArray(data) ? data : (data.products || []);
        }

        if (catRes.ok) {
            categories = await catRes.json();
        }

        return { 
            products: products, 
            categories 
        };
    } catch (err) {
        console.error("Error fetching landing data concurrently:", err);
        return { products: [], categories: [] };
    }
}

export default async function Home() {
    const { products, categories } = await fetchLandingData();

    // Get all categories that contain at least one product directly
    const activeCategories = categories.filter(cat => 
        products.some(p => p.category_id === cat.id)
    );

    return (
        <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            
            {/* Redesigned Wide Hero Banner */}
            <Hero />

            {/* Two Promo Banners */}
            <section className="container" style={{ padding: '0 24px 40px' }}>
                <div className="promo-banners-grid">
                    {/* Banner 1: School Supplies */}
                    <Link href="/products?category=School Supplies %26 Gifts" style={{ textDecoration: 'none' }}>
                        <div className="promo-banner-card" style={{ background: '#E6F4F2', borderRadius: '18px', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '220px', overflow: 'hidden', cursor: 'pointer', border: '1px solid var(--border)' }}>
                            <div style={{ flex: 1, zIndex: 2, paddingRight: '12px' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px 0', fontFamily: 'var(--font-poppins)' }}>School Supplies</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 20px 0', fontFamily: 'var(--font-poppins)', lineHeight: '1.4' }}>Everything kids need for school</p>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--font-poppins)' }}>Shop Now</span>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                                        <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '0.95rem' }}>→</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <img 
                                    src="https://res.cloudinary.com/dft1i2ozo/image/upload/v1779700729/tivaa-products/dstpoqprasvcizdlox8n.jpg" 
                                    alt="School Supplies" 
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '12px' }} 
                                />
                            </div>
                        </div>
                    </Link>

                    {/* Banner 2: Fashion & Jewellery */}
                    <Link href="/products?category=Jewellery" style={{ textDecoration: 'none' }}>
                        <div className="promo-banner-card" style={{ background: '#FAF5EC', borderRadius: '18px', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '220px', overflow: 'hidden', cursor: 'pointer', border: '1px solid var(--border)' }}>
                            <div style={{ flex: 1, zIndex: 2, paddingRight: '12px' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px 0', fontFamily: 'var(--font-poppins)' }}>Fashion & Jewellery</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 20px 0', fontFamily: 'var(--font-poppins)', lineHeight: '1.4' }}>Elevate your everyday style</p>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--font-poppins)' }}>Shop Now</span>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                                        <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '0.95rem' }}>→</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <img 
                                    src="https://res.cloudinary.com/dft1i2ozo/image/upload/v1779700873/tivaa-products/dr1hiyiwgdfhphf4f8cz.jpg" 
                                    alt="Fashion & Jewellery" 
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '12px' }} 
                                />
                            </div>
                        </div>
                    </Link>
                </div>
            </section>

            {/* DYNAMIC CATEGORY SECTIONS */}
            {activeCategories.map(category => {
                const categoryProducts = products.filter(p => p.category_id === category.id);

                return (
                    <section key={category.id} className="container" style={{ padding: '40px 24px 80px' }}>
                        <h2 className="section-heading" style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '32px', fontFamily: 'var(--font-poppins)' }}>
                            {category.name}
                        </h2>

                        {/* Borderless Boutique Product Card Grid */}
                        <div className="product-grid-boutique">
                            {categoryProducts.slice(0, 18).map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                            <Link href={`/products?category=${encodeURIComponent(category.name)}`} className="btn btn-secondary" style={{ padding: '12px 32px' }}>
                                View all
                            </Link>
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
