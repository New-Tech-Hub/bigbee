import { useEffect } from "react";
import { useWishlist } from "@/hooks/useWishlist";
import { useAnalytics } from "@/hooks/useAnalytics";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import SEOHead from "@/components/SEOHead";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturedCategories from "@/components/FeaturedCategories";
import WeeklyDeals from "@/components/WeeklyDeals";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import InstagramFeed from "@/components/InstagramFeed";
import Footer from "@/components/Footer";
import CustomerCare from "@/components/CustomerCare";

const Index = () => {
  const { trackPageView } = useAnalytics();
  usePerformanceMonitor();

  useEffect(() => {
    trackPageView('home');
  }, [trackPageView]);

  return (
    <>
      <SEOHead
        title="Ebeth Boutique & Exclusive Store - Luxury Fashion & Quality Essentials"
        description="Shop premium fashion, accessories, and quality essentials at Ebeth Boutique. Where boutique elegance meets everyday convenience. Free shipping over ₦150,000."
        keywords="boutique fashion, luxury clothing, accessories, household essentials, weekly deals, Nigerian boutique, premium shopping"
        canonicalUrl="https://ebethboutique.com"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Store",
          "name": "Ebeth Boutique & Exclusive Store",
          "description": "Premium fashion and quality essentials boutique",
          "url": "https://ebethboutique.com",
          "telephone": "+234-803-123-4567",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "40 Ajose Adeogun St",
            "addressLocality": "Mabushi",
            "addressRegion": "Abuja",
            "postalCode": "900108",
            "addressCountry": "NG"
          },
          "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "opens": "09:00",
            "closes": "18:00"
          }
        }}
      />

      <div className="min-h-screen bg-background">
        <Header />
        
        <main>
          <HeroSection />
          <FeaturedCategories />
          <WeeklyDeals />
          <Testimonials />
          <Newsletter />
          <InstagramFeed />
        </main>
        
        <Footer />
        <CustomerCare />
      </div>
    </>
  );
};

export default Index;