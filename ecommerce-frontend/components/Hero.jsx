import Link from "next/link";

export default function Hero() {
    return (
        <section 
            style={{
                position: 'relative',
                width: '100%',
                backgroundColor: 'transparent',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                zIndex: 1,
                padding: 0, // Cover the page edge-to-edge flush with sides
            }}
        >
            <Link 
                href="/products" 
                style={{ 
                    display: 'block', 
                    width: '100%', 
                    cursor: 'pointer',
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
                        imageRendering: '-webkit-optimize-contrast', // Keep graphics and gold script razor-sharp
                        transform: 'translate3d(0, 0, 0)', // Force GPU rendering to prevent blurring
                    }} 
                />
            </Link>
        </section>
    );
}
