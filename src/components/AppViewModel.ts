import {BaseViewModel} from "../core/BaseViewModel";
import {observable, pureComputed} from "knockout";


export class AppViewModel extends BaseViewModel{
    public activeTab: KnockoutObservable<string> = observable('pass_gen');
    public content: KnockoutObservable<string> = observable('content');
    public title: KnockoutComputed<string> = pureComputed(
        () => {
            let title = 'Dev Tools';
            if (this.activeTab() == 'pass_gen') {
                title = 'Password Generator'
            }
            if (this.activeTab() == 'lorem_ipsum') {
                title = 'Lorem Ipsum'
            }
            return title
        });

    constructor(context: PageJS.Context | undefined) {
        super(context);
        this.setTemplate(`<h1>App</h1>`)
    }
}