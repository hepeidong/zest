import { Button, Node } from "cc";
import { IGuideTarget } from "../../lib.cck";
import { GuideType } from "../GuideEnum";
import { GuideManager } from "../GuideManager";
import { WidgetID } from "../WidgetID";

export class GuideTarget implements IGuideTarget {
    public target: Node = null;
    public targetId: string;
    public guideIds: string[];

    constructor() {
        this.guideIds = [];
    }

    public init() {
        this.target.attr({guideTouchRegist: false});
        this.targetId = this.target.getComponent(WidgetID).ID;
        const keysIterrator = GuideManager.instance.guideGroup.keys();
        const guideGroup = GuideManager.instance.guideGroup;
        let isFingerGuide: boolean = false;
        for (let k of keysIterrator) {
            const guideAction = guideGroup.get(k);
            for (const id of guideAction.targetId) {
                if (id === this.targetId) {
                    isFingerGuide = guideGroup.get(k).guideType === GuideType.FINGER;
                    break;
                }
            }
            if (isFingerGuide) {
                break;
            }
        }
        if (isFingerGuide) {
            let btn: Button = this.target.getComponent(Button);
            if (!btn) {
                this.target.addComponent(Button);
            }
        }
    }
}