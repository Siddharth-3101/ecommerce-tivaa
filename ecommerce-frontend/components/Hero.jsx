import Link from "next/link";

export default function Hero() {
    return (
        <section 
            style={{
                position: 'relative',
                width: '100%',
                backgroundColor: '#FAF8FD',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                zIndex: 1,
                padding: 0,
                borderBottom: '1px solid var(--border)'
            }}
        >
            <Link 
                href="/products" 
                style={{ 
                    display: 'block', 
                    width: '100%', 
                    maxWidth: '1280px', // Prevents over-stretching beyond crisp resolution bounds
                    margin: '0 auto',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    outline: 'none'
                }}
                className="hero-banner-link"
            >
                <img 
                    src="/hero_banner.jpg" 
                    alt="Tivaa Elegance - Timeless Beauty, Everyday You" 
                    style={{ 
                        width: '100%', 
                        height: 'auto', 
                        display: 'block',
                        objectFit: 'contain',
                        imageRendering: '-webkit-optimize-contrast', // High-density screen sharpening
                        transform: 'translateZ(0)', // Force hardware acceleration
                    }} 
                />
            </Link>
        </section>
    );
}
