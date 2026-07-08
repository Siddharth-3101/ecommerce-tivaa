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

    const getCategoryAndChildrenIds = (parentId, categoriesList) => {
        const ids = [parentId];
        const children = categoriesList.filter(c => c.parent_id === parentId);
        children.forEach(child => {
            ids.push(...getCategoryAndChildrenIds(child.id, categoriesList));
        });
        return ids;
    };

    const getProductsForParent = (parentId, categoriesList, productsList) => {
        const allowedIds = getCategoryAndChildrenIds(parentId, categoriesList);
        return productsList.filter(p => allowedIds.includes(p.category_id));
    };

    const parents = categories.filter(c => !c.parent_id);

    return (
        <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            
            {/* Redesigned Wide Hero Banner */}
            <Hero />

            {/* DYNAMIC CATEGORY SECTIONS */}
            {parents.map(parent => {
                const parentProducts = getProductsForParent(parent.id, categories, products);
                
                // Only render section if it has products in it
                if (parentProducts.length === 0) return null;

                return (
                    <section key={parent.id} className="container" style={{ padding: '40px 24px 80px' }}>
                        <h2 className="section-heading" style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '32px', fontFamily: 'var(--font-poppins)' }}>
                            {parent.name}
                        </h2>

                        {/* Borderless Boutique Product Card Grid */}
                        <div className="product-grid-boutique">
                            {parentProducts.slice(0, 12).map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                            <Link href={`/products?category=${encodeURIComponent(parent.name)}`} className="btn btn-secondary" style={{ padding: '12px 32px' }}>
                                View all
                            </Link>
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
