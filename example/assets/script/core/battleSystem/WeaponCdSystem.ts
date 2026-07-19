import { IEntity, app, decorator, ecs } from "zest";
import { NpcType } from "../../lib/NpcTypeEnum";
import { ModelEnum } from "../ModelEnum";
import { BattleModel } from "../model/BattleModel";
import { FineEnemySystem } from "./FineEnemySystem";
import { DataType, HeroWeapon, NpcIdentity } from "./dataType";

const {zestClass, updateBefore} = decorator;

interface IWeaponCdEntity extends IEntity {
    NpcIdentity: NpcIdentity;
    HeroWeapon: HeroWeapon;
}


@zestClass("WeaponCdSystem")
@updateBefore(FineEnemySystem)
export class WeaponCdSystem extends ecs.System<IWeaponCdEntity> {

    private _flag: boolean;
    private _cdEnd: boolean;
    private _timeout: number;
    private _statusModel: BattleModel;
    protected onCreate(): void {
        this._flag = false;
        this._cdEnd = false;
        this._timeout = 0;
        this._statusModel = app.game.getModel(ModelEnum.BattleModel);
    }

    private executeWeaponCd(dt: number, entity: IWeaponCdEntity, index: number) {
        if (index === 0) {
            this._cdEnd = this._flag;
        }
        if (this._cdEnd) {
            const die = entity.NpcIdentity.die;
            if (entity.NpcIdentity.identity === NpcType.Enemy && !die) {
                if (!entity.hasComponent(DataType.ActivateEnemy)) {
                    entity.addComponent(DataType.ActivateEnemy);
                }
            }
            else if (entity.NpcIdentity.identity === NpcType.Hero && !die) {
                if (!entity.hasComponent(DataType.FindEnemy)) {
                    entity.addComponent(DataType.FindEnemy);
                }
            }
        }
        else {
            if (entity.NpcIdentity.identity === NpcType.Hero) {
                if (this._timeout < entity.HeroWeapon.cd) {
                    this._timeout += dt;
                }
                else {
                    this._flag = true;
                }
            }
        }
    }

    protected onUpdate(dt: number): void {
        this.matcher.withAll(DataType.NpcIdentity)
        .withAny(DataType.HeroWeapon, DataType.EnemyWeapon)
        .forEach((entity, index) => {
            if (this._statusModel.gameStarted()) {
                this.executeWeaponCd(dt, entity, index);
            }
        }).end(() => {
            if (this._cdEnd) {
                this._flag = false;
                this._timeout = 0;
            }
        });
    }
}