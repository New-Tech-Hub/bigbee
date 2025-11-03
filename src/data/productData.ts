// Comprehensive product data for all categories
// Product-specific image imports
import businessSuitCharcoal from "@/assets/products/business-suit-charcoal.jpg";
import executiveDressShirt from "@/assets/products/executive-dress-shirt.jpg";
import corporatePoloNavy from "@/assets/products/corporate-polo-navy.jpg";
import cottonSingletWhite from "@/assets/products/cotton-singlet-white.jpg";
import cocktailDressBlack from "@/assets/products/cocktail-dress-black.jpg";
import professionalBlazerNavy from "@/assets/products/professional-blazer-navy.jpg";
import denimJeansSlim from "@/assets/products/denim-jeans-slim.jpg";
import designerTshirtCotton from "@/assets/products/designer-tshirt-cotton.jpg";
import silkBlouseIvory from "@/assets/products/silk-blouse-ivory.jpg";
import diamondTennisBracelet from "@/assets/products/diamond-tennis-bracelet.jpg";
import goldPlatedWatch from "@/assets/products/gold-plated-watch.jpg";
import coralHandBeads from "@/assets/products/coral-hand-beads.jpg";
import leatherBeltBrown from "@/assets/products/leather-belt-brown.jpg";
import designerSlippers from "@/assets/products/designer-slippers.jpg";
import palmSandals from "@/assets/products/palm-sandals.jpg";
import titaniumEyeglasses from "@/assets/products/titanium-eyeglasses.jpg";
import luxurySunglasses from "@/assets/products/luxury-sunglasses.jpg";
import designerPerfume from "@/assets/products/designer-perfume.jpg";
import makeupKitProfessional from "@/assets/products/makeup-kit-professional.jpg";
import ceramicCoffeeMugs from "@/assets/products/ceramic-coffee-mugs.jpg";
import kitchenKnifeSet from "@/assets/products/kitchen-knife-set.jpg";
import cookwareSetSteel from "@/assets/products/cookware-set-steel.jpg";
import egyptianCottonTowels from "@/assets/products/egyptian-cotton-towels.jpg";
import ceramicVaseDecor from "@/assets/products/ceramic-vase-decor.jpg";
import luxuryGiftHamper from "@/assets/products/luxury-gift-hamper.jpg";

// Additional product-specific image imports
import designerPoloWhite from "@/assets/products/designer-polo-white.jpg";
import premiumChinosKhaki from "@/assets/products/premium-chinos-khaki.jpg";
import womensOfficeShirtWhite from "@/assets/products/womens-office-shirt-white.jpg";
import cottonSingletBlackPack from "@/assets/products/cotton-singlet-black-pack.jpg";
import casualSummerDressFloral from "@/assets/products/casual-summer-dress-floral.jpg";
import luxuryTeaCupSet from "@/assets/products/luxury-tea-cup-set.jpg";
import electricKitchenScale from "@/assets/products/electric-kitchen-scale.jpg";
import luxuryBathTowelsWhite from "@/assets/products/luxury-bath-towels-white.jpg";
import premiumHandTowelsSet from "@/assets/products/premium-hand-towels-set.jpg";
import scentedCandlesLuxurySet from "@/assets/products/scented-candles-luxury-set.jpg";
import silkTieExecutive from "@/assets/products/silk-tie-executive.jpg";
import romanticGiftSetValentines from "@/assets/products/romantic-gift-set-valentines.jpg";
import corporateGiftPackage from "@/assets/products/corporate-gift-package.jpg";
import birthdaySurpriseBox from "@/assets/products/birthday-surprise-box.jpg";
import weekendFlashDealBundle from "@/assets/products/weekend-flash-deal-bundle.jpg";
import clearanceFashionItems from "@/assets/products/clearance-fashion-items.jpg";

// Existing asset imports for specific categories
import designerHandbagsCollection from "@/assets/designer-handbags-collection.jpg";
import blackProfessionalLuggage from "@/assets/black-professional-luggage.jpg";
import redHardshellLuggage from "@/assets/red-hardshell-luggage.jpg";
import oliveLuggageSet from "@/assets/olive-luggage-set.jpg";
import heroAfricanCollection from "@/assets/hero-african-collection.jpg";
import luggageBlackProfessionalSet from "@/assets/luggage-black-professional-set.jpg";
import luggageGoldenYellow from "@/assets/luggage-golden-yellow.jpg";
import luggageCardinalRed from "@/assets/luggage-cardinal-red.jpg";
import luggageMulticolorSet from "@/assets/luggage-multicolor-set.jpg";
import luggageBlackCarryOn from "@/assets/luggage-black-carry-on.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
}

export const productData = {
  clothing: [
    // Men's Corporate Wear
    {
      id: "c1",
      name: "Premium Business Suit - Charcoal Grey",
      price: 45999.99,
      originalPrice: 52999.99,
      image: businessSuitCharcoal,
      rating: 4.9,
      reviews: 189,
      category: "Men's Corporate"
    },
    {
      id: "c2", 
      name: "Executive Dress Shirt - Egyptian Cotton",
      price: 8999.99,
      originalPrice: 12999.99,
      image: executiveDressShirt,
      rating: 4.8,
      reviews: 267,
      category: "Men's Shirts"
    },
    {
      id: "c3",
      name: "Corporate Polo Shirt - Navy Blue",
      price: 5999.99,
      originalPrice: 7999.99,
      image: corporatePoloNavy,
      rating: 4.6,
      reviews: 145,
      category: "Men's Casual"
    },
    {
      id: "c4",
      name: "Premium Cotton Singlet - 3 Pack",
      price: 3999.99,
      originalPrice: 5999.99,
      image: cottonSingletWhite,
      rating: 4.7,
      reviews: 298,
      category: "Men's Undergarments"
    },
    {
      id: "c5",
      name: "Elegant Cocktail Dress - Black",
      price: 15999.99,
      originalPrice: 22999.99,
      image: cocktailDressBlack,
      rating: 4.7,
      reviews: 198,
      category: "Women's Formal"
    },
    {
      id: "c6",
      name: "Professional Blazer - Navy Blue",
      price: 25999.99,
      originalPrice: 32999.99,
      image: professionalBlazerNavy,
      rating: 4.6,
      reviews: 145,
      category: "Women's Corporate"
    },
    {
      id: "c7",
      name: "Casual Denim Jeans - Slim Fit",
      price: 12999.99,
      originalPrice: 16999.99,
      image: denimJeansSlim,
      rating: 4.8,
      reviews: 356,
      category: "Casual Wear"
    },
    {
      id: "c8",
      name: "Designer T-Shirt - Premium Cotton",
      price: 6999.99,
      originalPrice: 9999.99,
      image: designerTshirtCotton,
      rating: 4.5,
      reviews: 287,
      category: "Casual Wear"
    },
    {
      id: "c9",
      name: "Luxury Silk Blouse - Ivory",
      price: 18999.99,
      originalPrice: 24999.99,
      image: silkBlouseIvory,
      rating: 4.8,
      reviews: 156,
      category: "Women's Corporate"
    },
    {
      id: "c10",
      name: "Designer Polo Shirt - White",
      price: 7999.99,
      originalPrice: 11999.99,
      image: designerPoloWhite,
      rating: 4.6,
      reviews: 203,
      category: "Men's Casual"
    },
    {
      id: "c11",
      name: "Premium Chinos - Khaki",
      price: 9999.99,
      originalPrice: 14999.99,
      image: premiumChinosKhaki,
      rating: 4.7,
      reviews: 189,
      category: "Men's Casual"
    },
    {
      id: "c12",
      name: "Women's Office Shirt - White",
      price: 6999.99,
      originalPrice: 9999.99,
      image: womensOfficeShirtWhite,
      rating: 4.5,
      reviews: 167,
      category: "Women's Corporate"
    },
    {
      id: "c13",
      name: "Cotton Singlet - Black 3-Pack",
      price: 4999.99,
      originalPrice: 7999.99,
      image: cottonSingletBlackPack,
      rating: 4.6,
      reviews: 234,
      category: "Men's Undergarments"
    },
    {
      id: "c14",
      name: "Casual Summer Dress - Floral",
      price: 11999.99,
      originalPrice: 17999.99,
      image: casualSummerDressFloral,
      rating: 4.8,
      reviews: 298,
      category: "Women's Casual"
    }
  ],

  accessories: [
    // Bags
    {
      id: "a1",
      name: "Women's Leather Handbag - Premium",
      price: 35999.99,
      originalPrice: 45999.99,
      image: designerHandbagsCollection,
      rating: 4.9,
      reviews: 245,
      category: "Women's Bags"
    },
    {
      id: "a2",
      name: "Men's Business Briefcase - Black Leather",
      price: 42999.99,
      originalPrice: 56999.99,
      image: blackProfessionalLuggage,
      rating: 4.8,
      reviews: 167,
      category: "Men's Bags"
    },
    {
      id: "a3",
      name: "Professional Luggage Set - Black (3-Piece)",
      price: 89999.99,
      originalPrice: 125999.99,
      image: luggageBlackProfessionalSet,
      rating: 4.9,
      reviews: 312,
      category: "Traveling Bags"
    },
    {
      id: "a4",
      name: "Premium Hardshell Luggage - Golden Yellow",
      price: 34999.99,
      originalPrice: 49999.99,
      image: luggageGoldenYellow,
      rating: 4.8,
      reviews: 189,
      category: "Traveling Bags"
    },
    {
      id: "a17",
      name: "Luxury Hardshell Luggage - Cardinal Red",
      price: 36999.99,
      originalPrice: 52999.99,
      image: luggageCardinalRed,
      rating: 4.9,
      reviews: 234,
      category: "Traveling Bags"
    },
    {
      id: "a18",
      name: "Colorful Travel Luggage Set - Multi-Color",
      price: 79999.99,
      originalPrice: 109999.99,
      image: luggageMulticolorSet,
      rating: 4.7,
      reviews: 178,
      category: "Traveling Bags"
    },
    {
      id: "a19",
      name: "Business Carry-On Luggage - Black",
      price: 24999.99,
      originalPrice: 35999.99,
      image: luggageBlackCarryOn,
      rating: 4.8,
      reviews: 267,
      category: "Traveling Bags"
    },
    // Jewelry & Watches
    {
      id: "a5",
      name: "Diamond Tennis Bracelet",
      price: 89999.99,
      originalPrice: 125999.99,
      image: diamondTennisBracelet,
      rating: 4.9,
      reviews: 78,
      category: "Jewelry"
    },
    {
      id: "a6",
      name: "Gold-Plated Wrist Watch - Unisex",
      price: 25999.99,
      originalPrice: 35999.99,
      image: goldPlatedWatch,
      rating: 4.8,
      reviews: 234,
      category: "Wrist Watches"
    },
    {
      id: "a7",
      name: "Traditional Hand Beads - Coral",
      price: 8999.99,
      originalPrice: 12999.99,
      image: coralHandBeads,
      rating: 4.7,
      reviews: 167,
      category: "Hand & Waist Beads"
    },
    {
      id: "a8",
      name: "African Waist Beads - Multicolor",
      price: 6999.99,
      originalPrice: 9999.99,
      image: heroAfricanCollection,
      rating: 4.6,
      reviews: 198,
      category: "Hand & Waist Beads"
    },
    // Belts & Footwear
    {
      id: "a9",
      name: "Genuine Leather Belt - Brown",
      price: 7999.99,
      originalPrice: 12999.99,
      image: leatherBeltBrown,
      rating: 4.7,
      reviews: 289,
      category: "Belts"
    },
    {
      id: "a10",
      name: "Designer Slippers - Comfort Sole",
      price: 5999.99,
      originalPrice: 8999.99,
      image: designerSlippers,
      rating: 4.5,
      reviews: 345,
      category: "Slippers"
    },
    {
      id: "a11",
      name: "Palm Sandals - Handwoven",
      price: 4999.99,
      originalPrice: 7999.99,
      image: palmSandals,
      rating: 4.6,
      reviews: 234,
      category: "Palm Sandals"
    },
    {
      id: "a12",
      name: "Silk Tie - Executive Pattern",
      price: 3999.99,
      originalPrice: 6999.99,
      image: silkTieExecutive,
      rating: 4.8,
      reviews: 156,
      category: "Ties"
    },
    // Eyewear
    {
      id: "a13",
      name: "Designer Eyeglasses - Titanium Frame",
      price: 15999.99,
      originalPrice: 22999.99,
      image: titaniumEyeglasses,
      rating: 4.9,
      reviews: 123,
      category: "Designer Eyeglasses"
    },
    {
      id: "a14",
      name: "Luxury Sunglasses - Polarized",
      price: 12999.99,
      originalPrice: 18999.99,
      image: luxurySunglasses,
      rating: 4.7,
      reviews: 267,
      category: "Sunshades"
    },
    // Perfumes & Cosmetics
    {
      id: "a15",
      name: "Designer Perfume - Luxury Collection",
      price: 18999.99,
      originalPrice: 26999.99,
      image: designerPerfume,
      rating: 4.8,
      reviews: 189,
      category: "Designer Perfumes"
    },
    {
      id: "a16",
      name: "Professional Makeup Kit - Complete",
      price: 22999.99,
      originalPrice: 32999.99,
      image: makeupKitProfessional,
      rating: 4.9,
      reviews: 145,
      category: "Makeup Kits"
    }
  ],

  household: [
    // Kitchen & Dining
    {
      id: "h1",
      name: "Designer Coffee Mug Set - Ceramic",
      price: 8999.99,
      originalPrice: 12999.99,
      image: ceramicCoffeeMugs,
      rating: 4.8,
      reviews: 189,
      category: "Expensive Cups"
    },
    {
      id: "h2",
      name: "Premium Kitchen Knife Set",
      price: 15999.99,
      originalPrice: 22999.99,
      image: kitchenKnifeSet,
      rating: 4.9,
      reviews: 145,
      category: "Kitchen Accessories"
    },
    {
      id: "h3",
      name: "Stainless Steel Cookware Set",
      price: 25999.99,
      originalPrice: 35999.99,
      image: cookwareSetSteel,
      rating: 4.7,
      reviews: 234,
      category: "Kitchen Accessories"
    },
    {
      id: "h4",
      name: "Luxury Tea Cup Set - Porcelain",
      price: 12999.99,
      originalPrice: 18999.99,
      image: luxuryTeaCupSet,
      rating: 4.8,
      reviews: 167,
      category: "Expensive Cups"
    },
    {
      id: "h5",
      name: "Electric Kitchen Scale",
      price: 4999.99,
      originalPrice: 7999.99,
      image: electricKitchenScale,
      rating: 4.6,
      reviews: 298,
      category: "Kitchen Accessories"
    },
    // Bathroom & Linens
    {
      id: "h6",
      name: "Egyptian Cotton Towel Set",
      price: 9999.99,
      originalPrice: 14999.99,
      image: egyptianCottonTowels,
      rating: 4.9,
      reviews: 234,
      category: "Towels"
    },
    {
      id: "h7",
      name: "Luxury Bath Towels - White",
      price: 7999.99,
      originalPrice: 11999.99,
      image: luxuryBathTowelsWhite,
      rating: 4.8,
      reviews: 189,
      category: "Towels"
    },
    {
      id: "h8",
      name: "Premium Hand Towels - Set of 6",
      price: 5999.99,
      originalPrice: 8999.99,
      image: premiumHandTowelsSet,
      rating: 4.7,
      reviews: 167,
      category: "Towels"
    },
    // Home Decor
    {
      id: "h9",
      name: "Decorative Ceramic Vase",
      price: 6999.99,
      originalPrice: 9999.99,
      image: ceramicVaseDecor,
      rating: 4.6,
      reviews: 145,
      category: "Home Decor"
    },
    {
      id: "h10",
      name: "Scented Candles - Luxury Set",
      price: 4999.99,
      originalPrice: 7999.99,
      image: scentedCandlesLuxurySet,
      rating: 4.8,
      reviews: 234,
      category: "Home Decor"
    }
  ],

  specials: [
    // Gift Items
    {
      id: "s1",
      name: "Luxury Gift Hamper - Premium",
      price: 35999.99,
      originalPrice: 49999.99,
      image: luxuryGiftHamper,
      rating: 4.9,
      reviews: 78,
      category: "Gifts"
    },
    {
      id: "s2",
      name: "Romantic Gift Set - Valentine's",
      price: 18999.99,
      originalPrice: 27999.99,
      image: romanticGiftSetValentines,
      rating: 4.8,
      reviews: 156,
      category: "Gifts"
    },
    {
      id: "s3",
      name: "Corporate Gift Package",
      price: 25999.99,
      originalPrice: 35999.99,
      image: corporateGiftPackage,
      rating: 4.7,
      reviews: 89,
      category: "Gifts"
    },
    {
      id: "s4",
      name: "Birthday Surprise Box",
      price: 12999.99,
      originalPrice: 18999.99,
      image: birthdaySurpriseBox,
      rating: 4.8,
      reviews: 234,
      category: "Gifts"
    },
    {
      id: "s5",
      name: "Weekend Flash Deal - Mixed Bundle",
      price: 9999.99,
      originalPrice: 19999.99,
      image: weekendFlashDealBundle,
      rating: 4.6,
      reviews: 345,
      category: "Weekly Deals"
    },
    {
      id: "s6",
      name: "Clearance Sale - Fashion Items",
      price: 7999.99,
      originalPrice: 15999.99,
      image: clearanceFashionItems,
      rating: 4.5,
      reviews: 267,
      category: "Weekly Deals"
    }
  ]
};