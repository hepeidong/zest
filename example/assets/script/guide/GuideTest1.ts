import { decorator, ui } from "zest";
import { GuideTest1View } from "./GuideTest1View";

const {zestClass, template, bundle} = decorator;

@zestClass("GuideTest1")
@template("GuideTest1")
@bundle("guide")
export class GuideTest1 extends ui.GameWindow<GuideTest1View> {

    onCreate() {
        return ui.Type.DIALOG_LAYER;
    }
}