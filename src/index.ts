import page from "page";
import {renderView} from "./core/BaseViewModel";
import {AppViewModel} from "./components/AppViewModel";
import {NotFoundViewModel} from "./components/NotFoundViewModel";
import {UserListViewModel} from "./components/UserListViewModel";
import {logPathMiddleware} from "./middlewares/middlewares";
import {getServiceRegistry} from "./services/ServiceRegistry";

const BASE_PATH = "/";

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

page("*", logPathMiddleware);
page(BASE_PATH, (context) => renderView(AppViewModel, context));
page("/users", (context) => renderView(UserListViewModel, context));
page("*", () => renderView(NotFoundViewModel));

page();
