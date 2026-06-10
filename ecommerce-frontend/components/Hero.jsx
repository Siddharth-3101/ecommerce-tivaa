import Link from "next/link";

export default function Hero() {
    return (
        <section className="hero-adaptive-container">
            <Link 
                href="/products" 
                className="hero-banner-link"
            >
                <picture>
                    {/* Mobile: square banner for phones ≤768px */}
                    <source
                        srcSet="/hero_banner_mobile.jpg"
                        media="(max-width: 768px)"
                    />
                    {/* Desktop: wide banner for everything above 768px */}
                    <img 
                        src="/hero_banner.png" 
                        alt="Tivaa Elegance - Timeless Beauty, Everyday You" 
                        className="hero-adaptive-img"
                        draggable={false}
                    />
                </picture>
            </Link>
        </section>
    );
}
