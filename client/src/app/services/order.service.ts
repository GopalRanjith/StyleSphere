import { Injectable, signal, inject } from '@angular/core';
import { AuthService } from './auth.service';

export interface OrderItem {
  productId: number;
  name: string;
  image: string;
  size: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: 'Confirmed' | 'Dispatched' | 'Delivered' | 'Cancelled';
  createdAt: string;
  items: OrderItem[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
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

  readonly orders = signal<Order[]>([]);
  readonly isLoading = signal<boolean>(false);

  constructor() {
    this.loadOrders();
  }

  async loadOrders(): Promise<void> {
    this.isLoading.set(true);
    try {
      const userId = this.authService.currentUser()?.id;
      const url = userId ? `${this.apiUrl}/orders?userId=${userId}` : `${this.apiUrl}/orders`;
      const res = await fetch(url, { headers: this.getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.orders) {
          this.orders.set(data.orders);
        }
      }
    } catch {
      // Local fallback: keep existing orders or empty
      if (this.orders().length === 0 && typeof localStorage !== 'undefined') {
        const localSaved = localStorage.getItem('stylesphere_orders');
        if (localSaved) {
          try {
            this.orders.set(JSON.parse(localSaved));
          } catch {}
        }
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  async placeOrder(items: any[], totalAmount: number): Promise<{ success: boolean; orderNumber?: string; error?: string }> {
    try {
      const userId = this.authService.currentUser()?.id;
      const res = await fetch(`${this.apiUrl}/orders`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ userId, items, totalAmount })
      });

      if (res.ok) {
        const data = await res.json();
        await this.loadOrders();
        return { success: true, orderNumber: data.orderNumber };
      } else {
        const errData = await res.json();
        return { success: false, error: errData.error || 'Checkout failed' };
      }
    } catch {
      // Offline fallback: create local order
      const fallbackOrder: Order = {
        id: Date.now(),
        orderNumber: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        totalAmount,
        status: 'Confirmed',
        createdAt: new Date().toISOString(),
        items: items.map(i => ({
          productId: i.product?.id || i.productId,
          name: i.product?.name || i.name,
          image: i.product?.image || i.image,
          size: i.size,
          quantity: i.quantity,
          price: i.product?.price || i.price
        }))
      };

      const updated = [fallbackOrder, ...this.orders()];
      this.orders.set(updated);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('stylesphere_orders', JSON.stringify(updated));
      }
      return { success: true, orderNumber: fallbackOrder.orderNumber };
    }
  }
}
