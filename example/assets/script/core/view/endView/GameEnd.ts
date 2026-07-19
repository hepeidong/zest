import { excel, Debug, app, decorator, ui } from "zest";
import { ModelEnum } from "../../ModelEnum";
import { BattleModel } from "../../model/BattleModel";
import { GameEndView } from "./GameEndView";

const {zestClass, template, bundle} = decorator;


@zestClass("GameEnd")
@template("EndView")
@bundle("end")
export class GameEnd extends ui.GameWindow<GameEndView> {

    private _battleModel: BattleModel;
    onCreate() {
        this._battleModel = app.game.getModel(ModelEnum.BattleModel);
        return ui.Type.DIALOG_LAYER;  
    }

    onStart(isWin: boolean) {
        this.view.tip.string = isWin ? "靓仔，你赢了喔！！！" : "叼毛，你输啦！！！";
        //赢了就过关
        if (isWin) {
            if (this._battleModel.data.gameLevel < excel.file.GameLevel.length) {
                this._battleModel.data.gameLevel++;
                this._battleModel.save();
            }
        }
    }
}