import { Vec3 } from "cc";
import { app, Debug, decorator, Direction, ecs, IEntity, tools, utils } from "zest";
import { RockingModel } from "../model/RockingModel";
import { ModelEnum } from "../ModelEnum";
import { DataType, AttackTarget, NpcIdentity, HeroWeapon } from "./dataType";
import { MoveSystem } from "./MoveSystem";
import { NpcType } from "../../lib/NpcTypeEnum";
import { Hero } from "../view/battleView/Hero";

const {zestClass, updateInGroup, updateAfter} = decorator;

interface ICurrentEntity extends IEntity {
    NpcIdentity: NpcIdentity;
    AttackTarget: AttackTarget;
    HeroWeapon: HeroWeapon;
}

const LEFT_DIR = [
    Direction.Type.North,
    Direction.Type.South,
    Direction.Type.Northwest,
    Direction.Type.West,
    Direction.Type.Southwest
];
const RIGHT_DIR = [
    Direction.Type.North,
    Direction.Type.South,
    Direction.Type.Northeast,
    Direction.Type.East,
    Direction.Type.Southeast
];

let CACHE_DISTANCE = 20000;
const _vec3Temp = new Vec3();
const _vec3EnemyTemp = new Vec3();

@zestClass("FineEnemySystem")
@updateInGroup(ecs.SimulationGroup)
@updateAfter(MoveSystem)
export class FineEnemySystem extends ecs.System<ICurrentEntity> {

    private _found: boolean;
    private _heroId: string;
    private _attackDistance: number;
    private _rockingModel: RockingModel;
    protected onCreate(): void {
        this._found = false;
        this._rockingModel = app.game.getModel(ModelEnum.RockingModel);
    }

    private findEnemy(entity: ICurrentEntity) {
        if (LEFT_DIR.indexOf(this._rockingModel.data.direction) > -1) {
            const angle = utils.MathUtil.Vector2D.rotationAngle(entity.node.position, this._rockingModel.data.heroPos);
            const direction = tools.Direction.getDirection(angle);
            if (LEFT_DIR.indexOf(direction) > -1) {
                this.findIndex(entity);
            }
        }
        else if (RIGHT_DIR.indexOf(this._rockingModel.data.direction) > -1) {
            const angle = utils.MathUtil.Vector2D.rotationAngle(entity.node.position, this._rockingModel.data.heroPos);
            const direction = tools.Direction.getDirection(angle);
            if (RIGHT_DIR.indexOf(direction) > -1) {
                this.findIndex(entity);
            }
        }
    }

    private findIndex(entity: ICurrentEntity,) {
        const distance = utils.MathUtil.Vector2D.distance(entity.node.position, this._rockingModel.data.heroPos);
        if (distance < CACHE_DISTANCE) {
            this._found = true;
            CACHE_DISTANCE = distance;
            _vec3EnemyTemp.set(entity.node.position.x, entity.node.position.y);
        }
    }

    private addWeapon() {
        const angle = utils.MathUtil.Vector2D.rotationAngle(_vec3EnemyTemp, this._rockingModel.data.heroPos);
        const radian = utils.MathUtil.Vector2D.radian(angle);
        const x = Math.cos(radian) * this._attackDistance + this._rockingModel.data.heroPos.x;
        const y = Math.sin(radian) * this._attackDistance + this._rockingModel.data.heroPos.y;
        _vec3Temp.set(x, y);
        const hero = this.matcher.getEntityById(this._heroId);
        if (hero) {
            //增加战斗组件
            hero.addComponent(DataType.AttackTarget);
            hero.AttackTarget.target = _vec3Temp;
            hero.removeComponent(DataType.FindEnemy); 
            hero.node.getComponent(Hero).rotationGun(angle);
        }
    }

    protected onUpdate(dt: number): void {
        this.matcher
        .withAll(DataType.NpcIdentity)
        .withAny(DataType.FindEnemy, DataType.ActivateEnemy)
        .forEach(entity => {
            if (entity.NpcIdentity.identity === NpcType.Enemy) {
                entity.removeComponent(DataType.ActivateEnemy);
                if (!entity.NpcIdentity.die) {
                    this.findEnemy(entity);
                }
            }
            else if (entity.NpcIdentity.identity === NpcType.Hero) {
                this._attackDistance = entity.HeroWeapon.attackDistance;
                this._heroId = entity.ID;
            }
        }).end(() => {
            if (this._found) {
                this.addWeapon();
            }
            this._found = false;
            CACHE_DISTANCE = 20000;
        });
    }
}