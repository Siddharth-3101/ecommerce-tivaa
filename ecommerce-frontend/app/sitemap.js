export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tivaa.in";
  const backendUrl = process.env.BACKEND_API_URL || "http://api.tivaa.in";

  // Static customer routes
  const routes = [
    "",
    "/products",
    "/categories",
    "/wishlist",
    "/cart",
    "/checkout",
    "/contact",
    "/faq",
    "/privacy",
    "/terms",
    "/refund-policy",
    "/login",
    "/register",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === "" || route === "/products" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamic products routes
  let productRoutes = [];
  try {
    const res = await fetch(`${backendUrl}/api/products?limit=1000`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const products = Array.isArray(data) ? data : (data.products || []);
      productRoutes = products.map((p) => ({
        url: `${baseUrl}/product/${p.id}`,
        lastModified: p.updated_at ? new Date(p.updated_at).toISOString() : new Date().toISOString(),
        changeFrequency: "weekly",
        priority: 0.7,
      }));
    }
  } catch (err) {
    console.error("Failed to fetch products for sitemap:", err);
  }

  return [...routes, ...productRoutes];
}
