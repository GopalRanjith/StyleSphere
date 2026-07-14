import { Injectable, signal, computed } from '@angular/core';
import { Product } from './product.service';

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  readonly cartItems = signal<CartItem[]>([]);

  readonly totalItemsCount = computed(() => 
    this.cartItems().reduce((acc, item) => acc + item.quantity, 0)
  );

  readonly totalCost = computed(() => 
    this.cartItems().reduce((acc, item) => acc + (item.product.price * item.quantity), 0)
  );

  addToCart(product: Product, size: string, quantity: number): void {
    const current = this.cartItems();
    const existingIndex = current.findIndex(
      item => item.product.id === product.id && item.size === size
    );

    if (existingIndex > -1) {
      // Create a shallow copy and update the item
      const updated = [...current];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + quantity
      };
      this.cartItems.set(updated);
    } else {
      this.cartItems.set([...current, { product, size, quantity }]);
    }
  }

  removeFromCart(productId: number, size: string): void {
    const filtered = this.cartItems().filter(
      item => !(item.product.id === productId && item.size === size)
    );
    this.cartItems.set(filtered);
  }

  clearCart(): void {
    this.cartItems.set([]);
  }
}
