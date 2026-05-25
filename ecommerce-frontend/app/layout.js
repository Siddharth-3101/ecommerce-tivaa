import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Script from "next/script";

export const metadata = {
  title: "Tivaa Jewellery",
  description: "A breathtaking shopping experience",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Navbar />
        <main style={{ minHeight: 'calc(100vh - 80px)' }}>
          {children}
        </main>
        <Footer />
        {/* Load Google Identity Services SDK */}
        <Script src="https://accounts.google.com/gsi/client" strategy="lazyOnload" />
      </body>
    </html>
  );
}
