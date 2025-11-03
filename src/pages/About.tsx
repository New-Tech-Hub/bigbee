import SEOHead from "@/components/SEOHead";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Award, Users, Truck, Shield } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Award,
      title: "Premium Quality",
      description: "We curate only the finest products, from designer fashion,bags,shoes to health supplements, ensuring excellence in every purchase."
    },
    {
      icon: Users,
      title: "Customer First",
      description: "Your satisfaction drives everything we do. Our dedicated team provides personalized service and support."
    },
    {
      icon: Truck,
      title: "Fast Delivery", 
      description: "Quick and reliable delivery service ensures your fashion and store needs are met promptly."
    },
    {
      icon: Shield,
      title: "Trusted Shopping",
      description: "Secure payments, authentic products, and hassle-free returns give you peace of mind with every order."
    }
  ];

  return (
    <>
      <SEOHead
        title="About Ebeth Boutique & Exclusive Store"
        description="Discover Ebeth Boutique's story - Nigeria's premier destination for luxury fashion, designer accessories, and quality essentials. Located at Atlantic Mall Abuja."
        keywords="about ebeth boutique, luxury store nigeria, atlantic mall abuja, fashion boutique story, premium shopping"
        canonicalUrl="https://ebeth-boutique.lovable.app/about"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About Ebeth Boutique",
          "description": "Learn about Ebeth Boutique & Exclusive Store - where luxury fashion meets everyday convenience"
        }}
      />

      <div className="min-h-screen bg-background">
        <Header />
        
        <main>
          {/* Hero Section */}
          <section className="py-16 bg-gradient-elegant">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                  About Ebeth Boutique
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Where boutique elegance meets everyday convenience. We're redefining retail 
                  by bringing together luxury fashion and quality essentials in one beautiful destination.
                </p>
              </div>
            </div>
          </section>

          {/* Our Story */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Founded with a vision to revolutionize shopping, Ebeth Boutique & Exclusive Store 
                      emerged from a simple idea: why should luxury and convenience be mutually exclusive?
                    </p>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Located in the heart of Atlantic Mall, Utako-Abuja, we've created a unique retail 
                      experience where you can discover the latest fashion trends alongside fresh groceries 
                      and household essentials.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Our commitment to quality, service, and innovation has made us a trusted destination 
                      for discerning customers who value both style and substance.
                    </p>
                  </div>
                  <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop"
                      alt="Ebeth Boutique Store Interior"
                      className="rounded-lg shadow-elegant"
                      loading="lazy"
                      decoding="async"
                      width="600"
                      height="400"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Values */}
          <section className="py-16 bg-secondary/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Our Values
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  These core principles guide everything we do and shape the experience we create for our customers
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {values.map((value, index) => {
                  const IconComponent = value.icon;
                  return (
                    <Card key={index} className="p-6 text-center border-0 shadow-card hover:shadow-elegant transition-smooth">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/20 rounded-full mb-4">
                        <IconComponent className="h-8 w-8 text-gold" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Contact Info */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-foreground mb-8">
                  Visit Our Store
                </h2>
                <div className="bg-gradient-gold rounded-2xl p-8 text-black">
                  <h3 className="text-2xl font-bold mb-4">
                    Ebeth Boutique & Exclusive Store
                  </h3>
                  <p className="text-lg mb-2">
                    Atlantic Mall, 40 Ajose Adeogun Street Utako-Abuja
                  </p>
                  <p className="text-lg mb-4">
                    Near Peace Mass Park Utako
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8">
                    <p className="font-semibold">📞 09092034816</p>
                    <p className="font-semibold">✉️ hello@ebethboutique.com</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default About;