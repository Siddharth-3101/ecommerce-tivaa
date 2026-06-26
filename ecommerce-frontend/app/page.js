import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import HomeCategorySelector from "@/components/HomeCategorySelector";

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

    // Map each category to a representative image dynamically
    // If a product in that category has an image, we use it!
    const getCategoryImage = (category) => {
        // Prioritize category's own custom image_url if stored in the database
        if (category.image_url && category.image_url.trim()) {
            return category.image_url.trim();
        }

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
            return matchedProd.image_url.split(",")[0].trim();
        }

        return fallbacks[catNameLower] || fallbacks['general'];
    };

    return (
        <div className="animate-fade-in" style={{ background: 'var(--gradient-bg)', minHeight: '100vh' }}>
            
            {/* Redesigned Wide Hero Banner */}
            <Hero />

            {/* SHOP BY CATEGORY SECTION */}
            <section className="container" style={{ padding: '80px 24px 20px' }}>
                <h2 className="section-heading">Shop by Category</h2>
                <HomeCategorySelector categories={categories} />
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
