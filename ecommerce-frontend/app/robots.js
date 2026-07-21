export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tivaa.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/admin/*",
          "/direct-store-sale",
          "/cart",
          "/checkout",
          "/orders/",
          "/profile",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
