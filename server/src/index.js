// StyleSphere Azure Functions v4 Application Entrypoint
// Explicitly registers all HTTP function triggers

require('./functions/login');
require('./functions/register');
require('./functions/products');
require('./functions/cart');
require('./functions/orders');
require('./functions/recommendations');

console.log('[StyleSphere API] All Azure Functions v4 endpoints registered.');
