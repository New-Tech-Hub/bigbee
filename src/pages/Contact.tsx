import SEOHead from "@/components/SEOHead";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import StoreMap from "@/components/StoreMap";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { sanitizeInput, isValidEmail } from "@/utils/sanitize";

// Contact form validation schema
const contactSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .refine((val) => /^[a-zA-Z\s'-]+$/.test(sanitizeInput(val)), {
      message: "Name can only contain letters, spaces, hyphens, and apostrophes"
    }),
  email: z.string()
    .min(1, "Email is required")
    .max(254, "Email must be less than 254 characters")
    .refine((val) => isValidEmail(val), {
      message: "Please enter a valid email address"
    }),
  subject: z.string()
    .min(1, "Subject is required")
    .max(200, "Subject must be less than 200 characters"),
  message: z.string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be less than 2000 characters")
});

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    try {
      const sanitizedData = {
        name: sanitizeInput(formData.name),
        email: sanitizeInput(formData.email),
        subject: sanitizeInput(formData.subject),
        message: sanitizeInput(formData.message)
      };

      contactSchema.parse(sanitizedData);
      
      // Clear any previous errors
      setErrors({});
      
      // TODO: In production, send to backend/email service
      // For now, simulate form submission
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you within 24 hours.",
      });
      
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        
        toast({
          title: "Validation Error",
          description: "Please check the form for errors.",
          variant: "destructive"
        });
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Our Store",
      details: ["Atlantic Mall, 40 Ajose Adeogun Street", "Utako-Abuja", "Near Peace Mass Park Utako"]
    },
    {
      icon: Phone,
      title: "Call Us",
      details: ["09092034816", "Available during store hours"]
    },
    {
      icon: Mail,
      title: "Email Us", 
      details: ["hello@ebethboutique.com", "Customer support available 24/7"]
    },
    {
      icon: Clock,
      title: "Store Hours",
      details: ["Monday - Saturday: 9:00 AM - 9:00 PM", "Sunday: 11:00 AM - 7:00 PM"]
    }
  ];

  return (
    <>
      <SEOHead
        title="Contact Ebeth Boutique & Exclusive Store"
        description="Contact Ebeth Boutique at Atlantic Mall, Utako-Abuja. Call 09092034816 or email us for customer support. Store hours: Mon-Sat 9AM-9PM."
        keywords="contact ebeth boutique, atlantic mall abuja, utako store location, customer support nigeria, ebeth phone number"
        canonicalUrl="https://ebeth-boutique.lovable.app/contact"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Contact Ebeth Boutique",
          "description": "Get in touch with Ebeth Boutique & Exclusive Store"
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
                  Contact Us
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  We'd love to hear from you. Get in touch with our team for any questions, 
                  feedback, or assistance you may need.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  return (
                    <Card key={index} className="p-6 text-center border-0 shadow-card hover:shadow-elegant transition-smooth">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/20 rounded-full mb-4">
                        <IconComponent className="h-8 w-8 text-gold" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        {info.title}
                      </h3>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-muted-foreground mb-1">
                          {detail}
                        </p>
                      ))}
                    </Card>
                  );
                })}
              </div>

              {/* Store Location Map */}
              <div className="max-w-6xl mx-auto mb-16">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    Find Our Store
                  </h2>
                  <p className="text-muted-foreground">
                    Visit us at Atlantic Mall, Utako-Abuja for an exclusive shopping experience
                  </p>
                </div>
                <StoreMap />
              </div>

              {/* Contact Form */}
              <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-start">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-6">
                      Send Us a Message
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      Have a question or feedback? We'd love to hear from you. 
                      Fill out the form and we'll get back to you as soon as possible.
                    </p>
                    
                    <Card className="p-6 bg-gradient-gold">
                      <h3 className="text-xl font-bold text-black mb-4">
                        Quick Response Guarantee
                      </h3>
                      <p className="text-black/80">
                        We respond to all inquiries within 24 hours during business days. 
                        For urgent matters, please call us directly.
                      </p>
                    </Card>
                  </div>

                  <Card className="p-8 border-0 shadow-elegant">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Full Name *
                          </label>
                          <Input
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            placeholder="Your full name"
                            required
                            className={errors.name ? "border-destructive" : ""}
                          />
                          {errors.name && (
                            <p className="text-sm text-destructive mt-1">{errors.name}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Email Address *
                          </label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            placeholder="your.email@example.com"
                            required
                            className={errors.email ? "border-destructive" : ""}
                          />
                          {errors.email && (
                            <p className="text-sm text-destructive mt-1">{errors.email}</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Subject *
                        </label>
                        <Input
                          value={formData.subject}
                          onChange={(e) => handleInputChange("subject", e.target.value)}
                          placeholder="What is this regarding?"
                          required
                          className={errors.subject ? "border-destructive" : ""}
                        />
                        {errors.subject && (
                          <p className="text-sm text-destructive mt-1">{errors.subject}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          Message *
                        </label>
                        <Textarea
                          value={formData.message}
                          onChange={(e) => handleInputChange("message", e.target.value)}
                          placeholder="Tell us how we can help you..."
                          rows={5}
                          required
                          className={errors.message ? "border-destructive" : ""}
                        />
                        {errors.message && (
                          <p className="text-sm text-destructive mt-1">{errors.message}</p>
                        )}
                      </div>
                      
                      <Button type="submit" className="w-full" size="lg">
                        Send Message
                      </Button>
                    </form>
                  </Card>
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

export default Contact;