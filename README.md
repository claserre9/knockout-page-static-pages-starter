# TypeScript Web Application Starter
A TypeScript-powered web application starter with modern tools and frameworks. This project uses Webpack for bundling, Sass for styling, and Knockout.js for a reactive UI framework. Features include optimized builds, PostCSS with Autoprefixer, ESLint integration for linting, and a development server for streamlined workflows.

### Key Features:
- **TypeScript 5.5.3**: Strongly typed JavaScript for scalability.
- **Webpack**: Modular builds with optimizations.
- **Sass**: Advanced styling support.
- **Knockout.js**: MVVM framework for dynamic UIs.
- **Development Server**: Live reloading and quick prototyping.
- **CSS Post-Processing**: Autoprefixer and CSS minimizer.
- **Code Quality**: ESLint and TypeScript linting.

### Scripts:
- **Start Development Server**: `npm run serve:dev`
- **Build for Development**: `npm run build:dev`
- **Start Production Server**: `npm run serve:prod`
- **Build for Production**: `npm run build`
- **Run Tests**: `npm test`

[//]: # (- **Deploy to GitHub Pages**: `npm run deploy`)

### Getting Started:
1. Clone the repository.
2. Install dependencies with `npm install`.
3. Start your development server with `npm run serve:dev`.
4. Run tests with `npm test`.

### Project Structure
- `src/core` contains reusable framework code such as `BaseViewModel`.
- `src/components` holds individual view models.
- `src/index.ts` configures routes and bootstraps the application.

### Adding New Views
1. Create a new view model extending `BaseViewModel` inside `src/components`.
2. Provide a template via `setTemplate()` or override `template`.
3. Register a route in `src/index.ts` that renders your view model.

This starter provides just enough structure to grow a Knockout application without locking you in. Use the patterns in `AppViewModel` as a guide for creating additional pages.
