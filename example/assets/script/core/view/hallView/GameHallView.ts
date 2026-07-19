import { _decorator, Node } from 'cc';
import { app, Debug, ui } from "zest";
import { SceneEnum } from '../../SceneEnum';
import { UIEnum } from '../../UIEnum';
const { ccclass, property } = _decorator;

@ccclass('GameHallView')
export class GameHallView extends ui.GameLayout {

    @property(Node)
    private bg: Node = null;


    onLoad(): void {
        
    }

    start() {
       
    }

    public showBg(node: Node) {
        this.bg.addChild(node);
    }

    onGuideTest() {
        ui.open(UIEnum.GuideTest1);
    }

    onStartBattle() {
        app.game.sceneManager.setScene(SceneEnum.InterimScene, UIEnum.GameBattle, SceneEnum.BattleScene);
    }

    update(deltaTime: number) {
        
    }
}


