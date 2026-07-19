import { app, Debug, decorator, excel, IRegister, ui } from "zest";
import { SceneEnum } from "../SceneEnum";
import { UIEnum } from "../UIEnum";
import { MainSceneView } from "./MainSceneView";

const {zestClass, template} = decorator;

@zestClass("MainScene")
@template("main")
export class MainScene extends app.Scene<MainSceneView> {

    onCreate(register: IRegister): number {
        return app.SceneType.Interim;
    }

    onLoad(): void {
        Debug.log("初始场景");
    }

    onStart(): void {
        //设加载配置表的进度占进度条四分之一
        let progress1 = 0;
        Debug.log("加载数据表");
        excel.loadJSONTable("/jsons", () => {
            Debug.log("数据表加载成功");
            progress1 += 0.1;
            this.view.updateProgress(progress1);
            if (progress1 >= 1) {
                this.manager.setScene(SceneEnum.HallScene);
            }
        });
        ui.load(UIEnum.GameGuide, progress => {
            progress1 += progress * 0.3;
            this.view.updateProgress(progress1);
        }, () => {
            Debug.log("引导资源加载完成");
        });
        ui.load(UIEnum.GameHall, progress => {
            progress1 += progress * 0.3;
            this.view.updateProgress(progress1);
        }, () => {
            if (progress1 >= 1) {
                this.manager.setScene(SceneEnum.HallScene);
            }
        });
        app.game.loadInitialAsset(progress => {
            progress1 += progress * 0.3;
            this.view.updateProgress(progress1);
        }).then(() => {
            if (progress1 >= 1) {
                this.manager.setScene(SceneEnum.HallScene);
            }
        });
    }
}