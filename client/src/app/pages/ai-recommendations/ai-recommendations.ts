import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RecommendationService, OutfitPairing } from '../../services/recommendation.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../services/product.service';

@Component({
  selector: 'app-ai-recommendations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ai-recommendations.html',
  styleUrl: './ai-recommendations.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AiRecommendationsComponent implements OnInit {
  readonly recService = inject(RecommendationService);
  readonly cartService = inject(CartService);

  readonly activeVibe = signal<string>('All');
  readonly addedNotification = signal<string | null>(null);

  readonly vibes = [
    'All',
    'Streetwear & Anime',
    'Pop-Culture Drops',
    'Minimalist Linen',
    'Summer Cotton'
  ];

  ngOnInit(): void {
    this.recService.loadRecommendations();
  }

  setVibe(vibe: string): void {
    this.activeVibe.set(vibe);
  }

  readonly filteredTopPicks = computed(() => {
    const data = this.recService.recommendationData();
    if (!data) return [];

    const vibe = this.activeVibe();
    if (vibe === 'All') return data.topPicks;

    if (vibe === 'Streetwear & Anime') {
      return data.topPicks.filter(p => p.theme === 'Anime' || p.category === 'Hoodies');
    }
    if (vibe === 'Pop-Culture Drops') {
      return data.topPicks.filter(p => p.theme !== undefined);
    }
    if (vibe === 'Minimalist Linen') {
      return data.topPicks.filter(p => p.category === 'Linen');
    }
    if (vibe === 'Summer Cotton') {
      return data.topPicks.filter(p => p.category === 'Cotton');
    }

    return data.topPicks;
  });

  quickAdd(product: Product, size: string = 'M'): void {
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : size;
    this.cartService.addToCart(product, defaultSize, 1);
    this.addedNotification.set(`Added "${product.name}" (${defaultSize}) to your bag!`);

    setTimeout(() => {
      this.addedNotification.set(null);
    }, 2800);
  }

  addPairingToBag(pairing: OutfitPairing): void {
    pairing.items.forEach(item => {
      const defaultSize = item.sizes && item.sizes.length > 0 ? item.sizes[0] : 'M';
      this.cartService.addToCart(item, defaultSize, 1);
    });

    this.addedNotification.set(`Added entire "${pairing.outfitName}" set to your bag!`);
    setTimeout(() => {
      this.addedNotification.set(null);
    }, 2800);
  }
}
