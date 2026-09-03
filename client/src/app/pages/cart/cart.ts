import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartComponent {
  readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  readonly isPlacingOrder = signal<boolean>(false);
  readonly orderSuccess = signal<string | null>(null);
  readonly promoCode = signal<string>('');
  readonly promoApplied = signal<boolean>(false);
  readonly promoDiscount = signal<number>(0);

  applyPromo(code: string): void {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'STYLE2026' || cleanCode === 'FASHION100') {
      this.promoApplied.set(true);
      this.promoDiscount.set(200);
    } else {
      this.promoApplied.set(false);
      this.promoDiscount.set(0);
    }
  }

  getFinalTotal(): number {
    const total = this.cartService.totalCost() - this.promoDiscount();
    return Math.max(0, total);
  }

  async checkout(): Promise<void> {
    const items = this.cartService.cartItems();
    if (items.length === 0) return;

    this.isPlacingOrder.set(true);
    const finalAmount = this.getFinalTotal();

    const result = await this.orderService.placeOrder(items, finalAmount);
    this.isPlacingOrder.set(false);

    if (result.success && result.orderNumber) {
      this.orderSuccess.set(result.orderNumber);
      this.cartService.clearCart();
    }
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }
}
