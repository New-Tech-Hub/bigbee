import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import OptimizedImage from "@/components/OptimizedImage";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "/hero-bags-collection.jpg",
      title: "Premium Bags & Travel Collection",
      subtitle: "Luxury traveling bags, elegant women's handbags, and premium luggage for every journey",
      cta: "Shop Bags",
      accent: "Travel Ready",
      href: "/accessories"
    },
    {
      image: "/hero-ankara-native.jpg",
      title: "Celebrate Culture in Style",
      subtitle: "Bold Ankara prints and elegant wrappers for every occasion",
      cta: "Shop Attire",
      accent: "Cultural Elegance",
      href: "/clothing"
    },
    {
      image: "/hero-jewelry-collection.jpg",
      title: "Shine Beyond Measure",
      subtitle: "Elegant pieces that complete your look, day or night",
      cta: "Shop Jewelries",
      accent: "Timeless Beauty",
      href: "/accessories"
    },
    {
      image: "/hero-designer-sunglasses.jpg",
      title: "See the World in Style",
      subtitle: "Trendy designer shades for fashion and protection",
      cta: "Shop Sunglasses",
      accent: "Fashion Forward",
      href: "/accessories"
    },
    {
      image: "/hero-gift-bags.jpg",
      title: "Perfect Wraps for Perfect Moments",
      subtitle: "Stylish gift bags that make every present unforgettable",
      cta: "Shop Gift Bags",
      accent: "Gift Perfect",
      href: "/accessories"
    },
    {
      image: "/hero-bedding-collection.jpg",
      title: "Luxury Comfort for Every Night",
      subtitle: "Soft, premium-quality bedsheets and duvets for restful sleep",
      cta: "Shop Bedding",
      accent: "Sleep Luxury",
      href: "/home-essentials"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Auto-advance slides - increased to 5 seconds for better UX
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[70vh] md:h-[80vh] overflow-hidden bg-gradient-hero">
      {/* Background Images */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <OptimizedImage
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
            priority={index === 0}
            width={1920}
            height={1080}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}

      {/* Content Overlay */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl animate-fade-in">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="h-5 w-5 text-gold animate-pulse" />
            <span className="text-gold font-semibold text-sm tracking-wide uppercase">
              {slides[currentSlide].accent}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {slides[currentSlide].title}
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
            {slides[currentSlide].subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to={slides[currentSlide].href}>
              <Button variant="gold" size="lg" className="text-lg px-8 py-3 h-auto">
                <ShoppingBag className="mr-2 h-5 w-5" />
                {slides[currentSlide].cta}
              </Button>
            </Link>
            <Link to="/specials">
              <Button variant="gold-outline" size="lg" className="text-lg px-8 py-3 h-auto">
                View All Categories
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-smooth"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-smooth"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-smooth ${
                index === currentSlide 
                  ? 'bg-gold shadow-gold' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;