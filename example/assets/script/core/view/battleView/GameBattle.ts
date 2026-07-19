import { Prefab } from "cc";
import { app, Debug, decorator, ecs, IAssetRegister, IRegister, ui } from "zest";
import { CommandEnum } from "../../CommandEnum";
import { GameBattleView } from "./GameBattleView";
import { EventType } from "../../EventType";
import { BulletData } from "./BattleDefine";
import { ModelEnum } from "../../ModelEnum";
import { HeroModel } from "../../model/HeroModel";
import { DataType } from "../../battleSystem/dataType";
import { UIEnum } from "../../UIEnum";
import { BattleModel } from "../../model/BattleModel";

const {zestClass, template, bundle} = decorator;

@zestClass("GameBattle")
@bundle("battle")
@template("./battleView/BattleView")
export class GameBattle extends ui.GameWindow<GameBattleView> {

    listAssetUrls(assetRegister: IAssetRegister) {
        assetRegister.addFilePath("./battleMap/battle0");
        assetRegister.addDirPath("./spine/enemy");
        assetRegister.addFilePath("./spine/hero/Hilda");
        assetRegister.addFilePath("./spine/weapon/Hilda_gun");
        assetRegister.addFilePath("./spine/animation/fx_arise");
    }

    onCreate(register: IRegister): number {
        register.reg(EventType.HERO_GUN_FIRE, this.gunFire, this);
        register.reg(EventType.UPDATE_HP, this.updateHp, this);
        register.reg(EventType.UPDATE_KILLS_COUNT, this.updateKillsCount, this);
        register.reg(EventType.UPDATE_BATTLE_TIME, this.updateBattleTime, this);
        register.reg(EventType.BATTLE_END, this.battleEnd, this);
        register.reg(EventType.REFRESH_ENEMY, this.refreshEnemy, this);
        register.addCommand(CommandEnum.RockingCommand);
        register.addCommand(CommandEnum.BattleCommand);
        return ui.Type.ROOT_LAYER;
    }

    onLoad(): void {
        //对ECS世界初始化，把组件数据枚举对象和组件数据枚举长度初始化给世界，以准备后续构造实体时使用
        ecs.initializetion(DataType, DataType.total);
    }

    private _battleModel: BattleModel;
    onStart(...args: any[]): void {
        this.view.setMap(this.getGameAsset("battle0", Prefab));
        const model: HeroModel = app.game.getModel(ModelEnum.HeroModel);
        this.view.updateHpProgress(model.data.currentHp / model.data.hp);
        this._battleModel = app.game.getModel(ModelEnum.BattleModel);
        this.view.initBattleInfo(this._battleModel.data.killsCount, this._battleModel.data.gameLevel);
        this.updateKillsCount(0);
    }

    onClose() {
        //游戏结束后，离开当前页面时一定要销毁世界，否则ecs仍然在运行中
        ecs.destroyWorld();
        app.game.removeModel(ModelEnum.BattleModel);
        app.game.removeModel(ModelEnum.HeroModel);
        app.game.removeModel(ModelEnum.RockingModel);
    }

    private gunFire(body: BulletData) {
        this.view.gunFire(body.worldPos, body.type, body.time, body.toPos);
    }

    private updateHp(currentHp: number) {
        const model: HeroModel = app.game.getModel(ModelEnum.HeroModel);
        this.view.updateHpProgress(currentHp / model.data.hp);
    }

    private updateKillsCount(count: number) {
        this.view.updateKillsCount(count, this._battleModel.data.killsCount);
    }

    private updateBattleTime(time: number) {
        this.view.updateBattleTime(time);
    }

    private battleEnd() {
        ui.open(UIEnum.GameEnd, false);
    }

    private refreshEnemy() {
        this.view.refreshEnemy();
    }
}