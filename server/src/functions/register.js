const { app } = require('@azure/functions');
const authService = require('../services/authService');

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
