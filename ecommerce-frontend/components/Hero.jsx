import Link from "next/link";

export default function Hero() {
    return (
        <section className="hero-adaptive-container">
            <Link 
                href="/products" 
                className="hero-banner-link"
            >
                <img 
                    src="/hero_banner.png" 
                    alt="Tivaa Elegance - Timeless Beauty, Everyday You" 
                    className="hero-adaptive-img"
                    draggable={false}
                />
            </Link>
        </section>
    );
}
