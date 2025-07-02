import {applyBindings, cleanNode, dataFor} from "knockout";

export class BaseViewModel {
    public template: string | null = null;
    public context: PageJS.Context | undefined;
    public selector: string | null = null;
    public isSubTemplate = false;
    public templateName = "";

    constructor(context: PageJS.Context | undefined = undefined) {
        this.context = context;
        this.templateName = this.constructor.name;
    }

    /**
     * Renders the view into the specified container.
     *
     * @param selector - The container's ID or selector where the view should be rendered.
     * @param context - The application context to use during rendering.
     * @returns The instance of BaseViewModel to allow method chaining.
     */
    public render(selector = "app", context: PageJS.Context | undefined = undefined): this {
        this.selector = selector;
        this.setContext(context);
        this.loadTemplate(selector);
        return this;
    }

    /**
     * Sets the template and renders it in the specified container.
     *
     * @param template - The template HTML to render.
     * @param context - The application context to use during rendering.
     * @param selector - The container's ID or selector where the template should be rendered.
     * @returns The instance of BaseViewModel to allow method chaining.
     */
    public renderTemplate(template: string | null, context: PageJS.Context | undefined = undefined, selector = "app"): this {
        this.setTemplate(template);
        return this.render(selector, context);
    }

    /**
     * Destroys the view by cleaning up bindings and removing child elements from the container.
     */
    public destroy(): void {
        if (!this.selector) {
            console.error("Selector is not defined. Unable to destroy the view.");
            return;
        }

        const element = document.getElementById(this.selector);
        if (element) {
            cleanNode(element);
            element.innerHTML = ""; // Clear all child nodes
        } else {
            console.error(`Element with ID "${this.selector}" not found.`);
        }
    }

    /**
     * Sets the context for the view.
     *
     * @param context - The application context.
     * @returns The instance of BaseViewModel to allow method chaining.
     */
    public setContext(context: PageJS.Context | undefined): this {
        this.context = context;
        return this;
    }

    /**
     * Gets the current context of the view.
     */
    public getContext(): PageJS.Context | undefined {
        return this.context;
    }

    /**
     * Sets the template for the view.
     *
     * @param template - The template HTML.
     * @returns The instance of BaseViewModel to allow method chaining.
     */
    public setTemplate(template: string | null): this {
        this.template = template;
        this.injectTemplateScript();
        return this;
    }

    /**
     * Called after the template has been rendered into the container.
     * Can be overridden by subclasses for custom behavior.
     */
    protected onTemplateRendered(): void {
    }

    /**
     * Loads the template into the specified container and applies Knockout bindings.
     *
     * @param selector - The container's ID or selector where the template should be rendered.
     */
    private loadTemplate(selector: string): void {
        const initializeContainer = (container: HTMLElement): void => {
            if (typeof this.template === "string") {
                cleanNode(container);
                container.innerHTML = this.template;
                applyBindings(this, container);
                this.onTemplateRendered();
            } else {
                console.warn("Template is not a string. Skipped rendering.");
            }
        };

        let container = document.getElementById(selector);
        if (!container) {
            container = document.createElement("div");
            container.id = selector;
            document.body.appendChild(container);
        }

        initializeContainer(container);
    }

    renderHtml(): string {
        if (typeof this.template === "string") {
            const container = document.createElement("div");
            container.innerHTML = this.template;
            cleanNode(container);
            applyBindings(this, container);
            this.onTemplateRendered();
            this.isSubTemplate = true;
            return container.innerHTML;
        } else {
            console.warn("Template is not a string. Skipped rendering.");
            return "";
        }
    }

    injectTemplateScript(): void {
        // Check if a script with the same templateName already exists
        if (document.getElementById(this.templateName)) {
            console.warn(`Template with id '${this.templateName}' already exists.`);
            return;
        }

        const scriptElement = document.createElement("script");
        scriptElement.type = "text/html"; // Knockout expects this type
        scriptElement.id = this.templateName; // Unique template name
        scriptElement.innerHTML = this.template ?? ""; // Template content
        document.body.appendChild(scriptElement); // Append to body
    }

    buildTemplateScript(): string {
        return `<script type="text/html" id="${this.templateName}">${this.template ?? ""}</script>`;
    }

}

/**
 * A utility function to render a given ViewModel into the DOM.
 *
 * @param ViewModel - The constructor for the ViewModel class.
 * @param context - The application context to pass to the ViewModel.
 */
export const renderView = (ViewModel: new (context?: PageJS.Context) => BaseViewModel, context?: PageJS.Context): void => {
    const viewModel = new ViewModel(context);
    viewModel.render();
};

/**
 * Retrieves the Knockout observable data linked to a DOM element.
 *
 * @param selector - The ID of the element to retrieve data from.
 * @returns The associated observable data or `null` if the element is not found.
 */
export const getViewModelFromElement = (selector: string) => {
    const element = document.querySelector(selector);
    return element ? dataFor(element) : null;
};
