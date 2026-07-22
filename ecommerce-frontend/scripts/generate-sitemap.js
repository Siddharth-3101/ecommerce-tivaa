const fs = require('fs');
const path = require('path');

// Try to read .env file manually
let envUrl = "";
try {
  const envPath = path.join(__dirname, "..", ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/BACKEND_API_URL\s*=\s*(.*)/);
    if (match && match[1]) {
      envUrl = match[1].trim();
    }
  }
} catch (e) {
  // Ignore
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tivaa.in";
const API_URL = process.env.BACKEND_API_URL || envUrl || "https://api.tivaa.in";

function slugify(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function getProductSlug(product) {
  if (!product || !product.id) return "";
  const nameSlug = slugify(product.name || "product");
  return `${nameSlug}-${product.id}`;
}

async function generate() {
  console.log(`Generating static sitemap.xml using API: ${API_URL}...`);

  const staticRoutes = [
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
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // 1. Add static routes
  staticRoutes.forEach((route) => {
    xml += `
  <url>
    <loc>${SITE_URL}${route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route === "" || route === "/products" ? "daily" : "weekly"}</changefreq>
    <priority>${route === "" ? "1.0" : "0.8"}</priority>
  </url>`;
  });

  // 2. Fetch and add category routes
  try {
    const res = await fetch(`${API_URL}/api/categories`);
    if (res.ok) {
      const categories = await res.json();
      categories.forEach((cat) => {
        let routePath = `/category/${slugify(cat.name)}`;
        if (cat.parent_id) {
          const parent = categories.find((c) => c.id === cat.parent_id);
          if (parent) {
            routePath = `/category/${slugify(parent.name)}/${slugify(cat.name)}`;
          }
        }
        xml += `
  <url>
    <loc>${SITE_URL}${routePath}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      });
    }
  } catch (err) {
    console.error("Failed to fetch categories for sitemap generation:", err);
  }

  // 3. Fetch and add product routes
  try {
    const res = await fetch(`${API_URL}/api/products?limit=1000`);
    if (res.ok) {
      const data = await res.json();
      const products = Array.isArray(data) ? data : (data.products || []);
      products.forEach((p) => {
        const productSlug = getProductSlug(p);
        xml += `
  <url>
    <loc>${SITE_URL}/product/${productSlug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      });
    }
  } catch (err) {
    console.error("Failed to fetch products for sitemap generation:", err);
  }

  xml += `
</urlset>`;

  const publicDir = path.join(__dirname, "..", "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), xml, 'utf8');
  console.log("Successfully generated sitemap.xml in public/ directory!");
}

generate();
