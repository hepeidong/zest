import { app, decorator, ui } from "zest";
import { InterimSceneView } from "./InterimSceneView";

const {zestClass, template} = decorator;

@zestClass("InterimScene")
@template("interim")
export class InterimScene extends app.Scene<InterimSceneView> {

    onCreate() {
        return app.SceneType.Interim;
    }

    onStart(accessId: string, sceneName: string) {
        ui.load(accessId, progress => {
            this.view.updateProgress(progress);
        }, () => {
            this.manager.setScene(sceneName, accessId);
        });
    }
}