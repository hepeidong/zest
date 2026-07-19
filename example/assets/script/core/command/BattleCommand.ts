import { app, Debug, decorator } from "zest";
import { ModelEnum } from "../ModelEnum";
import { BattleModel } from "../model/BattleModel";

const {zestClass} = decorator;

@zestClass("BattleCommand")
export class BattleCommand extends app.Command {
    execute(notification: INotification): void {
        const model = app.game.getModel<BattleModel>(ModelEnum.BattleModel);
        Debug.log("Run battle command.");
        model.startBattle();
    }
}