import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import HomeCategoryGrid from "@/components/HomeCategoryGrid";


export const revalidate = 10;

async function fetchLandingData() {
    const backendUrl = process.env.BACKEND_API_URL || "http://api.tivaa.in";
    
    try {
        const [prodRes, catRes] = await Promise.all([
            fetch(`${backendUrl}/api/products`, { cache: 'no-store' }),
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
            products: products.slice(0, 8), // Show latest 8 products in Newly Added
            categories 
        };
    } catch (err) {
        console.error("Error fetching landing data concurrently:", err);
        return { products: [], categories: [] };
    }
}

export default async function Home() {
    const { products, categories } = await fetchLandingData();



    return (
        <div className="animate-fade-in" style={{ background: 'var(--gradient-bg)', minHeight: '100vh' }}>
            
            {/* Redesigned Wide Hero Banner */}
            <Hero />

            {/* SHOP BY CATEGORY SECTION */}
            <section className="container" style={{ padding: '80px 24px 60px' }}>
                <h2 className="section-heading">Shop by Category</h2>
                <HomeCategoryGrid categories={categories} products={products} />
            </section>

            {/* NEWLY ADDED SECTION */}
            <section className="container" style={{ padding: '20px 24px 100px' }}>
                <h2 className="section-heading">Newly Added</h2>

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
