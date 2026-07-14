import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  private readonly productService = inject(ProductService);

  readonly categories = ['All', 'Linen', 'Cotton', 'Satin', 'Knitwear'];
  readonly selectedCategory = signal<string>('All');

  // Filter products based on selected category signal
  readonly filteredProducts = computed(() => {
    const category = this.selectedCategory();
    const allProducts = this.productService.products();
    if (category === 'All') {
      return allProducts;
    }
    return allProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
  });

  setCategory(category: string): void {
    this.selectedCategory.set(category);
  }
}
