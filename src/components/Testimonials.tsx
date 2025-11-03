import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import OptimizedImage from "@/components/OptimizedImage";

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Zainab Mohammed",
      role: "Working Mom",
      location: "Lagos, Nigeria",
      rating: 5,
      text: "As a busy mom, Ebeth Boutique saves me so much time! I can shop for fashion and household items all in one place. The quality is excellent and delivery is always on time.",
      avatar: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Emeka Okonkwo",
      role: "Engineer", 
      location: "Port Harcourt, Nigeria",
      rating: 5,
      text: "The convenience is unbeatable! I love the wide variety of products - from designer clothes to everyday essentials. Their pricing is very affordable and the weekly deals are fantastic.",
      avatar: "/placeholder.svg"
    },
    {
      id: 3,
      name: "Aminu Bello",
      role: "Entrepreneur",
      location: "Kano, Nigeria", 
      rating: 5,
      text: "Ebeth Boutique offers premium quality products at great prices. Shopping here saves me time and money. The combination of fashion and household items makes it my go-to store.",
      avatar: "/placeholder.svg"
    },
    {
      id: 4,
      name: "Chioma Okafor",
      role: "Student",
      location: "Abuja, Nigeria",
      rating: 5,
      text: "I'm impressed by the quality of products and how affordable everything is! From stylish accessories to household essentials, Ebeth Boutique has it all. The delivery service is excellent too.",
      avatar: "/placeholder.svg"
    },
    {
      id: 5,
      name: "Ademola Adeyemi",
      role: "Banker",
      location: "Ibadan, Nigeria",
      rating: 5,
      text: "The quality and variety at Ebeth Boutique is outstanding. I can get designer fashion and premium household items conveniently. Shopping here is time-efficient and the products always exceed expectations.",
      avatar: "/placeholder.svg"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-advance testimonials
  useEffect(() => {
    const timer = setInterval(nextTestimonial, 7000);
    return () => clearInterval(timer);
  }, []);

  const currentTestimonialData = testimonials[currentTestimonial];

  return (
    <section className="py-16 bg-gradient-elegant">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Customer Love Stories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our amazing customers say about their Ebeth Boutique experience
          </p>
        </div>

        {/* Main Testimonial */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="relative p-8 md:p-12 border-0 shadow-elegant bg-background overflow-hidden">
            <div className="absolute top-4 right-4 opacity-10">
              <Quote className="h-20 w-20 text-gold" />
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <OptimizedImage
                    src={currentTestimonialData.avatar}
                    alt={currentTestimonialData.name}
                    className="w-20 h-20 rounded-full object-cover shadow-card"
                    width={80}
                    height={80}
                  />
                </div>

                {/* Content */}
                <div className="flex-grow text-center md:text-left">
                  {/* Rating */}
                  <div className="flex justify-center md:justify-start items-center space-x-1 mb-4">
                    {[...Array(currentTestimonialData.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-gold fill-gold" />
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <blockquote className="text-lg md:text-xl text-foreground mb-6 italic leading-relaxed">
                    "{currentTestimonialData.text}"
                  </blockquote>

                  {/* Author Info */}
                  <div>
                    <h4 className="font-semibold text-foreground text-lg">
                      {currentTestimonialData.name}
                    </h4>
                    <p className="text-muted-foreground">
                      {currentTestimonialData.role} • {currentTestimonialData.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex justify-center items-center space-x-4 mt-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevTestimonial}
              className="rounded-full bg-secondary hover:bg-gold hover:text-black transition-smooth"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Indicators */}
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-smooth ${
                    index === currentTestimonial 
                      ? 'bg-gold' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={nextTestimonial}
              className="rounded-full bg-secondary hover:bg-gold hover:text-black transition-smooth"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Customer Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-gold mb-2">50k+</div>
            <div className="text-muted-foreground">Happy Customers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gold mb-2">4.9★</div>
            <div className="text-muted-foreground">Average Rating</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gold mb-2">98%</div>
            <div className="text-muted-foreground">Satisfaction Rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gold mb-2">24/7</div>
            <div className="text-muted-foreground">Customer Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;