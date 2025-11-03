import SEOHead from "@/components/SEOHead";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

const FAQ = () => {
  const faqs = [
    {
      question: "What are your shipping options?",
      answer: "We offer free shipping on orders over ₦50,000 within Abuja. Standard shipping takes 1-3 business days. Express shipping is available for next-day delivery at an additional cost."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for all items. Items must be in original condition with tags attached. Fashion items and jewelry can be returned within 14 days for hygienic reasons."
    },
    {
      question: "Do you offer size exchanges?",
      answer: "Yes, we offer free size exchanges within 14 days of purchase. Please bring your receipt and the item in original condition."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept cash, bank transfers, Paystack payments (Visa, Mastercard), and mobile money payments including Opay and PalmPay."
    },
    {
      question: "Do you offer alterations for clothing?",
      answer: "Yes, we offer basic alterations for formal wear and fashion items purchased at our store. Alterations typically take 3-5 business days."
    },
    {
      question: "Can I reserve items online for in-store pickup?",
      answer: "Absolutely! You can place an order online and select 'Store Pickup' at checkout. We'll hold your items for up to 48 hours."
    },
    {
      question: "Do you offer bulk discounts for groceries?",
      answer: "Yes, we offer bulk discounts on household items and groceries for orders over ₦100,000. Contact us for special pricing."
    },
    {
      question: "What are your store hours?",
      answer: "We're open Monday to Sunday from 7:00 AM to 10:00 PM. We're located at Atlantic Mall, 40 Ajose Adeogun Street, Utako, Abuja."
    },
    {
      question: "Do you offer jewelry authentication?",
      answer: "Yes, all our jewelry comes with certificates of authenticity. We also offer appraisal services for items purchased at our store."
    },
    {
      question: "Can I get notifications for new arrivals?",
      answer: "Subscribe to our newsletter to get notifications about new arrivals, weekly specials, and exclusive offers delivered to your inbox."
    }
  ];

  return (
    <>
      <SEOHead
        title="FAQ - Frequently Asked Questions"
        description="Find answers to common questions about shipping, returns, payments, store hours, and services at Ebeth Boutique Atlantic Mall Abuja."
        keywords="FAQ, help, shipping, returns, payment methods, store hours, Atlantic Mall Abuja, customer support"
        canonicalUrl="https://ebeth-boutique.lovable.app/faq"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        }}
      />

      <div className="min-h-screen bg-background">
        <Header />
        
        <main>
          {/* Hero Section */}
          <section className="bg-gradient-primary text-white py-16">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Find answers to common questions about our products, services, and policies
              </p>
            </div>
          </section>

          {/* FAQ Content */}
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-4xl">
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <Accordion type="single" collapsible className="space-y-4">
                    {faqs.map((faq, index) => (
                      <AccordionItem 
                        key={index} 
                        value={`item-${index}`}
                        className="border border-border rounded-lg px-6"
                      >
                        <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary py-6">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-6 text-base leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>

              {/* Contact Section */}
              <div className="mt-12 text-center">
                <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
                <p className="text-muted-foreground mb-6">
                  Can't find what you're looking for? Get in touch with our customer service team.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="tel:09092034816" 
                    className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth"
                  >
                    Call Us: 0909 203 4816
                  </a>
                  <a 
                    href="mailto:hello@ebethboutique.com" 
                    className="inline-flex items-center justify-center px-6 py-3 border border-input rounded-lg hover:bg-accent transition-smooth"
                  >
                    Email Us
                  </a>
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

export default FAQ;