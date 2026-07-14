import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-catalogue',
  imports: [RouterLink],
  templateUrl: './catalogue.html',
  styleUrl: './catalogue.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogueComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);

  private readonly routeData = toSignal(this.route.data);

  readonly gender = computed<'men' | 'women'>(() => {
    const data = this.routeData();
    return data && data['gender'] === 'women' ? 'women' : 'men';
  });

  // Filter Options
  readonly categories = ['All', 'Oversized T-Shirts', 'Classic Fit T-Shirts', 'Shirts', 'Cargo Pants', 'Hoodies', 'Knitwear', 'Linen', 'Cotton', 'Satin', 'Co-ords'];
  readonly themes = ['All', 'Marvel', 'Anime', 'DC', 'Harry Potter'];
  readonly allSizes = ['XS', 'S', 'M', 'L', 'XL'];

  // Filter & Sort State Signals
  readonly selectedCategory = signal<string>('All');
  readonly selectedTheme = signal<string>('All');
  readonly selectedSizes = signal<Set<string>>(new Set<string>());
  readonly maxPrice = signal<number>(3000);
  readonly sortBy = signal<string>('relevance');

  // Filtered and Sorted Products
  readonly products = computed(() => {
    const activeGender = this.gender();
    const category = this.selectedCategory();
    const theme = this.selectedTheme();
    const sizes = this.selectedSizes();
    const priceLimit = this.maxPrice();
    const sort = this.sortBy();

    let list = this.productService.getProductsByGender(activeGender);

    // Filter by Category
    if (category !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by Theme
    if (theme !== 'All') {
      list = list.filter(p => p.theme?.toLowerCase() === theme.toLowerCase());
    }

    // Filter by Sizes
    if (sizes.size > 0) {
      list = list.filter(p => p.sizes.some(s => sizes.has(s)));
    }

    // Filter by Price Limit
    list = list.filter(p => p.price <= priceLimit);

    // Sort Products
    if (sort === 'price-low') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      list = [...list].sort((a, b) => b.rating - a.rating);
    }

    return list;
  });

  constructor() {
    // Reset all filters when gender route changes
    effect(() => {
      this.gender();
      this.clearFilters();
    });
  }

  setCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  setTheme(theme: string): void {
    this.selectedTheme.set(theme);
  }

  toggleSize(size: string): void {
    this.selectedSizes.update(prev => {
      const next = new Set(prev);
      if (next.has(size)) {
        next.delete(size);
      } else {
        next.add(size);
      }
      return next;
    });
  }

  setPriceLimit(price: number): void {
    this.maxPrice.set(price);
  }

  setSort(sort: string): void {
    this.sortBy.set(sort);
  }

  clearFilters(): void {
    this.selectedCategory.set('All');
    this.selectedTheme.set('All');
    this.selectedSizes.set(new Set<string>());
    this.maxPrice.set(3000);
    this.sortBy.set('relevance');
  }
}

