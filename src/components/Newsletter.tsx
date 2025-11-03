import { useState } from "react";
import { Mail, Send, Gift, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      toast({
        title: "Successfully Subscribed!",
        description: "Welcome to the Ebeth Boutique family. Check your inbox for exclusive offers!",
      });
      setEmail("");
    }, 500);
  };

  const benefits = [
    {
      icon: Gift,
      title: "Exclusive Offers",
      description: "Get 15% off your first order and access to member-only deals"
    },
    {
      icon: Star,
      title: "Early Access",
      description: "Be the first to shop new arrivals and limited collections"
    },
    {
      icon: Sparkles,
      title: "Weekly Updates",
      description: "Fresh deals, styling tips, and grocery recommendations"
    }
  ];

  if (isSubscribed) {
    return (
      <section className="py-16 bg-gradient-gold">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-black/20 rounded-full mb-6">
              <Mail className="h-10 w-10 text-black" />
            </div>
            <h2 className="text-3xl font-bold text-black mb-4">
              Welcome to Our VIP List!
            </h2>
            <p className="text-lg text-black/80 mb-6">
              Thank you for subscribing! Check your inbox for a special welcome gift and exclusive access to our latest collections.
            </p>
            <Button 
              variant="outline" 
              className="border-2 border-black text-black hover:bg-black hover:text-gold"
              onClick={() => setIsSubscribed(false)}
            >
              Subscribe Another Email
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-gold">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-black/20 rounded-full mb-6">
              <Mail className="h-8 w-8 text-black" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Be the First to Know
            </h2>
            <p className="text-lg text-black/80 max-w-2xl mx-auto">
              Subscribe to our newsletter for exclusive offers, new arrivals, and insider access 
              to the best deals on fashion and groceries
            </p>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-black/20 rounded-full mb-4">
                    <IconComponent className="h-6 w-6 text-black" />
                  </div>
                  <h3 className="font-semibold text-black mb-2">{benefit.title}</h3>
                  <p className="text-sm text-black/70">{benefit.description}</p>
                </div>
              );
            })}
          </div>

          {/* Subscribe Form */}
          <div className="max-w-md mx-auto">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-grow">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/90 border-2 border-transparent focus:border-black text-black placeholder:text-black/60 h-12"
                  required
                />
              </div>
              <Button 
                type="submit"
                variant="outline"
                className="border-2 border-black bg-transparent text-black hover:bg-black hover:text-gold font-semibold h-12 px-6"
              >
                <Send className="mr-2 h-4 w-4" />
                Subscribe
              </Button>
            </form>
            
            <p className="text-xs text-black/60 text-center mt-4">
              By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
            </p>
          </div>

          {/* Special Offer Badge */}
          <div className="text-center mt-8">
            <div className="inline-flex items-center space-x-2 bg-black/20 rounded-full px-6 py-3">
              <Gift className="h-5 w-5 text-black" />
              <span className="font-semibold text-black text-sm">
                New subscribers get 15% off their first order!
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;