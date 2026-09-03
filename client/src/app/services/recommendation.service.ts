import { Injectable, signal } from '@angular/core';
import { Product } from './product.service';

export interface AiNarrative {
  title: string;
  insight: string;
  model: string;
  confidenceScore: string;
}

export interface OutfitPairing {
  outfitName: string;
  description: string;
  items: Product[];
}

export interface RecommendationData {
  narratives: AiNarrative[];
  topPicks: Product[];
  themeTrends: Product[];
  pairings: OutfitPairing[];
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private readonly apiUrl = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:7071/api'
      : '/api';

  readonly recommendationData = signal<RecommendationData | null>(null);
  readonly isLoading = signal<boolean>(false);

  constructor() {
    this.loadRecommendations();
  }

  async loadRecommendations(): Promise<void> {
    this.isLoading.set(true);
    try {
      const res = await fetch(`${this.apiUrl}/recommendations`);
      if (res.ok) {
        const data = await res.json();
        this.recommendationData.set({
          narratives: data.narratives || [],
          topPicks: data.topPicks || [],
          themeTrends: data.themeTrends || [],
          pairings: data.pairings || []
        });
        return;
      }
    } catch {
      // Offline fallback below
    }

    // Default high-fidelity fallback if backend offline
    this.recommendationData.set({
      narratives: [
        {
          title: 'Merchandising Behavioral Signal',
          insight: 'Shoppers viewing Linen & Cotton apparel are showing 42% higher cart conversion when paired with relaxed bottoms. Demand forecasting anticipates peak sales for neutral hues this weekend.',
          model: 'Gemini 2.5 Flash + scikit-learn Collaborative Filter',
          confidenceScore: '94.2%'
        },
        {
          title: 'Personalized Style Match',
          insight: 'Based on your preference for pop-culture graphics and breathable fabrics, our hybrid model scored Marvel & Anime streetwear at a 96% style affinity match.',
          model: 'Content-Based Attribute Weighting Engine',
          confidenceScore: '96.5%'
        }
      ],
      topPicks: [
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
          rating: 4.8,
          reviews: 142,
          description: "Drop shoulder streetwear oversized fit with high-density Iron Man arc reactor graphics.",
          sizes: ["S", "M", "L", "XL"],
          details: "Heavyweight 240 GSM bio-washed cotton",
          materials: "100% Combed Cotton",
          care: "Machine wash cold inside out",
          aiInsight: "Pair with black cargos and retro high-top sneakers for an iconic streetwear look."
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
          description: "A-line silhouette in pure organic cotton with delicate puff sleeves.",
          sizes: ["XS", "S", "M", "L"],
          details: "Smocked back, soft inner lining",
          materials: "100% Organic Cotton",
          care: "Gentle cycle wash",
          aiInsight: "Style with tan gladiator sandals and delicate gold jewelry for brunch elegance."
        },
        {
          id: 6,
          name: "Anime: Naruto Akatsuki Hoodie",
          gender: "men",
          category: "Hoodies",
          theme: "Anime",
          price: 1999,
          originalPrice: 2799,
          discount: 28,
          image: "/images/men_anime_hoodie.png",
          rating: 4.9,
          reviews: 210,
          description: "Comfort fleece hoodie with embroidered Akatsuki red cloud iconography.",
          sizes: ["M", "L", "XL"],
          details: "320 GSM brushed fleece with kangaroo pocket",
          materials: "80% Cotton, 20% Polyester",
          care: "Gentle cold wash",
          aiInsight: "Wear layered under an oversized denim jacket for maximum street-cred aesthetics."
        },
        {
          id: 9,
          name: "Anime: Jujutsu Kaisen Co-ords",
          gender: "men",
          category: "Co-ords",
          theme: "Anime",
          price: 2299,
          originalPrice: 3299,
          discount: 30,
          image: "/images/men_coords_set.png",
          rating: 4.7,
          reviews: 77,
          description: "Two-piece co-ords set featuring subtle Jujutsu High Tokyo motifs.",
          sizes: ["S", "M", "L", "XL"],
          details: "Matching camp collar shirt and relaxed drawstring shorts",
          materials: "Rayon Blend",
          care: "Hand wash or gentle cycle",
          aiInsight: "Wear as a matching set with clean slide sandals for an effortless resort fit."
        }
      ],
      themeTrends: [
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
          rating: 4.8,
          reviews: 142,
          description: "Drop shoulder streetwear oversized fit with high-density Iron Man arc reactor graphics.",
          sizes: ["S", "M", "L", "XL"],
          details: "Heavyweight 240 GSM bio-washed cotton",
          materials: "100% Combed Cotton",
          care: "Machine wash cold inside out",
          aiInsight: "Pair with black cargos."
        },
        {
          id: 6,
          name: "Anime: Naruto Akatsuki Hoodie",
          gender: "men",
          category: "Hoodies",
          theme: "Anime",
          price: 1999,
          originalPrice: 2799,
          discount: 28,
          image: "/images/men_anime_hoodie.png",
          rating: 4.9,
          reviews: 210,
          description: "Comfort fleece hoodie with embroidered Akatsuki red cloud iconography.",
          sizes: ["M", "L", "XL"],
          details: "320 GSM brushed fleece with kangaroo pocket",
          materials: "80% Cotton, 20% Polyester",
          care: "Gentle cold wash",
          aiInsight: "Wear layered under denim jacket."
        }
      ],
      pairings: [
        {
          outfitName: 'Urban Minimalist Summer',
          description: 'Effortless linen texture with structured utility cargo.',
          items: [
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
              description: "Premium linen-blend solid red shirt.",
              sizes: ["S", "M", "L", "XL"],
              details: "Breathable fabric",
              materials: "55% Linen, 45% Cotton",
              care: "Gentle machine wash",
              aiInsight: "Summer styling"
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
              rating: 4.6,
              reviews: 64,
              description: "Multi-pocket tactical cargo pants.",
              sizes: ["30", "32", "34", "36"],
              details: "Ripstop cotton",
              materials: "98% Cotton, 2% Elastane",
              care: "Machine wash cold",
              aiInsight: "Pair with relaxed shirts"
            }
          ]
        }
      ]
    });
    this.isLoading.set(false);
  }
}
