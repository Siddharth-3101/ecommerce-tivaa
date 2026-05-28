import Link from "next/link";

export default function Hero() {
    return (
        <section className="hero-adaptive-container">
            <Link 
                href="/products" 
                style={{ 
                    display: 'block', 
                    width: '100%', 
                    height: '100%',
                    cursor: 'pointer',
                    outline: 'none'
                }}
                className="hero-banner-link"
            >
                <img 
                    src="/hero_banner.jpg" 
                    alt="Tivaa Elegance - Timeless Beauty, Everyday You" 
                    className="hero-adaptive-img"
                />
            </Link>
        </section>
    );
}
