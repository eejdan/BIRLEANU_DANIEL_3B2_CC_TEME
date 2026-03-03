/**
 * RouteMapper object to register routes and method handlers.
 * @member mappedRoutes 
 */
class RouteMapper {
    static methods = ['get', 'post', 'put', 'delete', 'patch'];
    
    constructor() {
        this.mappedRoutes = [];
        this.defaultRoute = null;
        this.notFoundRoute = null;
    }
    
    /**
     * Register a route with a path, HTTP method, and handler function
     * @param {string} path - The route path (can include :param for dynamic segments)
     * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
     * @param {Function} handler - Handler function for the route
     */
    registerRoute(path, method, handler) {
        method = method.toLowerCase();
        
        // Convert path pattern to regex
        const paramNames = [];
        const pattern = path.replace(/:([^\/]+)/g, (match, paramName) => {
            paramNames.push(paramName);
            return '([^\\/]+)';
        });
        
        const regex = new RegExp(`^${pattern}$`);
        
        this.mappedRoutes.push({
            path,
            method,
            handler,
            regex,
            paramNames
        });
    }
    
    /**
     * Match a URI and method to a registered route
     * @param {string} uri - The request URI
     * @param {string} method - HTTP method
     * @returns {Object|null} - Matched route with handler and params, or null
     */
    match(uri, method) {
        method = method.toLowerCase();
        
        for (const route of this.mappedRoutes) {
            if (route.method === method) {
                const match = uri.match(route.regex);
                if (match) {
                    const params = {};
                    route.paramNames.forEach((name, index) => {
                        params[name] = match[index + 1];
                    });
                    
                    return {
                        handler: route.handler,
                        params,
                        path: route.path
                    };
                }
            }
        }
        
        return null;
    }
    
    /**
     * Convenience methods for registering routes
     */
    get(path, handler) {
        this.registerRoute(path, 'get', handler);
    }
    
    post(path, handler) {
        this.registerRoute(path, 'post', handler);
    }
    
    put(path, handler) {
        this.registerRoute(path, 'put', handler);
    }
    
    delete(path, handler) {
        this.registerRoute(path, 'delete', handler);
    }
    
    patch(path, handler) {
        this.registerRoute(path, 'patch', handler);
    }
}

module.exports = { RouteMapper };