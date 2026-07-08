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

    const getParentCategoryId = (categoryId, categoriesList) => {
        const cat = categoriesList.find(c => c.id === categoryId);
        if (!cat) return null;
        if (cat.parent_id === null) return cat.id;
        return getParentCategoryId(cat.parent_id, categoriesList);
    };

    const jewelleryProducts = [];
    const schoolSuppliesProducts = [];

    // Fallbacks if category parent link is missing
    const jewelleryKeywords = ["bracelet", "earring", "stud", "cuff", "necklace", "bangle", "charm", "pendant", "jewel", "enamel", "earing"];
    const schoolKeywords = ["hairbow", "clip", "headband", "tie", "bow", "bottle", "lunch", "backpack", "pencil", "kit", "stationery", "school", "supplies"];

    products.forEach(p => {
        const parentId = getParentCategoryId(p.category_id, categories);
        
        if (parentId === 1) {
            jewelleryProducts.push(p);
        } else if (parentId === 3) {
            schoolSuppliesProducts.push(p);
        } else {
            const nameLower = (p.name || "").toLowerCase();
            const catLower = (p.category_name || "").toLowerCase();

            const isJewellery = jewelleryKeywords.some(kw => nameLower.includes(kw) || catLower.includes(kw));
            const isSchool = schoolKeywords.some(kw => nameLower.includes(kw) || catLower.includes(kw));

            if (isJewellery) {
                jewelleryProducts.push(p);
            } else if (isSchool) {
                schoolSuppliesProducts.push(p);
            } else {
                if (p.id % 2 === 0) {
                    jewelleryProducts.push(p);
                } else {
                    schoolSuppliesProducts.push(p);
                }
            }
        }
    });

    return (
        <div className="animate-fade-in" style={{ background: 'var(--gradient-bg)', minHeight: '100vh' }}>
            
            {/* Redesigned Wide Hero Banner */}
            <Hero />

            {/* SHOP BY CATEGORY SECTION */}
            <section className="container" style={{ padding: '80px 24px 60px' }}>
                <h2 className="section-heading">Shop by Category</h2>
                <HomeCategoryGrid categories={categories} products={products} />
            </section>

            {/* JEWELLERY SECTION */}
            <section className="container" style={{ padding: '20px 24px 60px' }}>
                <h2 className="section-heading">Jewellery</h2>

                {/* Borderless Boutique Product Card Grid */}
                <div className="product-grid-boutique">
                    {jewelleryProducts && jewelleryProducts.length > 0 ? (
                        jewelleryProducts.slice(0, 8).map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))
                    ) : (
                        <div style={{ padding: '60px', background: '#fafafa', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            No jewellery products available at the moment.
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                    <Link href="/products?category=Jewellery" className="btn-black-solid">
                        View all
                    </Link>
                </div>
            </section>

            {/* SCHOOL SUPPLIES SECTION */}
            <section className="container" style={{ padding: '20px 24px 100px' }}>
                <h2 className="section-heading">School Supplies</h2>

                {/* Borderless Boutique Product Card Grid */}
                <div className="product-grid-boutique">
                    {schoolSuppliesProducts && schoolSuppliesProducts.length > 0 ? (
                        schoolSuppliesProducts.slice(0, 8).map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))
                    ) : (
                        <div style={{ padding: '60px', background: '#fafafa', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            No school supplies products available at the moment.
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                    <Link href="/products?category=School Supplies %26 Gifts" className="btn-black-solid">
                        View all
                    </Link>
                </div>
            </section>
        </div>
    );
}
