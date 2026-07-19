import { excel, app, decorator, tools } from "zest";
import { EventType } from "../EventType";

const {zestClass, model, prop} = decorator;

class BattleData {
    gameStart: boolean = false;
    gameEnd: boolean = false;
    killsCount: number = 0;
    currentKillsCount: number = 0;
    battleTime: number = 0;
    enemyUpdateTime: number = 0;
    //加上这个装饰则能把数据保存起来
    @prop
    /**游戏关卡 */
    gameLevel: number = 1;
    enemyAttack: number = 0;
    enemyHP: number = 0;
}

@zestClass("BattleModel")
@model(BattleData)
export class BattleModel extends app.Document<BattleData> {
    
    private _timeCount: number;
    private _timerId: string;
    private _refreshTimerId: string;
    onCreate(): void {
        this._timeCount = 0;
        const localData = excel.file.GameLevel.get(this.data.gameLevel);
        this.data.gameStart = true;
        this.data.gameEnd = false;
        this.data.killsCount = localData.killsCount;
        this.data.enemyAttack = localData.attack;
        this.data.enemyHP = localData.HP;
        this.data.battleTime = excel.file.Const.get("battleTime").value;
        this.data.enemyUpdateTime = excel.file.Const.get("enemyUpdateTime").value;
    }

    public battleEnd() {
        this.data.gameEnd = true;
        tools.Timer.clearTimeout(this._timerId);
        tools.Timer.clearTimeout(this._refreshTimerId);
        this._timerId = "";
        this._refreshTimerId = "";
        this._timeCount = 0;
    }

    public updateKillsCount(count: number) {
        this.data.currentKillsCount += count;
        if (this.data.currentKillsCount >= this.data.killsCount) {
            this.battleEnd();
        }
        this.sendNotice(EventType.UPDATE_KILLS_COUNT, this.data.currentKillsCount);
    }

    public startBattle() {
        this._timerId = tools.Timer.setTimeout(() => {
            this._timeCount++;
            this.sendNotice(EventType.UPDATE_BATTLE_TIME, this.data.battleTime - this._timeCount);
            if (this._timeCount >= this.data.battleTime) {
                this.battleEnd();
                this.sendNotice(EventType.BATTLE_END);
            }
        }, 1);
        this.refreshEnemy();
    }

    private refreshEnemy() {
        this._refreshTimerId = tools.Timer.setTimeout(() => {
            if (this.gameStarted()) {
                this.sendNotice(EventType.REFRESH_ENEMY);
            }
        }, this.data.enemyUpdateTime)
    }

    /**当游戏未开始或结束时，返回false， 反之则为true*/
    public gameStarted() {
        return this.data.gameStart && !this.data.gameEnd;
    }
}