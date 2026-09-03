const { app } = require('@azure/functions');
const db = require('../config/db');

// Helper to assemble product with sizes
async function fetchProductsWithSizes(whereClause = '', params = []) {
    const query = `
        SELECT 
            p.id,
            p.name,
            p.gender,
            c.name AS category,
            t.name AS theme,
            CAST(p.price AS DOUBLE) AS price,
            CAST(p.original_price AS DOUBLE) AS originalPrice,
            p.discount,
            p.image,
            CAST(p.rating AS DOUBLE) AS rating,
            p.reviews,
            p.description,
            p.details,
            p.materials,
            p.care,
            p.ai_insight AS aiInsight,
            GROUP_CONCAT(s.size_name ORDER BY s.id SEPARATOR ',') AS sizes_csv
        FROM products p
        JOIN categories c ON p.category_id = c.id
        LEFT JOIN themes t ON p.theme_id = t.id
        LEFT JOIN product_sizes ps ON p.id = ps.product_id
        LEFT JOIN sizes s ON ps.size_id = s.id
        ${whereClause ? `WHERE ${whereClause}` : ''}
        GROUP BY p.id
        ORDER BY p.id ASC
    `;

    const [rows] = await db.execute(query, params);

    return rows.map(r => ({
        id: r.id,
        name: r.name,
        gender: r.gender,
        category: r.category,
        theme: r.theme || undefined,
        price: Number(r.price),
        originalPrice: Number(r.originalPrice),
        discount: Number(r.discount),
        image: r.image,
        rating: Number(r.rating),
        reviews: Number(r.reviews),
        description: r.description,
        sizes: r.sizes_csv ? r.sizes_csv.split(',') : ['S', 'M', 'L'],
        details: r.details || '',
        materials: r.materials || '',
        care: r.care || '',
        aiInsight: r.aiInsight || ''
    }));
}

// GET /api/products
app.http('getProducts', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'products',
    handler: async (request, context) => {
        try {
            const gender = request.query.get ? request.query.get('gender') : request.query.gender;
            const category = request.query.get ? request.query.get('category') : request.query.category;
            const theme = request.query.get ? request.query.get('theme') : request.query.theme;
            const search = request.query.get ? request.query.get('search') : request.query.search;

            const conditions = [];
            const params = [];

            if (gender && gender !== 'all') {
                conditions.push('p.gender = ?');
                params.push(gender.toLowerCase());
            }

            if (category && category !== 'All') {
                conditions.push('c.name = ?');
                params.push(category);
            }

            if (theme && theme !== 'All') {
                conditions.push('t.name = ?');
                params.push(theme);
            }

            if (search) {
                conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
                params.push(`%${search}%`, `%${search}%`);
            }

            const whereClause = conditions.length > 0 ? conditions.join(' AND ') : '';
            const products = await fetchProductsWithSizes(whereClause, params);

            return {
                status: 200,
                jsonBody: {
                    success: true,
                    count: products.length,
                    products
                }
            };
        } catch (error) {
            context.error('[Products API] Error fetching products:', error);
            return {
                status: 500,
                jsonBody: {
                    success: false,
                    error: 'Failed to fetch products',
                    details: error.message
                }
            };
        }
    }
});

// GET /api/products/{id}
app.http('getProductById', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'products/{id}',
    handler: async (request, context) => {
        try {
            const id = request.params?.id;
            if (!id) {
                return {
                    status: 400,
                    jsonBody: { success: false, error: 'Product ID is required' }
                };
            }

            const products = await fetchProductsWithSizes('p.id = ?', [id]);

            if (products.length === 0) {
                return {
                    status: 404,
                    jsonBody: { success: false, error: 'Product not found' }
                };
            }

            return {
                status: 200,
                jsonBody: {
                    success: true,
                    product: products[0]
                }
            };
        } catch (error) {
            context.error(`[Products API] Error fetching product ${request.params?.id}:`, error);
            return {
                status: 500,
                jsonBody: {
                    success: false,
                    error: 'Failed to fetch product',
                    details: error.message
                }
            };
        }
    }
});
