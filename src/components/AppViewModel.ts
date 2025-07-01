import {BaseViewModel} from "../core/BaseViewModel";
import {observable, pureComputed} from "knockout";

export class AppViewModel extends BaseViewModel{

    constructor(context: PageJS.Context | undefined) {
        super(context);
        this.setTemplate(`<h1>App</h1>`);
    }
 }
