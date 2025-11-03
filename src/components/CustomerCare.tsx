import { useState } from "react";
import { MessageCircle, Phone, Mail, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const CustomerCare = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleWhatsAppClick = () => {
    const whatsappNumber = "+2349092034816";
    const message = "Hello! I need assistance with my order from Ebeth Boutique.";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailClick = () => {
    window.location.href = "mailto:support@ebethboutique.com";
  };

  return (
    <>
      {/* Floating Customer Care Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full h-14 w-14 bg-gradient-gold hover:bg-gradient-gold-dark shadow-elegant text-black"
          size="icon"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
      </div>

      {/* Customer Care Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-80">
          <Card className="p-6 shadow-elegant border-0 bg-background">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Need Help?
              </h3>
              <p className="text-sm text-muted-foreground">
                Our customer care team is here to assist you 24/7
              </p>
            </div>

            <div className="space-y-3">
              {/* WhatsApp Support */}
              <Button
                onClick={handleWhatsAppClick}
                variant="outline"
                className="w-full justify-start gap-3 h-12 border-green-500 hover:bg-green-50 hover:border-green-600"
              >
                <MessageCircle className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <div className="font-medium text-green-700">WhatsApp Chat</div>
                  <div className="text-xs text-green-600">Instant Response</div>
                </div>
              </Button>

              {/* Phone Support */}
              <Button
                onClick={() => window.location.href = "tel:+2349092034816"}
                variant="outline"
                className="w-full justify-start gap-3 h-12 border-blue-500 hover:bg-blue-50 hover:border-blue-600"
              >
                <Phone className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium text-blue-700">Call Us</div>
                  <div className="text-xs text-blue-600">+234 909 203 4816</div>
                </div>
              </Button>

              {/* Email Support */}
              <Button
                onClick={handleEmailClick}
                variant="outline"
                className="w-full justify-start gap-3 h-12 border-purple-500 hover:bg-purple-50 hover:border-purple-600"
              >
                <Mail className="h-5 w-5 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium text-purple-700">Email Us</div>
                  <div className="text-xs text-purple-600">support@ebethboutique.com</div>
                </div>
              </Button>

              {/* Business Hours */}
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Business Hours</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Monday - Saturday: 8:00 AM - 10:00 PM</div>
                  <div>Sunday: 10:00 AM - 8:00 PM</div>
                  <div className="mt-2 text-green-600 font-medium">WhatsApp: 24/7 Available</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default CustomerCare;