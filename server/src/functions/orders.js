const { app } = require('@azure/functions');
const db = require('../config/db');
const { verifyToken } = require('../utils/jwt');

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

// GET /api/orders
app.http('getOrders', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'orders',
    handler: async (request, context) => {
        try {
            const userId = getUserId(request);

            const [orders] = await db.execute(`
                SELECT 
                    id, 
                    CAST(total_amount AS DOUBLE) as totalAmount, 
                    status, 
                    created_at AS createdAt
                FROM orders 
                WHERE user_id = ?
                ORDER BY created_at DESC
            `, [userId]);

            if (orders.length === 0) {
                return {
                    status: 200,
                    jsonBody: { success: true, orders: [] }
                };
            }

            const orderIds = orders.map(o => o.id);
            const placeholders = orderIds.map(() => '?').join(',');

            const [items] = await db.execute(`
                SELECT 
                    oi.order_id AS orderId,
                    oi.id AS itemId,
                    oi.product_id AS productId,
                    p.name,
                    p.image,
                    s.size_name AS size,
                    oi.quantity,
                    CAST(oi.price AS DOUBLE) AS price
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                JOIN sizes s ON oi.size_id = s.id
                WHERE oi.order_id IN (${placeholders})
                ORDER BY oi.id ASC
            `, orderIds);

            const ordersWithItems = orders.map(order => ({
                id: order.id,
                orderNumber: `ORD-${String(order.id).padStart(6, '0')}`,
                totalAmount: Number(order.totalAmount),
                status: order.status === 'completed' ? 'Delivered' : (order.status === 'pending' ? 'Confirmed' : order.status),
                createdAt: order.createdAt,
                items: items.filter(item => item.orderId === order.id).map(i => ({
                    productId: i.productId,
                    name: i.name,
                    image: i.image,
                    size: i.size,
                    quantity: i.quantity,
                    price: Number(i.price)
                }))
            }));

            return {
                status: 200,
                jsonBody: { success: true, orders: ordersWithItems }
            };
        } catch (error) {
            context.error('[Orders API] Error fetching orders:', error);
            return {
                status: 500,
                jsonBody: { success: false, error: 'Failed to fetch orders', details: error.message }
            };
        }
    }
});

// POST /api/orders
app.http('createOrder', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'orders',
    handler: async (request, context) => {
        const connection = await db.getConnection();
        try {
            let body = {};
            try {
                body = await request.json();
            } catch {
                return { status: 400, jsonBody: { success: false, error: 'Invalid JSON' } };
            }

            const userId = getUserId(request, body);
            let { items, totalAmount } = body;

            // If no items provided in payload, fetch from cart_items
            if (!items || items.length === 0) {
                const [cartRows] = await connection.execute(`
                    SELECT 
                        ci.product_id, 
                        ci.size_id, 
                        ci.quantity, 
                        p.price,
                        s.size_name
                    FROM cart_items ci
                    JOIN products p ON ci.product_id = p.id
                    JOIN sizes s ON ci.size_id = s.id
                    WHERE ci.user_id = ?
                `, [userId]);

                if (cartRows.length === 0) {
                    connection.release();
                    return {
                        status: 400,
                        jsonBody: { success: false, error: 'Cart is empty. Cannot create order.' }
                    };
                }

                items = cartRows.map(r => ({
                    productId: r.product_id,
                    sizeId: r.size_id,
                    size: r.size_name,
                    quantity: r.quantity,
                    price: Number(r.price)
                }));

                totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            }

            await connection.beginTransaction();

            // 1. Insert order
            const [orderResult] = await connection.execute(
                'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
                [userId, totalAmount, 'pending']
            );
            const orderId = orderResult.insertId;

            // 2. Insert order items
            for (const item of items) {
                const prodId = item.productId || item.product?.id || item.id;
                const itemPrice = item.price !== undefined ? item.price : (item.product?.price || 0);
                const itemSize = item.size || 'M';

                let sizeId = item.sizeId;
                if (!sizeId) {
                    const [sRows] = await connection.execute('SELECT id FROM sizes WHERE size_name = ?', [itemSize]);
                    if (sRows.length > 0) sizeId = sRows[0].id;
                }
                if (!sizeId) sizeId = 1; // Fallback size

                await connection.execute(
                    'INSERT INTO order_items (order_id, product_id, size_id, quantity, price) VALUES (?, ?, ?, ?, ?)',
                    [orderId, prodId, sizeId, item.quantity, itemPrice]
                );

                // Log purchase behavioral event
                try {
                    await connection.execute(
                        'INSERT INTO behavioral_events (user_id, event_type, product_id, metadata) VALUES (?, ?, ?, ?)',
                        [userId, 'purchase', prodId, JSON.stringify({ orderId, quantity: item.quantity, size: itemSize })]
                    );
                } catch {
                    // Ignore event log failures
                }
            }

            // 3. Clear user's cart
            await connection.execute('DELETE FROM cart_items WHERE user_id = ?', [userId]);

            await connection.commit();
            connection.release();

            return {
                status: 201,
                jsonBody: {
                    success: true,
                    orderId,
                    orderNumber: `ORD-${String(orderId).padStart(6, '0')}`,
                    totalAmount,
                    status: 'Confirmed',
                    message: 'Order created successfully'
                }
            };
        } catch (error) {
            await connection.rollback();
            connection.release();
            context.error('[Orders API] Error creating order:', error);
            return {
                status: 500,
                jsonBody: { success: false, error: 'Failed to create order', details: error.message }
            };
        }
    }
});
