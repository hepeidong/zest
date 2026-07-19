import { app, decorator, ui } from "zest";
import { CameraPool } from "../CameraPool";
import { UIEnum } from "../UIEnum";

const {zestClass, template} = decorator;

@zestClass("BattleScene")
@template("battle")
export class BattleScene extends app.Scene {
    
    onCreate() {
        return app.SceneType.Normal;
    }

    onStart() {
        ui.openTouchEffect(false);
        ui.open(UIEnum.GameBattle);
    }

    onEnd() {
        CameraPool.instance.removeMoveCameraAll();
    }
}