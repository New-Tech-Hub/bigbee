import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "FAQ", href: "/faq" },
    { name: "Size Guide", href: "/contact" },
    { name: "Careers", href: "/contact" },
    { name: "Blog", href: "/" },
  ];

  const policies = [
    { name: "Privacy Policy", href: "/contact" },
    { name: "Terms & Conditions", href: "/contact" },
    { name: "Return Policy", href: "/faq" },
    { name: "Shipping Info", href: "/faq" },
    { name: "Cookie Policy", href: "/contact" },
  ];

  const categories = [
    { name: "Fashion & Clothing", href: "/clothing" },
    { name: "Formal Wear", href: "/clothing" },
    { name: "Accessories", href: "/accessories" },
    { name: "Bags & Luggage", href: "/accessories" },
    { name: "Home & Living", href: "/household" },
    { name: "Weekly Specials", href: "/specials" },
  ];

  const socialLinks = [
    { name: "Facebook", href: "https://www.facebook.com/ebethstores", icon: Facebook, active: true },
    { name: "Instagram", href: "https://www.instagram.com/ebeth_stores/", icon: Instagram, active: true },
    { name: "Twitter", href: "#", icon: Twitter, active: false },
    { name: "YouTube", href: "#", icon: Youtube, active: false },
  ];

  return (
    <footer className="bg-black text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-3 mb-6">
              <img 
                src="/favicon.jpg"
                alt="Ebeth Boutique & Exclusive Store" 
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-bold text-gold">Ebeth Boutique</h3>
                <p className="text-sm text-white/70">& Exclusive Store</p>
              </div>
            </Link>
            
            <p className="text-white/80 mb-6 leading-relaxed">
              Where boutique elegance meets everyday convenience. Discover luxury fashion 
              and quality essentials all in one beautiful destination.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gold" />
                <span className="text-sm text-white/80">0909 203 4816</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gold" />
                <span className="text-sm text-white/80">hello@ebethboutique.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                <div className="text-sm text-white/80">
                  <div className="font-medium">Atlantic Mall</div>
                  <div>40 Ajose Adeogun St, near Peace Mass Park</div>
                  <div>Utako, Abuja 900108, FCT</div>
                  <div className="mt-2 text-xs text-white/60">
                    Hours: Mon-Sun 7:00 AM - 10:00 PM
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-gold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-white/80 hover:text-gold transition-smooth text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop Categories */}
          <div>
            <h4 className="text-lg font-semibold text-gold mb-6">Shop Categories</h4>
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link 
                    to={category.href}
                    className="text-white/80 hover:text-gold transition-smooth text-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies & Social */}
          <div>
            <h4 className="text-lg font-semibold text-gold mb-6">Policies</h4>
            <ul className="space-y-3 mb-8">
              {policies.map((policy) => (
                <li key={policy.name}>
                  <Link 
                    to={policy.href}
                    className="text-white/80 hover:text-gold transition-smooth text-sm"
                  >
                    {policy.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social Media */}
            <h5 className="text-md font-semibold text-gold mb-4">Follow Us</h5>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.active ? social.href : undefined}
                    onClick={(e) => {
                      if (social.active) {
                        e.preventDefault();
                        window.open(social.href, '_blank', 'noopener,noreferrer');
                      } else {
                        e.preventDefault();
                      }
                    }}
                    className={`w-10 h-10 bg-white/10 rounded-full flex items-center justify-center transition-smooth ${
                      social.active ? 'hover:bg-gold hover:text-black cursor-pointer' : 'opacity-40 cursor-not-allowed'
                    }`}
                    aria-label={`${social.name}${social.active ? '' : ' (coming soon)'}`}
                    title={social.active ? `Visit our ${social.name}` : `${social.name} coming soon`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-white/80">
              <span>&copy; {currentYear} Ebeth Boutique & Exclusive Store. All rights reserved.</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-white/80">
              <span>By NewTech Hub Int'l.</span>
            </div>
          </div>

          {/* Security & Trust Badges */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-white/60">
              <span className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>SSL Secured</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Safe Payments</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>30-Day Returns</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>24/7 Support</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;