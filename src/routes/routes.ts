import { renderView } from "../core/BaseViewModel";
import { AppViewModel } from "../components/AppViewModel";
import { UserListViewModel } from "../components/UserListViewModel";
import { NotFoundViewModel } from "../components/NotFoundViewModel";
import { logPathMiddleware } from "../middlewares/middlewares";

/**
 * Route configuration interface
 */
export interface RouteConfig {
  path: string;
  handler: (context: PageJS.Context) => void;
  middleware?: ((context: PageJS.Context, next: () => void) => void)[];
}

/**
 * Global middleware applied to all routes
 */
export const globalMiddleware = [
  logPathMiddleware
];

/**
 * Application routes configuration
 */
export const routes: RouteConfig[] = [
  {
    path: "/",
    handler: (context) => renderView(AppViewModel, context)
  },
  {
    path: "/users",
    handler: (context) => renderView(UserListViewModel, context)
  },
  {
    // Catch-all route for 404 pages
    path: "*",
    handler: () => renderView(NotFoundViewModel)
  }
];

/**
 * Helper function to register all routes with page.js
 * 
 * @param page - The page.js instance
 */
export const registerRoutes = (page: PageJS.Static): void => {
  // Register global middleware
  globalMiddleware.forEach(middleware => {
    page("*", middleware);
  });

  // Register all routes
  routes.forEach(route => {
    if (route.middleware && route.middleware.length > 0) {
      // If route has specific middleware, register it
      page(route.path, ...route.middleware, route.handler);
    } else {
      // Otherwise just register the route handler
      page(route.path, route.handler);
    }
  });

  // Start page.js
  page();
};