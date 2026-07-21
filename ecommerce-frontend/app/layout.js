import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Script from "next/script";
import StyledJsxRegistry from "./registry";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://tivaa.in"),
  title: {
    default: "TIVAA - Jewellery & School Supplies Online",
    template: "%s | TIVAA"
  },
  description: "Shop premium jewellery, school supplies, kids accessories and everyday essentials online at TIVAA. Quality products with fast delivery across India.",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "TIVAA - Jewellery & School Supplies Online",
    description: "Shop premium jewellery, school supplies, kids accessories and everyday essentials online at TIVAA. Quality products with fast delivery across India.",
    url: "https://tivaa.in",
    siteName: "TIVAA",
    images: [
      {
        url: "/favicon.png",
        width: 1200,
        height: 630,
        alt: "TIVAA Online Store",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TIVAA - Jewellery & School Supplies Online",
    description: "Shop premium jewellery, school supplies, kids accessories and everyday essentials online at TIVAA.",
    images: ["/favicon.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.ico" }
    ],
    apple: "/apple-icon.png"
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
        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-SC9YHSD2VW"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-SC9YHSD2VW');
          `}
        </Script>

        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '875279455295411');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=875279455295411&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

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
