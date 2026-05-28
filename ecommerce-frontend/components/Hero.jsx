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
                padding: '40px 24px 20px', // Bounded padding so it sits elegantly
            }}
        >
            <div 
                style={{
                    maxWidth: '1180px', // Beautifully bounded width so it fits gracefully in the viewport
                    width: '100%',
                    borderRadius: '16px', // Modern premium rounded corners
                    overflow: 'hidden',
                    boxShadow: '0 20px 50px rgba(122, 56, 194, 0.15)', // Premium soft lavender shadow card layout
                    border: '1px solid rgba(234, 220, 248, 0.6)', // Glassmorphic delicate border frame
                    background: '#ffffff',
                    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
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
                            objectFit: 'cover', // High quality visual cropping on wide screens
                            imageRendering: '-webkit-optimize-contrast',
                            transform: 'translateZ(0)',
                        }} 
                    />
                </Link>
            </div>
        </section>
    );
}
