import { Debug, decorator, guide, ui } from "zest";
const { zestClass, template, bundle } = decorator;

@zestClass('GameGuide')
@template("./GuideView")
@bundle("guide")
export class GameGuide extends ui.GuideWindow {
    
    onLoad() {
        guide.manager.setGuideFile(this.getGuideAsset(guide.group));
    }
}


