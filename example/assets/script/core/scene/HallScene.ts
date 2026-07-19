import { app, decorator, guide, ui } from "zest";
import { UIEnum } from "../UIEnum";

const {zestClass, template} = decorator;

@zestClass("HallScene")
@template("hall")
export class HallScene extends app.Scene {

    onCreate() {
        return app.SceneType.Normal;
    }

    onStart() {
        guide.manager.syncGuideGroup(guide.group.TestGroup);
        ui.openTouchEffect(true);
        ui.open(UIEnum.GameHall);
    }
}