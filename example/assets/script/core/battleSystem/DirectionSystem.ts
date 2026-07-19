import { director, sp, Vec3 } from "cc";
import { app, excel, Debug, decorator, Direction, ecs, IEntity, tools, utils } from "zest";
import { RockingModel } from "../model/RockingModel";
import { ModelEnum } from "../ModelEnum";
import { Enemy } from "../view/battleView/Enemy";
import { Hero } from "../view/battleView/Hero";
import { DataType, DirectionData, NpcIdentity, Position } from "./dataType";
import { NpcType } from "../../lib/NpcTypeEnum";
import { BattleModel } from "../model/BattleModel";

const {zestClass, updateInGroup} = decorator;

interface IDirectionEntity extends IEntity {
    Direction: DirectionData;
    Position: Position;
    NpcIdentity: NpcIdentity;
}


const _scaleTemp = new Vec3();

@zestClass("DirectionSystem")
@updateInGroup(ecs.SimulationGroup)
export class DirectionSystem extends ecs.System<IDirectionEntity> {

    private _statusModel: BattleModel;
    private _rockingModel: RockingModel;
    protected onCreate(): void {
        this._statusModel = app.game.getModel(ModelEnum.BattleModel);
        this._rockingModel = app.game.getModel(ModelEnum.RockingModel);
    }

    private getAnimation(direction: tools.Direction) {
        let animation: string = "";
        switch (direction) {
            case Direction.Type.East:
            case Direction.Type.North:
            case Direction.Type.Northeast:
            case Direction.Type.Northwest:
            case Direction.Type.West:
                return animation = "run02";
        
            case Direction.Type.Southeast:
            case Direction.Type.South:
            case Direction.Type.Southwest:
                return animation = "run03";
            default:
                break;
        }
        return animation;
    }

    private getScale() {
        let scale: number = 1;
        switch (this._rockingModel.data.direction) {
            case Direction.Type.West:
            case Direction.Type.Northwest:
            case Direction.Type.Southwest:
                scale = -1;
                break;
        
            default:
                break;
        }
        return scale;
    }

    private setEntityDirection(entity: IDirectionEntity, npcObject: Enemy|Hero, direction: Direction.Type, moveSpeed: number) {
        entity.Direction.direction = direction;
        if (direction !== Direction.Type.None) { 
            let animation: string = this.getAnimation(direction);
            if (animation.length > 0) {
                npcObject.setSpineAnimation(animation, true);
                const scaleX = this.getScale();
                _scaleTemp.set(scaleX, 1);
                entity.node.scale = _scaleTemp;
                if (!entity.hasComponent(DataType.Position)) {
                    entity.addComponent(DataType.Position);
                    entity.Position.speed = moveSpeed / director.root.fps;
                }
            }
        }
        else {
            if (entity.hasComponent(DataType.Position)) {
                entity.removeComponent(DataType.Position);
            }
            npcObject.setAwait();
        }
    }

    private updateDirection(entity: IDirectionEntity) {
        let npcObject: Enemy|Hero;
        const die = entity.NpcIdentity.die;
        if (entity.NpcIdentity.identity === NpcType.Enemy && !die) {
            let direction: Direction.Type = tools.Direction.getDirection(utils.MathUtil.Vector2D.rotationAngle(this._rockingModel.data.heroPos, entity.node.position));
            if (entity.Direction.direction !== direction) {
                npcObject = entity.node.getComponent(Enemy);
                if (npcObject.getContacted()) {
                    direction = Direction.Type.None;
                }
                const moveSpeed = excel.file.Const.get("enemyMoveSpeed").value;
                this.setEntityDirection(entity, npcObject, direction, moveSpeed);
            }
        }
        else if (entity.NpcIdentity.identity === NpcType.Hero && !die) {
            if (entity.Direction.direction !== this._rockingModel.data.direction) {
                npcObject = entity.node.getComponent(Hero);
                const moveSpeed = excel.file.Const.get("heroMoveSpeed").value;
                this.setEntityDirection(entity, npcObject, this._rockingModel.data.direction, moveSpeed);
            }
        }
    }

    protected onUpdate(dt: number): void {
        this.matcher
        .withAll(DataType.Direction, DataType.NpcIdentity)
        .forEach(entity => {
            if (this._statusModel.gameStarted()) {
                this.updateDirection(entity);
            }
        });
    }
}