import { excel, Debug, IEntity, app, decorator, ecs, ui } from "zest";
import { NpcType } from "../../lib/NpcTypeEnum";
import { ModelEnum } from "../ModelEnum";
import { UIEnum } from "../UIEnum";
import { BattleModel } from "../model/BattleModel";
import { Enemy } from "../view/battleView/Enemy";
import { Hero } from "../view/battleView/Hero";
import { AttackSystem } from "./AttackSystem";
import { DataType, EnemyWeapon, HeroWeapon, NpcIdentity } from "./dataType";

const {zestClass, updateAfter} = decorator;

interface SettlementEntity extends IEntity {
    NpcIdentity: NpcIdentity;
    HeroWeapon: HeroWeapon;
    EnemyWeapon: EnemyWeapon;
}

@zestClass("SettlementSystem")
@updateAfter(AttackSystem)
export class SettlementSystem extends ecs.System<SettlementEntity> {

    private _attackCd: number;
    private _timeout: number;
    private _heroAttacked: boolean;
    private _heroId: string;
    private _attackedEmemyId: string;
    private _attackingEnemyId: string;
    private _battleModel: BattleModel;
    protected onCreate(): void {
        this._attackCd = excel.file.Const.get("attackCd").value;
        this._timeout = 0;
        this._heroAttacked = false;
        this._heroId = "";
        this._attackedEmemyId = "";
        this._attackingEnemyId = "";
        this._battleModel = app.game.getModel(ModelEnum.BattleModel);
    }

    private attackHero() {
        if (this._heroId.length > 0 && this._attackingEnemyId.length > 0) {
            const enemy = this.matcher.getEntityById(this._attackingEnemyId);
            const hero = this.matcher.getEntityById(this._heroId);
            this._attackingEnemyId = "";
            this._heroAttacked = false;
            //被敌人攻击
            hero.NpcIdentity.hp -= enemy.EnemyWeapon.attack;
            const heroObj = hero.node.getComponent(Hero);
            heroObj.updateHp(hero.NpcIdentity.hp);
            heroObj.setAttacked(false);
            if (hero.NpcIdentity.hp <= 0) {
                Debug.log("英雄死亡了");
                hero.NpcIdentity.die = true;
                this._battleModel.battleEnd();
                this._heroId = "";
                heroObj.die();
                ui.open(UIEnum.GameEnd, false);
            }
        }
    }

    private attack(dt: number) {
        if (this._heroAttacked) {
            this._timeout += dt;
            if (this._timeout >= this._attackCd) {
                this._timeout = 0;
                this.attackHero();
            }
        }
        else {
            if (this._heroId.length > 0 && this._attackedEmemyId.length > 0) {
                const enemy = this.matcher.getEntityById(this._attackedEmemyId);
                const hero = this.matcher.getEntityById(this._heroId);
                this._attackedEmemyId = "";
                //攻击敌人
                enemy.NpcIdentity.hp -= hero.HeroWeapon.attack;
                //击杀了敌人
                if (enemy.NpcIdentity.hp <= 0) {
                    enemy.NpcIdentity.die = true;
                    this._battleModel.updateKillsCount(1);
                    const enemyObj = enemy.node.getComponent(Enemy);
                    enemyObj.setAttacked(false);
                    enemyObj.die();
                    //游戏结束
                    if (this._battleModel.data.gameEnd) {
                        hero.node.getComponent(Hero).setAwait();
                        ui.open(UIEnum.GameEnd, true);
                    }
                }
            }
        }
    }

    protected onUpdate(dt: number): void {
        this.matcher.withAll(DataType.NpcIdentity).withAny(DataType.HeroWeapon, DataType.EnemyWeapon).forEach(entity => {
            if (entity.NpcIdentity.identity === NpcType.Enemy) {
                const enemy = entity.node.getComponent(Enemy);
                const attacked = enemy.getAttacked();
                const attacking = enemy.getAttacking();
                if (attacked) {
                    this._attackedEmemyId = entity.ID;
                }
                else if (attacking) {
                    this._attackingEnemyId = entity.ID;
                }
            }
            else if (entity.NpcIdentity.identity === NpcType.Hero) {
                this._heroId = entity.ID;
                this._heroAttacked = entity.node.getComponent(Hero).getAttacked();
            }
        }).end(() => {
            this.attack(dt);
        });
    }
}