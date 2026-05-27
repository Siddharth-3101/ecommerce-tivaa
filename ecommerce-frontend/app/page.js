import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function fetchLandingData() {
    const backendUrl = process.env.BACKEND_API_URL || "http://api.tivaa.in";
    let products = [];
    let categories = [];
    
    try {
        const prodRes = await fetch(`${backendUrl}/api/products`, { cache: 'no-store' });
        if (prodRes.ok) {
            const data = await prodRes.json();
            products = Array.isArray(data) ? data : (data.products || []);
        }
    } catch (err) {
        console.error("Error fetching products:", err);
    }

    try {
        const catRes = await fetch(`${backendUrl}/api/categories`, { cache: 'no-store' });
        if (catRes.ok) {
            categories = await catRes.json();
        }
    } catch (err) {
        console.error("Error fetching categories:", err);
    }

    return { 
        products: products.slice(0, 8), // Show latest 8 products in Newly Added
        categories 
    };
}

export default async function Home() {
    const { products, categories } = await fetchLandingData();

    // Map each category to a representative image dynamically
    // If a product in that category has an image, we use it!
    const getCategoryImage = (category) => {
        // Fallback curated graphics matching the boutique aesthetic
        const fallbacks = {
            'hairbows': 'https://res.cloudinary.com/dft1i2ozo/image/upload/v1779700729/tivaa-products/dstpoqprasvcizdlox8n.jpg',
            'meenakaari bangles': 'https://res.cloudinary.com/dft1i2ozo/image/upload/v1779700873/tivaa-products/dr1hiyiwgdfhphf4f8cz.jpg',
            'general': '/placeholder.png'
        };
        
        const catNameLower = category.name.trim().toLowerCase();
        
        // Search in fetched products for an image matching this category ID
        const matchedProd = products.find(p => p.category_id === category.id && p.image_url);
        if (matchedProd && matchedProd.image_url) {
            return matchedProd.image_url;
        }

        return fallbacks[catNameLower] || fallbacks['general'];
    };

    return (
        <div className="animate-fade-in" style={{ background: '#ffffff', minHeight: '100vh' }}>
            
            {/* Redesigned Wide Hero Banner */}
            <Hero />

            {/* SHOP BY CATEGORY SECTION */}
            <section className="container" style={{ padding: '80px 24px 60px' }}>
                <h2 
                    style={{ 
                        fontSize: '1.8rem', 
                        fontWeight: 300, 
                        textAlign: 'center', 
                        marginBottom: '40px',
                        textTransform: 'uppercase',
                        letterSpacing: '3px',
                        color: 'var(--text-main)'
                    }}
                >
                    Shop By Category
                </h2>

                <div className="category-container">
                    {categories && categories.length > 0 ? (
                        categories.map((cat) => (
                            <Link 
                                key={cat.id} 
                                href={`/products?category=${encodeURIComponent(cat.name)}`} 
                                className="category-item animate-fade-in"
                            >
                                <div className="category-image-container">
                                    <img 
                                        src={getCategoryImage(cat)} 
                                        alt={cat.name} 
                                        className="category-image"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="category-title">
                                    {cat.name} 
                                    <span style={{ fontSize: '1.1rem', transition: 'transform 0.2s' }}>→</span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div style={{ padding: '40px', background: '#fafafa', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            No categories available at the moment.
                        </div>
                    )}
                </div>
            </section>

            {/* NEWLY ADDED SECTION */}
            <section className="container" style={{ padding: '20px 24px 100px' }}>
                <h2 
                    style={{ 
                        fontSize: '1.8rem', 
                        fontWeight: 300, 
                        textAlign: 'center', 
                        marginBottom: '48px',
                        textTransform: 'uppercase',
                        letterSpacing: '3px',
                        color: 'var(--text-main)'
                    }}
                >
                    Newly Added
                </h2>

                {/* Borderless Boutique Product Card Grid (Fully Responsive) */}
                <div className="product-grid-boutique">
                    {products && products.length > 0 ? (
                        products.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))
                    ) : (
                        <div style={{ padding: '60px', background: '#fafafa', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            No newly added products available at the moment.
                        </div>
                    )}
                </div>

                {/* Centered Solid Black View All Button */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '60px' }}>
                    <Link href="/products" className="btn-black-solid">
                        View all
                    </Link>
                </div>
            </section>
        </div>
    );
}
