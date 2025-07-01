import {BaseViewModel} from "../core/BaseViewModel";

export class AppViewModel extends BaseViewModel{

    constructor(context: PageJS.Context | undefined) {
        super(context);
        this.setTemplate(`<h1>App</h1>`);
    }
 }
