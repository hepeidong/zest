import { app, Debug, decorator } from "zest";
import { NoticeType } from "../CommandEnum";
import { RockingModel } from "../model/RockingModel";
import { ModelEnum } from "../ModelEnum";

const {zestClass} = decorator;

@zestClass("RockingCommand")
export class RockingCommand extends app.Command {
    execute(notification: INotification): void {
        const model = app.game.getModel<RockingModel>(ModelEnum.RockingModel);
        if (notification.getType() === NoticeType.RockingCommand_rotation) {
            const angle = notification.getBody();
            model.setAngle(angle);
        }
        else if (notification.getType() === NoticeType.RockingCommand_stop) {
            model.setDirectionToNone();
        }
        else if (notification.getType() === NoticeType.RockingCommand_mapSize) {
            const size = notification.getBody();
            model.setMapSize(size.w, size.h);
        }
        else if (notification.getType() === NoticeType.RockingCommand_ragian) {
            const radian = notification.getBody();
            model.setRadian(radian);
        }
        else if (notification.getType() === NoticeType.RockingCommand_direction) {
            const direction = notification.getBody();
            model.setDirection(direction);
        }
    }
}