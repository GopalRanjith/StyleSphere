import { Injectable, signal } from '@angular/core';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
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
      name: "Linen-blend Wrap Dress",
      category: "Linen",
      price: 1999,
      image: "/images/wrap_dress.png",
      rating: 4.8,
      reviews: 120,
      description: "V-neck wrap dress in a soft linen and viscose blend. Short wide sleeves and a wide tie belt at one side. Unlined.",
      sizes: ["XS", "S", "M", "L", "XL"],
      details: "Visual details include clean stitching, V-neck front, side tie closure.",
      materials: "55% Linen, 45% Viscose",
      care: "Machine wash at 30°",
      aiInsight: "A perfect summer option. Style it with leather slide sandals and a woven straw bag for an effortlessly elegant look. Recommended for warm climates."
    },
    {
      id: 2,
      name: "Puff-sleeve Cotton Dress",
      category: "Cotton",
      price: 2499,
      image: "/images/cotton_dress.png",
      rating: 4.7,
      reviews: 85,
      description: "Short, A-line dress in soft cotton poplin. Square neckline at the front and back, and short puff sleeves with narrow elastication.",
      sizes: ["S", "M", "L"],
      details: "Features puff sleeves, soft cotton lining, elastic cuffs.",
      materials: "100% Cotton",
      care: "Machine wash at 40°",
      aiInsight: "Highly versatile. Transition from casual daywear to evening dinner by accessorizing with minimalist statement earrings."
    },
    {
      id: 3,
      name: "Satin Slip Dress",
      category: "Satin",
      price: 2299,
      image: "/images/slip_dress.png",
      rating: 4.9,
      reviews: 145,
      description: "Ankle-length slip dress in elegant, gently draping satin. V-neck at the front and a deep V-neck at the back with narrow adjustable shoulder straps.",
      sizes: ["XS", "S", "M", "L"],
      details: "Adjustable thin straps, cowl neck detailing, side slit.",
      materials: "100% Polyester",
      care: "Hand wash cold",
      aiInsight: "Elegance defined. Throw on a structured oversize blazer to create a premium high-end contrast for formal occasions."
    },
    {
      id: 4,
      name: "Rib-knit Dress",
      category: "Knitwear",
      price: 1799,
      image: "/images/knit_dress.png",
      rating: 4.5,
      reviews: 64,
      description: "Calf-length dress in a soft, rib-knit viscose blend. Round neck, long sleeves and a straight-cut hem with side slits.",
      sizes: ["S", "M", "L", "XL"],
      details: "Ribbed texture, mock neck, side hem slits.",
      materials: "70% Viscose, 30% Polyamide",
      care: "Dry flat, machine wash delicate",
      aiInsight: "Cosy yet chic. Pairs wonderfully with knee-high boots and a long trench coat for autumn/winter transitions."
    }
  ]);

  readonly products = this.productsList.asReadonly();

  getProductById(id: number): Product | undefined {
    return this.productsList().find(p => p.id === id);
  }
}
