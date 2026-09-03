import { Injectable, signal } from '@angular/core';

export interface Product {
  id: number;
  name: string;
  gender: 'men' | 'women';
  category: string;
  theme?: string; // e.g. Marvel, Anime, DC, Harry Potter
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  rating: number;
  reviews: number;
  description: string;
  sizes: string[];
  details: string;
  materials: string;
  care: string;
  aiInsight: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly productsList = signal<Product[]>([
    {
      id: 1,
      name: "Men Linen Solid Red Shirt",
      gender: "men",
      category: "Linen",
      price: 1499,
      originalPrice: 2199,
      discount: 31,
      image: "/images/red_tshirt.png",
      rating: 4.7,
      reviews: 128,
      description: "Premium linen-blend solid red shirt with curved hem, spread collar, and full sleeves. Perfect for your casual outings and holiday styling.",
      sizes: ["S", "M", "L", "XL"],
      details: "Breathable fabric, chest pocket, premium streetwear fit.",
      materials: "55% Linen, 45% Cotton",
      care: "Gentle machine wash cold",
      aiInsight: "Match it with dark beige chinos and white clean sneakers for a refined summer holiday aesthetic."
    },
    {
      id: 2,
      name: "Women Puff-Sleeve White Dress",
      gender: "women",
      category: "Cotton",
      price: 1999,
      originalPrice: 2999,
      discount: 33,
      image: "/images/cotton_dress.png",
      rating: 4.8,
      reviews: 92,
      description: "Beautiful puff-sleeve solid white dress in organic cotton. A-line shape with a square neck front and delicate smocking detail at the back.",
      sizes: ["XS", "S", "M", "L"],
      details: "Smocked back, soft inner lining, elastic puff sleeves.",
      materials: "100% Organic Cotton",
      care: "Wash inside out with similar colors",
      aiInsight: "Highly recommended for casual brunch. Style it with block heels and a small pastel shoulder bag."
    },
    {
      id: 3,
      name: "Women Emerald Satin Slip Dress",
      gender: "women",
      category: "Satin",
      price: 1799,
      originalPrice: 2699,
      discount: 33,
      image: "/images/slip_dress.png",
      rating: 4.9,
      reviews: 154,
      description: "Ankle-length cocktail slip dress in premium emerald green satin. V-neck cut with adjustable cross shoulder straps and a flattering side leg-slit.",
      sizes: ["S", "M", "L"],
      details: "Adjustable back straps, cowl neck, side leg-slit.",
      materials: "95% Polyester, 5% Elastane",
      care: "Dry clean recommended",
      aiInsight: "An absolute head-turner. Layer with a black leather jacket to add a modern street-style edge."
    },
    {
      id: 4,
      name: "Men Knitted Rust Polo Shirt",
      gender: "men",
      category: "Knitwear",
      price: 1299,
      originalPrice: 1999,
      discount: 35,
      image: "/images/knit_dress.png",
      rating: 4.6,
      reviews: 70,
      description: "Textured rib-knit polo shirt in a warm rust brown shade. Designed with a clean zip placket, classic collar, and tapered fit.",
      sizes: ["S", "M", "L", "XL"],
      details: "Zip collar placket, ribbed cuff and hem, heavy knit construction.",
      materials: "70% Viscose, 30% Polyamide",
      care: "Flat dry, do not wring, machine wash delicate",
      aiInsight: "Excellent for smart-casual wear. Looks sharp tucked into tailored charcoal trousers."
    },
    {
      id: 5,
      name: "Marvel: Iron Man Oversized T-Shirt",
      gender: "men",
      category: "Oversized T-Shirts",
      theme: "Marvel",
      price: 999,
      originalPrice: 1499,
      discount: 33,
      image: "/images/men_marvel_tshirt.png",
      rating: 4.9,
      reviews: 312,
      description: "Premium heavy-weight oversized red streetwear t-shirt. Features a bold gold metallic Iron Man Arc Reactor print on the front and custom graphic on the back.",
      sizes: ["S", "M", "L", "XL"],
      details: "240 GSM organic cotton, drop shoulder fit, high-density print.",
      materials: "100% Organic Cotton",
      care: "Cold wash inside out, iron on reverse",
      aiInsight: "Pair with black cargo joggers and chunky sneakers for an effortless urban streetwear look."
    },
    {
      id: 6,
      name: "Anime: Naruto Akatsuki Hoodie",
      gender: "men",
      category: "Hoodies",
      theme: "Anime",
      price: 1999,
      originalPrice: 2999,
      discount: 33,
      image: "/images/men_anime_hoodie.png",
      rating: 4.8,
      reviews: 245,
      description: "Official merchandise anime hoodie in solid black. Accented with the iconic embroidered red Akatsuki cloud on the center chest and sleeve branding.",
      sizes: ["S", "M", "L", "XL"],
      details: "Heavy fleece lined, double-layered hood, kangaroo pockets.",
      materials: "80% Cotton, 20% Polyester Fleece",
      care: "Machine wash cold, tumble dry low",
      aiInsight: "Perfect for fans. Wear with distressed dark denim and high-top sneakers."
    },
    {
      id: 7,
      name: "DC: Batman Dark Knight Classic Tee",
      gender: "men",
      category: "Classic Fit T-Shirts",
      theme: "DC",
      price: 799,
      originalPrice: 1199,
      discount: 33,
      image: "/images/red_tshirt.png",
      rating: 4.5,
      reviews: 88,
      description: "A dark charcoal-grey classic crewneck t-shirt featuring the distressed yellow vintage Batman logo. Soft-washed for an authentic retro feel.",
      sizes: ["S", "M", "L", "XL"],
      details: "Standard crewneck, breathable knit, vintage screenprint.",
      materials: "100% Combed Cotton",
      care: "Standard machine wash",
      aiInsight: "Wear it under a black flannel shirt with beige chinos for a grunge-inspired casual style."
    },
    {
      id: 8,
      name: "Men Premium Olive Cargo Pants",
      gender: "men",
      category: "Cargo Pants",
      price: 1799,
      originalPrice: 2499,
      discount: 28,
      image: "/images/men_cargo_pants.png",
      rating: 4.7,
      reviews: 190,
      description: "Functional and stylish cargo pants in premium olive green ripstop cotton. Equipped with standard side pockets, deep cargo utility compartments, and elastic drawstrings.",
      sizes: ["S", "M", "L", "XL"],
      details: "Multiple pockets, adjustable ankle cuffs, relaxed utility fit.",
      materials: "98% Cotton, 2% Elastane",
      care: "Wash with dark colors, medium iron",
      aiInsight: "An absolute staple. Combines incredibly well with oversized graphic tees or solid knitted polo shirts."
    },
    {
      id: 9,
      name: "Anime: Jujutsu Kaisen Co-ords",
      gender: "men",
      category: "Co-ords",
      theme: "Anime",
      price: 2299,
      originalPrice: 3199,
      discount: 28,
      image: "/images/men_coords_set.png",
      rating: 4.9,
      reviews: 115,
      description: "Modern coordinate street set containing a relaxed half-sleeve shirt and matching elastic waist shorts. Featuring custom minimalist curse seal prints.",
      sizes: ["M", "L", "XL"],
      details: "Two-piece matching set, notch collar, lightweight breathable weave.",
      materials: "100% Rayon Viscose",
      care: "Hand wash or delicate machine wash cold",
      aiInsight: "The ultimate beach or summer street style. Keep it simple with slides or clean white slip-ons."
    },
    {
      id: 10,
      name: "Harry Potter: Gryffindor Knitwear Polo",
      gender: "men",
      category: "Knitwear",
      theme: "Harry Potter",
      price: 1399,
      originalPrice: 1999,
      discount: 30,
      image: "/images/knit_dress.png",
      rating: 4.6,
      reviews: 62,
      description: "Classy knitted polo shirt in burgundy with gold collar tipping. Features a small embroidered Gryffindor shield crest on the chest.",
      sizes: ["S", "M", "L"],
      details: "Ribbed knit cuffs, two-button placket, retro knit structure.",
      materials: "65% Viscose, 35% Nylon",
      care: "Dry flat, reshape while wet",
      aiInsight: "Smart-casual at its best. Styles easily with cream tailored trousers and loafers."
    },
    {
      id: 11,
      name: "Women Marvel Black Widow Tee",
      gender: "women",
      category: "Classic Fit T-Shirts",
      theme: "Marvel",
      price: 899,
      originalPrice: 1299,
      discount: 30,
      image: "/images/slip_dress.png",
      rating: 4.7,
      reviews: 78,
      description: "Slim-fit black cotton t-shirt highlighting the red hourglass emblem of Black Widow in a minimalist chrome finish.",
      sizes: ["XS", "S", "M", "L"],
      details: "Soft-touch cotton, stretch rib collar, premium emblem finish.",
      materials: "95% Cotton, 5% Lycra",
      care: "Do not iron print directly, wash inside out",
      aiInsight: "Tuck it into a high-waisted black leather skirt and boots for a sleek, edgy ensemble."
    },
    {
      id: 12,
      name: "Women Anime Sailor Moon Co-ords",
      gender: "women",
      category: "Co-ords",
      theme: "Anime",
      price: 2199,
      originalPrice: 2999,
      discount: 26,
      image: "/images/cotton_dress.png",
      rating: 4.8,
      reviews: 104,
      description: "Dreamy co-ord set featuring a pastel pink cropped hoodie and matching high-waisted sweat shorts with Sailor Moon crescent emblems.",
      sizes: ["XS", "S", "M"],
      details: "Cropped hoodie, drawcord waistband, gold emblem embroidery.",
      materials: "85% Cotton, 15% Polyester",
      care: "Gentle cycle wash cold",
      aiInsight: "Cute and comfortable lounge style. Matches perfectly with pastel sneakers."
    },
    {
      id: 13,
      name: "Women Harry Potter Hogwarts Hoodie",
      gender: "women",
      category: "Hoodies",
      theme: "Harry Potter",
      price: 1899,
      originalPrice: 2699,
      discount: 29,
      image: "/images/wrap_dress.png",
      rating: 4.7,
      reviews: 130,
      description: "Oversized cozy hoodie in heather gray. Highlights a large distressed vintage Hogwarts crest print across the chest.",
      sizes: ["S", "M", "L"],
      details: "Drop shoulder, brushed fleece lining, rib-knit trims.",
      materials: "70% Cotton, 30% Polyester",
      care: "Standard machine wash with like colors",
      aiInsight: "The perfect casual piece. Wear it with black leggings and boots for a cozy library day look."
    },
    {
      id: 14,
      name: "Men Cotton Summer Indigo Shirt",
      gender: "men",
      category: "Cotton",
      price: 1199,
      originalPrice: 1799,
      discount: 33,
      image: "/images/red_tshirt.png",
      rating: 4.4,
      reviews: 55,
      description: "Breathable pure cotton casual shirt dyed in rich indigo wash. Features a neat spread collar, chest pocket, and rolled sleeve tabs.",
      sizes: ["S", "M", "L", "XL"],
      details: "Lightweight indigo-dyed cotton, standard fit, chest pocket.",
      materials: "100% Cotton",
      care: "Indigo bleed warning: wash separately first",
      aiInsight: "Wear it open over a white tank top with khaki shorts for the ultimate casual summer weekend outfit."
    }
  ]);

  private readonly apiUrl = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:7071/api'
      : '/api';

  readonly products = this.productsList.asReadonly();

  constructor() {
    this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    try {
      const res = await fetch(`${this.apiUrl}/products`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.products && data.products.length > 0) {
          this.productsList.set(data.products);
        }
      }
    } catch {
      // Kept fallback products seamlessly
    }
  }

  getProductById(id: number): Product | undefined {
    return this.productsList().find(p => p.id === id);
  }

  getProductsByGender(gender: 'men' | 'women'): Product[] {
    return this.productsList().filter(p => p.gender === gender);
  }
}

