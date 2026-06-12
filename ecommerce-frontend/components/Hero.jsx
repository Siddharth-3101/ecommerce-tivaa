import Link from "next/link";

async function fetchBannerSettings() {
    try {
        const backendUrl = process.env.BACKEND_API_URL || "http://tivaajewelery.us-east-1.elasticbeanstalk.com";
        const res = await fetch(`${backendUrl}/api/settings`, { cache: 'no-store' });
        if (res.ok) {
            return await res.json();
        }
    } catch (err) {
        console.error("Failed to load banner settings:", err);
    }
    return {};
}

export default async function Hero() {
    const settings = await fetchBannerSettings();

    // Check if the hero banner is explicitly disabled
    if (settings.show_hero_banner === "false") {
        return null;
    }

    const desktopBanner = settings.desktop_banner || "/hero_banner.png";
    const mobileBanner = settings.mobile_banner || "/hero_banner_mobile.jpg";

    return (
        <section className="hero-adaptive-container">
            <Link 
                href="/products" 
                className="hero-banner-link"
            >
                <picture>
                    {/* Mobile: square banner for phones ≤768px */}
                    <source
                        srcSet={mobileBanner}
                        media="(max-width: 768px)"
                    />
                    {/* Desktop: wide banner for everything above 768px */}
                    <img 
                        src={desktopBanner} 
                        alt="Tivaa Elegance - Timeless Beauty, Everyday You" 
                        className="hero-adaptive-img"
                        draggable={false}
                    />
                </picture>
            </Link>
        </section>
    );
}
