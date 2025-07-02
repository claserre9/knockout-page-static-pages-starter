import page from "page";
import { getServiceRegistry } from "./services/ServiceRegistry";
import { registerRoutes } from "./routes/routes";

// Initialize services
const initializeServices = async () => {
  try {
    await getServiceRegistry('/api').initialize();
    console.log('Services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
  }
};

// Initialize services when the application starts
initializeServices();

// Register all routes from the centralized configuration
registerRoutes(page);
