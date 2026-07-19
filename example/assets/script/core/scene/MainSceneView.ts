import { _decorator, Component, Node } from 'cc';
import { app } from "zest";
import { ProgressBar } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MainSceneView')
export class MainSceneView extends app.BaseLayout {

    @property(ProgressBar)
    private loadProgres: ProgressBar = null;

    start() {

    }

    public updateProgress(progress: number) {
        this.loadProgres.progress = progress;
    }

    update(deltaTime: number) {
        
    }
}


