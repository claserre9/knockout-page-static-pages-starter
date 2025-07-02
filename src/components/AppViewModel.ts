import {BaseViewModel} from "../core/BaseViewModel";

export class AppViewModel extends BaseViewModel{

    constructor(context: PageJS.Context | undefined) {
        super(context);
        this.setTemplate(`
            <div class="app-container">
                <h1>App</h1>
                <nav>
                    <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/users">Users</a></li>
                    </ul>
                </nav>
                <p>Welcome to the application. This is a demo of the service layer implementation.</p>
                <p>Click on the "Users" link to see the user list powered by the service layer.</p>
            </div>
        `);
    }
 }
