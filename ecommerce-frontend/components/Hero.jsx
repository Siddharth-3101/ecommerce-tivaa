import Link from "next/link";

export default function Hero() {
    return (
        <section 
            className="hero-boutique"
            style={{
                position: 'relative',
                width: '100%',
                backgroundColor: '#f9f9f9',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                overflow: 'hidden',
                zIndex: 1
            }}
        >
            <div style={{ padding: '0 24px', zIndex: 2 }}>
                <h1 
                    style={{ 
                        fontSize: 'clamp(2rem, 5.5vw, 4.2rem)', 
                        fontWeight: 300, 
                        color: '#1a1a1a', 
                        marginBottom: '24px',
                        letterSpacing: '2px',
                        lineHeight: 1.2
                    }}
                >
                    Browse our latest products
                </h1>
                
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Link href="/products" className="btn-outline-black">
                        Shop all
                    </Link>
                </div>
            </div>
        </section>
    );
}
