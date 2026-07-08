import Link from "next/link";
import HeroSlider from "./HeroSlider";

async function fetchBannerSettings() {
    try {
        const backendUrl = process.env.BACKEND_API_URL || "http://api.tivaa.in";
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

    let slides = [];
    if (settings.hero_slides) {
        try {
            slides = JSON.parse(settings.hero_slides);
        } catch (e) {
            console.error("Failed to parse hero_slides:", e);
        }
    }

    // Fallback if no slides exist
    if (!slides || slides.length === 0) {
        slides = [
            {
                id: "fallback-1",
                desktop_url: settings.desktop_banner || "/hero_banner.png",
                mobile_url: settings.mobile_banner || "/hero_banner_mobile.jpg",
                title: "Discover Everyday Essentials",
                subtitle: "Fashion, Jewellery & More that you'll love",
                link: "/products",
                button_text: "Shop Now"
            }
        ];
    }

    return (
        <section className="hero-adaptive-container" style={{ width: '100%', marginBottom: '40px' }}>
            <HeroSlider slides={slides} />
        </section>
    );
}
