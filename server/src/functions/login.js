const { app } = require('@azure/functions');
const authService = require('../services/authService');

app.http('login', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'login',
    handler: async (request, context) => {
        context.log(`HTTP login trigger function processed request for URL: "${request.url}"`);

        try {
            // Parse JSON body safely
            let body;
            try {
                body = await request.json();
            } catch (err) {
                return {
                    status: 400,
                    jsonBody: { error: 'Invalid JSON request body' }
                };
            }

            const { email, password } = body;

            if (!email || !password) {
                return {
                    status: 400,
                    jsonBody: { error: 'Email and password fields are required' }
                };
            }

            const result = await authService.login(email, password);

            if (result.success) {
                return {
                    status: 200,
                    jsonBody: {
                        token: result.token,
                        user: result.user
                    }
                };
            } else {
                return {
                    status: 401,
                    jsonBody: { error: result.error }
                };
            }
        } catch (error) {
            context.error('Error occurred in login handler:', error);
            
            // Graceful handling of database connection issues
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ER_ACCESS_DENIED_ERROR') {
                return {
                    status: 503,
                    jsonBody: { 
                        error: 'Database connection failed. Please verify that your MySQL server is running and credentials in local.settings.json are correct.',
                        details: error.message
                    }
                };
            }

            return {
                status: 500,
                jsonBody: { error: 'Internal server error' }
            };
        }
    }
});

app.http('register', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'register',
    handler: async (request, context) => {
        try {
            let body;
            try {
                body = await request.json();
            } catch {
                return {
                    status: 400,
                    jsonBody: { success: false, error: 'Invalid JSON request body' }
                };
            }

            const { email, password, firstName, lastName } = body;

            if (!email || !password) {
                return {
                    status: 400,
                    jsonBody: { success: false, error: 'Email and password are required' }
                };
            }

            if (password.length < 6) {
                return {
                    status: 400,
                    jsonBody: { success: false, error: 'Password must be at least 6 characters long' }
                };
            }

            const result = await authService.register(email, password, firstName, lastName);

            if (result.success) {
                return {
                    status: 201,
                    jsonBody: {
                        success: true,
                        token: result.token,
                        user: result.user
                    }
                };
            } else {
                return {
                    status: 409,
                    jsonBody: { success: false, error: result.error }
                };
            }
        } catch (error) {
            context.error('[Register API] Error registering user:', error);
            return {
                status: 500,
                jsonBody: { success: false, error: 'Internal server error', details: error.message }
            };
        }
    }
});

