// StyleSphere Local Dev Server
// Native Node.js HTTP server mapping Azure Functions v4 trigger handlers to port 7071.
// Bypasses the need for azure-functions-core-tools.

const http = require('http');
const fs = require('fs');
const path = require('path');
const Module = require('module');

// 1. Intercept require('@azure/functions') and redirect it to a local registry
const originalRequire = Module.prototype.require;
const httpFunctions = [];

Module.prototype.require = function (id) {
    if (id === '@azure/functions') {
        return {
            app: {
                http: (name, options) => {
                    const route = options.route || name;
                    // Build regex for route parameters like {id}
                    const paramNames = [];
                    const regexStr = '^/api/' + route
                        .replace(/\{([a-zA-Z0-9_]+)\}/g, (_, paramName) => {
                            paramNames.push(paramName);
                            return '([^/]+)';
                        }) + '$';
                    const regex = new RegExp(regexStr);

                    httpFunctions.push({
                        name,
                        options,
                        route,
                        regex,
                        paramNames
                    });
                    console.log(`[DevServer] Registered function trigger: "${name}" on route "/api/${route}"`);
                }
            }
        };
    }
    return originalRequire.apply(this, arguments);
};

// 2. Load environment settings from local.settings.json
try {
    const localSettings = require('./local.settings.json');
    if (localSettings.Values) {
        Object.entries(localSettings.Values).forEach(([key, val]) => {
            process.env[key] = val;
        });
        console.log('[DevServer] Environment values loaded from local.settings.json successfully.');
    }
} catch (err) {
    console.warn('[DevServer] Warning: local.settings.json not loaded, falling back to system environment.', err.message);
}

// 3. Dynamically import all function handlers in src/functions/
const functionsDir = path.join(__dirname, 'src', 'functions');
if (fs.existsSync(functionsDir)) {
    fs.readdirSync(functionsDir).forEach(file => {
        if (file.endsWith('.js')) {
            try {
                require(path.join(functionsDir, file));
                console.log(`[DevServer] Loaded function module: "${file}"`);
            } catch (err) {
                console.error(`[DevServer] Failed to load function trigger "${file}":`, err);
            }
        }
    });
}

// 4. Mock Azure Context object
const context = {
    log: (...args) => console.log('[Azure Log]', ...args),
    error: (...args) => console.error('[Azure Error]', ...args)
};

// 5. Create native HTTP server
const server = http.createServer(async (req, res) => {
    // Inject CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight CORS requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    let matchedEntry = null;
    let extractedParams = {};

    // Route matching with regex & parameter extraction
    for (const entry of httpFunctions) {
        const match = pathname.match(entry.regex);
        if (match) {
            // Check HTTP method
            const methods = entry.options.methods || ['GET'];
            if (methods.includes(req.method)) {
                matchedEntry = entry;
                entry.paramNames.forEach((name, index) => {
                    extractedParams[name] = decodeURIComponent(match[index + 1]);
                });
                break;
            }
        }
    }

    // If route path matched but method didn't match, or not matched at all
    if (!matchedEntry) {
        // Check if path matched with any method
        const pathMatched = httpFunctions.some(entry => entry.regex.test(pathname));
        if (pathMatched) {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Not Found: ${pathname}` }));
        }
        return;
    }

    // Read request body stream
    let bodyBuffer = '';
    req.on('data', chunk => {
        bodyBuffer += chunk;
    });

    req.on('end', async () => {
        // Mock Azure Functions HttpRequest object
        const queryMap = Object.fromEntries(url.searchParams.entries());
        const mockRequest = {
            url: req.url,
            method: req.method,
            headers: req.headers,
            params: extractedParams,
            query: {
                get: (key) => url.searchParams.get(key),
                ...queryMap
            },
            json: async () => {
                try {
                    return JSON.parse(bodyBuffer || '{}');
                } catch {
                    throw new Error('Invalid JSON');
                }
            },
            text: async () => bodyBuffer
        };

        try {
            const response = await matchedEntry.options.handler(mockRequest, context);
            
            res.writeHead(response?.status || 200, { 'Content-Type': 'application/json' });
            if (response?.jsonBody !== undefined) {
                res.end(JSON.stringify(response.jsonBody));
            } else if (response?.body !== undefined) {
                res.end(response.body);
            } else {
                res.end();
            }
        } catch (error) {
            console.error(`[DevServer] Error in execution of function "${matchedEntry.name}":`, error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                error: 'Internal Server Error',
                message: error.message 
            }));
        }
    });
});

const PORT = 7071;
server.listen(PORT, () => {
    console.log(`[DevServer] StyleSphere local dev server successfully started at http://localhost:${PORT}/`);
    console.log('[DevServer] Ready to accept API requests from frontend client!');
});
