import Link from "next/link";

export const metadata = {
  title: "Page Not Found | TIVAA",
  description: "The page you are looking for doesn't exist. Continue shopping from our latest jewellery and school supplies collections.",
};

export default function NotFound() {
  return (
    <div style={{ padding: "80px 20px", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "3rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "16px" }}>404</h1>
      <h2 style={{ fontSize: "1.4rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "12px" }}>Page Not Found</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "24px", lineHeight: "1.6" }}>
        The page you are looking for doesn't exist or has been moved. Continue shopping from our latest jewellery and school supplies collections.
      </p>
      <Link href="/products" className="btn btn-primary" style={{ padding: "12px 24px" }}>
        Browse Products
      </Link>
    </div>
  );
}
