import { Injectable, signal, computed, inject } from '@angular/core';
import { Product } from './product.service';
import { AuthService } from './auth.service';

export interface CartItem {
  id?: number;
  product: Product;
  size: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly authService = inject(AuthService);

  private readonly apiUrl = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:7071/api'
      : '/api';

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = this.authService.token();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  readonly cartItems = signal<CartItem[]>([]);

  readonly totalItemsCount = computed(() => 
    this.cartItems().reduce((acc, item) => acc + item.quantity, 0)
  );

  readonly subtotal = computed(() => 
    this.cartItems().reduce((acc, item) => acc + (item.product.price * item.quantity), 0)
  );

  // Free shipping threshold ₹1,999
  readonly freeShippingThreshold = 1999;
  readonly isFreeShipping = computed(() => this.subtotal() >= this.freeShippingThreshold);
  readonly shippingFee = computed(() => this.cartItems().length === 0 || this.isFreeShipping() ? 0 : 149);
  
  // 5% GST included or applied
  readonly taxAmount = computed(() => Math.round(this.subtotal() * 0.05));
  
  readonly totalCost = computed(() => this.subtotal() + this.shippingFee() + this.taxAmount());

  constructor() {
    this.loadInitialCart();
  }

  private async loadInitialCart(): Promise<void> {
    // 1. Load from localStorage first for instant display
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('stylesphere_cart');
      if (saved) {
        try {
          this.cartItems.set(JSON.parse(saved));
        } catch {
          localStorage.removeItem('stylesphere_cart');
        }
      }
    }

    // 2. Try fetching from backend API for logged-in user
    try {
      const userId = this.authService.currentUser()?.id;
      const url = userId ? `${this.apiUrl}/cart?userId=${userId}` : `${this.apiUrl}/cart`;
      const res = await fetch(url, { headers: this.getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          const apiItems: CartItem[] = data.items.map((i: any) => ({
            id: i.id,
            size: i.size,
            quantity: i.quantity,
            product: {
              id: i.product.id,
              name: i.product.name,
              gender: i.product.gender,
              category: i.product.category,
              price: i.product.price,
              originalPrice: i.product.originalPrice,
              discount: i.product.discount,
              image: i.product.image,
              rating: 4.5,
              reviews: 40,
              description: '',
              sizes: [i.size],
              details: '',
              materials: '',
              care: '',
              aiInsight: ''
            }
          }));
          this.cartItems.set(apiItems);
          this.persistLocal(apiItems);
        }
      }
    } catch {
      // Backend not running; offline local state remains intact
    }
  }

  private persistLocal(items: CartItem[]): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('stylesphere_cart', JSON.stringify(items));
    }
  }

  addToCart(product: Product, size: string, quantity: number = 1): void {
    const current = this.cartItems();
    const existingIndex = current.findIndex(
      item => item.product.id === product.id && item.size === size
    );

    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...current];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + quantity
      };
    } else {
      updated = [...current, { product, size, quantity }];
    }

    this.cartItems.set(updated);
    this.persistLocal(updated);

    // Sync to backend asynchronously
    const userId = this.authService.currentUser()?.id;
    fetch(`${this.apiUrl}/cart`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ userId, productId: product.id, size, quantity })
    }).catch(() => {
      // Offline fallback: kept locally
    });
  }

  updateQuantity(productId: number, size: string, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeFromCart(productId, size);
      return;
    }

    const current = this.cartItems();
    const updated = current.map(item => {
      if (item.product.id === productId && item.size === size) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });

    this.cartItems.set(updated);
    this.persistLocal(updated);
  }

  removeFromCart(productId: number, size: string): void {
    const filtered = this.cartItems().filter(
      item => !(item.product.id === productId && item.size === size)
    );
    this.cartItems.set(filtered);
    this.persistLocal(filtered);

    const userId = this.authService.currentUser()?.id;
    fetch(`${this.apiUrl}/cart`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ userId, productId, size })
    }).catch(() => {});
  }

  clearCart(): void {
    this.cartItems.set([]);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('stylesphere_cart');
    }

    const userId = this.authService.currentUser()?.id;
    fetch(`${this.apiUrl}/cart`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ userId, clearAll: true })
    }).catch(() => {});
  }
}
