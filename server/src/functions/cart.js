const { app } = require('@azure/functions');
const db = require('../config/db');
const { verifyToken } = require('../utils/jwt');

// Helper to extract user ID from request Authorization header, query, or body
function getUserId(request, body = {}) {
    // 1. Check body or query param
    const queryUserId = request.query?.get ? request.query.get('userId') : request.query?.userId;
    if (body?.userId) return Number(body.userId);
    if (queryUserId) return Number(queryUserId);

    // 2. Check JWT Authorization Header
    const authHeader = request.headers['authorization'] || request.headers['Authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const payload = verifyToken(token);
        if (payload && payload.userId) {
            return Number(payload.userId);
        }
    }

    // 3. Fallback to default demo user ID (1: user@stylesphere.com)
    return 1;
}

// GET /api/cart
app.http('getCart', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'cart',
    handler: async (request, context) => {
        try {
            const userId = getUserId(request);

            const query = `
                SELECT 
                    ci.id AS cartItemId,
                    ci.quantity,
                    s.size_name AS size,
                    p.id AS productId,
                    p.name,
                    p.gender,
                    c.name AS category,
                    p.price,
                    p.original_price AS originalPrice,
                    p.discount,
                    p.image
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                JOIN categories c ON p.category_id = c.id
                JOIN sizes s ON ci.size_id = s.id
                WHERE ci.user_id = ?
                ORDER BY ci.updated_at DESC
            `;

            const [rows] = await db.execute(query, [userId]);

            const items = rows.map(r => ({
                id: r.cartItemId,
                size: r.size,
                quantity: r.quantity,
                product: {
                    id: r.productId,
                    name: r.name,
                    gender: r.gender,
                    category: r.category,
                    price: Number(r.price),
                    originalPrice: Number(r.originalPrice),
                    discount: Number(r.discount),
                    image: r.image
                }
            }));

            const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
            const totalAmount = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

            return {
                status: 200,
                jsonBody: {
                    success: true,
                    userId,
                    items,
                    totalItems,
                    totalAmount
                }
            };
        } catch (error) {
            context.error('[Cart API] Error fetching cart:', error);
            return {
                status: 500,
                jsonBody: { success: false, error: 'Failed to fetch cart', details: error.message }
            };
        }
    }
});

// POST /api/cart
app.http('addToCart', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'cart',
    handler: async (request, context) => {
        try {
            let body = {};
            try {
                body = await request.json();
            } catch {
                return { status: 400, jsonBody: { success: false, error: 'Invalid JSON body' } };
            }

            const userId = getUserId(request, body);
            const { productId, size, quantity = 1 } = body;

            if (!productId || !size) {
                return {
                    status: 400,
                    jsonBody: { success: false, error: 'productId and size are required' }
                };
            }

            // Look up size_id
            const [sizeRows] = await db.execute('SELECT id FROM sizes WHERE size_name = ?', [size]);
            if (sizeRows.length === 0) {
                return { status: 400, jsonBody: { success: false, error: `Invalid size '${size}'` } };
            }
            const sizeId = sizeRows[0].id;

            // Check if product exists
            const [prodRows] = await db.execute('SELECT id FROM products WHERE id = ?', [productId]);
            if (prodRows.length === 0) {
                return { status: 404, jsonBody: { success: false, error: 'Product not found' } };
            }

            // Upsert into cart_items
            const [existing] = await db.execute(
                'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND size_id = ?',
                [userId, productId, sizeId]
            );

            if (existing && existing.length > 0) {
                await db.execute(
                    'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
                    [quantity, existing[0].id]
                );
            } else {
                await db.execute(
                    'INSERT INTO cart_items (user_id, product_id, size_id, quantity) VALUES (?, ?, ?, ?)',
                    [userId, productId, sizeId, quantity]
                );
            }

            // Optional: log behavioral event for recommendation engine
            try {
                await db.execute(
                    'INSERT INTO behavioral_events (user_id, event_type, product_id, metadata) VALUES (?, ?, ?, ?)',
                    [userId, 'add_to_cart', productId, JSON.stringify({ size, quantity })]
                );
            } catch (evErr) {
                context.log('[Cart API] Note: Behavioral event log skipped:', evErr.message);
            }

            return {
                status: 200,
                jsonBody: { success: true, message: 'Item added to cart successfully' }
            };
        } catch (error) {
            context.error('[Cart API] Error adding to cart:', error);
            return {
                status: 500,
                jsonBody: { success: false, error: 'Failed to add item to cart', details: error.message }
            };
        }
    }
});

// DELETE /api/cart
app.http('removeFromCart', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'cart',
    handler: async (request, context) => {
        try {
            let body = {};
            try {
                body = await request.json();
            } catch {
                // If no body, check query
                body = {
                    productId: request.query.get ? request.query.get('productId') : request.query.productId,
                    size: request.query.get ? request.query.get('size') : request.query.size,
                    clearAll: request.query.get ? request.query.get('clearAll') : request.query.clearAll
                };
            }

            const userId = getUserId(request, body);

            const { productId, size, clearAll } = body;

            if (clearAll === true || clearAll === 'true') {
                await db.execute('DELETE FROM cart_items WHERE user_id = ?', [userId]);
                return {
                    status: 200,
                    jsonBody: { success: true, message: 'Cart cleared successfully' }
                };
            }

            if (!productId || !size) {
                return {
                    status: 400,
                    jsonBody: { success: false, error: 'productId and size, or clearAll are required' }
                };
            }

            // Find size_id
            const [sizeRows] = await db.execute('SELECT id FROM sizes WHERE size_name = ?', [size]);
            if (sizeRows.length === 0) {
                return { status: 400, jsonBody: { success: false, error: 'Invalid size' } };
            }
            const sizeId = sizeRows[0].id;

            await db.execute(
                'DELETE FROM cart_items WHERE user_id = ? AND product_id = ? AND size_id = ?',
                [userId, productId, sizeId]
            );

            return {
                status: 200,
                jsonBody: { success: true, message: 'Item removed from cart' }
            };
        } catch (error) {
            context.error('[Cart API] Error removing from cart:', error);
            return {
                status: 500,
                jsonBody: { success: false, error: 'Failed to remove item', details: error.message }
            };
        }
    }
});
