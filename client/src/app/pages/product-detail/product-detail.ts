import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);

  readonly product = computed<Product | undefined>(() => {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) return undefined;
    const id = parseInt(idParam, 10);
    return this.productService.getProductById(id);
  });

  readonly selectedSize = signal<string>('');
  readonly selectedQuantity = signal<number>(1);
  readonly sizeError = signal<boolean>(false);
  readonly isAdded = signal<boolean>(false);

  // Accordion tabs
  readonly activeTab = signal<string>('description');

  setSize(size: string): void {
    this.selectedSize.set(size);
    this.sizeError.set(false);
  }

  setQuantity(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedQuantity.set(parseInt(value, 10));
  }

  setTab(tab: string): void {
    // If clicking already active tab, collapse it (toggle logic)
    if (this.activeTab() === tab) {
      this.activeTab.set('');
    } else {
      this.activeTab.set(tab);
    }
  }

  addToBag(): void {
    const currentProduct = this.product();
    if (!currentProduct) return;

    if (!this.selectedSize()) {
      this.sizeError.set(true);
      return;
    }

    this.cartService.addToCart(currentProduct, this.selectedSize(), this.selectedQuantity());
    this.isAdded.set(true);

    setTimeout(() => {
      this.isAdded.set(false);
    }, 2000);
  }
}
