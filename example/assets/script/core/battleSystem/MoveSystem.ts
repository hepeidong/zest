import { Vec3 } from "cc";
import { app, Debug, decorator, Direction, ecs, IEntity, utils } from "zest";
import { RockingModel } from "../model/RockingModel";
import { ModelEnum } from "../ModelEnum";
import { DataType, DirectionData, NpcIdentity, Position } from "./dataType";
import { DirectionSystem } from "./DirectionSystem";
import { NpcType } from "../../lib/NpcTypeEnum";
import { BattleModel } from "../model/BattleModel";
import { CameraPool } from "../CameraPool";

const {zestClass, updateInGroup, updateAfter} = decorator;

const _vec3Temp = new Vec3();
const _vec3CameraTemp = new Vec3();

interface IMoveEntity extends IEntity {
    Direction: DirectionData;
    Position: Position;
    NpcIdentity: NpcIdentity;
}

@zestClass("MoveSystem")
@updateInGroup(ecs.SimulationGroup)
@updateAfter(DirectionSystem)
export class MoveSystem extends ecs.System<IMoveEntity> {

    private _battleModel: BattleModel;
    private _rockingModel: RockingModel;
    protected onCreate(): void {
        _vec3CameraTemp.set(0, 0);
        this._battleModel = app.game.getModel(ModelEnum.BattleModel);
        this._rockingModel = app.game.getModel(ModelEnum.RockingModel);
    }

    protected onStart(): void {
        
    }

    private getMoveDirection(direction: Direction.Type) {
        let x: number = 0, y: number = 0;
        switch (direction) {
            case Direction.Type.East:
                x = 1;
                break;

            case Direction.Type.Northeast:
                x = 1;
                y = 1;
                break;

            case Direction.Type.North:
                y = 1;
                break;

            case Direction.Type.Northwest:
                x = -1;
                y = 1;
                break;

            case Direction.Type.West:
                x = -1;
                break;

            case Direction.Type.Southwest:
                x = -1;
                y = -1;
                break;

            case Direction.Type.South:
                y = -1;
                break;

            case Direction.Type.Southeast:
                x = 1;
                y = -1;
                break;

            default:
                break;
        }
        return {x, y};
    }

    private setHeroEntityPosition(entity: IMoveEntity) {
        const result = this.getMoveDirection(entity.Direction.direction);
        if (this._rockingModel.data.angle === 90 || this._rockingModel.data.angle === 270) {
            entity.Position.y = entity.Position.speed * result.y;
        }
        else {
            const radian = this._rockingModel.data.radian;
            entity.Position.x = Math.abs(Math.cos(radian) * entity.Position.speed) * result.x;
            entity.Position.y = Math.abs(Math.sin(radian) * entity.Position.speed) * result.y;
        }
    }

    private setEnemyEntityPosition(entity: IMoveEntity) {
        const result = this.getMoveDirection(entity.Direction.direction);
        const tanValue = utils.MathUtil.Vector2D.getTanValue(entity.node.position, this._rockingModel.data.heroPos);
        if (tanValue !== -1) {
            const radian = Math.atan(Math.abs(tanValue));
            entity.Position.x = Math.abs(Math.cos(radian) * entity.Position.speed) * result.x;
            entity.Position.y = Math.abs(Math.sin(radian) * entity.Position.speed) * result.y;
        }
        else {
            entity.Position.y = entity.Position.speed * result.y;
        }
    }

    private boundariesX(x: number) {
        const mapWidth1 = this._rockingModel.data.mapSize.width / 2 - 60;
        const mapWidth2 = this._rockingModel.data.mapSize.width / 2 - app.adapter.getScreenSize().width / 2 - app.adapter.width;
        const mapBoundaries = x > -mapWidth1 && x < mapWidth1;
        const cameraBoundaries = x > -mapWidth2 && x < mapWidth2;
        return {mapBoundaries, cameraBoundaries};
    }

    private boundariesY(y: number) {
        const mapHeight1 = this._rockingModel.data.mapSize.height / 2 - 60;
        const mapHeight2 = this._rockingModel.data.mapSize.height / 2 - app.adapter.getScreenSize().height / 2 + app.adapter.height;
        const mapBoundaries = y > -mapHeight1 && y < mapHeight1;
        const cameraBoundaries = y > -mapHeight2 && y < mapHeight2;
        return {mapBoundaries, cameraBoundaries};
    }

    private moveEntity(entity: IMoveEntity) {
        _vec3Temp.set(entity.node.position.x, entity.node.position.y);
        if (entity.NpcIdentity.identity === NpcType.Hero) {
            this.setHeroEntityPosition(entity);
        }
        else {
            this.setEnemyEntityPosition(entity);
        }
        let mapFlag = false;
        let cameraFlag = false;
        //移动不能越过地图边界
        const resultX = this.boundariesX(_vec3Temp.x + entity.Position.x);
        const resultY = this.boundariesY(_vec3Temp.y + entity.Position.y);
        if (resultX.mapBoundaries) {
            mapFlag = true;
            _vec3Temp.x += entity.Position.x;
        }
        if (resultY.mapBoundaries) {
            mapFlag = true;
            _vec3Temp.y += entity.Position.y;
        }
        
        if (mapFlag) {
            entity.node.position = _vec3Temp;
            if (entity.NpcIdentity.identity === NpcType.Hero) {
                this._rockingModel.data.heroPos.set(entity.node.position.x, entity.node.position.y);
            }
        }
        if (entity.NpcIdentity.identity === NpcType.Hero) {
            if (resultX.cameraBoundaries) {
                cameraFlag = true;
                _vec3CameraTemp.x += entity.Position.x;
            }
            if (resultY.cameraBoundaries) {
                cameraFlag = true;
                _vec3CameraTemp.y += entity.Position.y;
            }
            if (cameraFlag) {
                const cameras = CameraPool.instance.moveCameras;
                for (const camera of cameras) {
                    camera.node.parent.position = _vec3CameraTemp;
                }
            }
        }
    }

    protected onUpdate(dt: number): void {
        this.matcher.withAll(DataType.Position, DataType.NpcIdentity).forEach(entity => {
            //游戏结束时，停止移动，停止了移动，基本战斗就停止了，因为后续组件数据没有了增加的条件
            if (this._battleModel.gameStarted()) {
                this.moveEntity(entity); 
            }
        });
    }
}