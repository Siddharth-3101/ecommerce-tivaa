import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Script from "next/script";
import StyledJsxRegistry from "./registry";

export const metadata = {
  title: "Tivaa Elegance",
  description: "A breathtaking shopping experience",
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StyledJsxRegistry>
          <Navbar />
          <main style={{ minHeight: 'calc(100vh - 80px)', paddingTop: 'var(--nav-height, 120px)' }}>
            {children}
          </main>
          <Footer />
        </StyledJsxRegistry>
        {/* Load Google Identity Services SDK */}
        <Script src="https://accounts.google.com/gsi/client" strategy="lazyOnload" />
      </body>
    </html>
  );
}
