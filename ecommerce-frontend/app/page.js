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
                            {categoryProducts.slice(0, 12).map((p) => (
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
