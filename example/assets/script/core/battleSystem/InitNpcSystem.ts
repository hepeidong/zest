import { Vec3 } from "cc";
import { app, excel, Debug, decorator, Direction, ecs, IBeginEntityCommandBufferSystem, IConversionSystem, IEntity, utils } from "zest";
import { RockingModel } from "../model/RockingModel";
import { Enemy } from "../view/battleView/Enemy";
import { Hero } from "../view/battleView/Hero";
import { DataType, DirectionData, EnemyWeapon, HeroWeapon, NpcEntity, NpcIdentity } from "./dataType";
import { ModelEnum } from "../ModelEnum";
import { NpcType } from "../../lib/NpcTypeEnum";
import { BattleModel } from "../model/BattleModel";

const {zestClass, updateInGroup} = decorator;

interface INewEntity extends IEntity {
    Direction: DirectionData;
    NpcIdentity: NpcIdentity;
    HeroWeapon: HeroWeapon;
    EnemyWeapon: EnemyWeapon;
}

const _vec3Temp = new Vec3();

/**
 * 初始化包括英雄角色在内的所有战斗场景NPC角色
 */
@zestClass("InitNpcSystem")
@updateInGroup(ecs.InitializationGroup)
export class InitNpcSystem extends ecs.System<NpcEntity> {

    private _rockingModel: RockingModel;
    private _battleModel: BattleModel;
    private _initializationCommandBuffer: IBeginEntityCommandBufferSystem;
    protected onCreate(): void {
        this._rockingModel = app.game.getModel(ModelEnum.RockingModel);
        this._battleModel = app.game.getModel(ModelEnum.BattleModel);
        this._initializationCommandBuffer = ecs.World.instance.getBeginCommandBuffer(ecs.World.CommandBuffer.InitializationCommandBuffer);
    }

    private getXY() {
        const x1 = this._rockingModel.data.heroPos.x + 70;
        const x2 = this._rockingModel.data.heroPos.x - 70;
        const y1 = this._rockingModel.data.heroPos.y + 80;
        const y2 = this._rockingModel.data.heroPos.y - 80;
        const w = this._rockingModel.data.mapSize.width / 2;
        const h = this._rockingModel.data.mapSize.height / 2;

        const intervalList = [];
        if (w - x1 >= 30) {
            const intervalX = {min: x1, max: w - 30};
            const intervalY = {min: 30 - h, max: h - 30};
            const interval = {intervalX, intervalY};
            intervalList.push(interval);
        }
        if (w + x2 >= 30) {
            const intervalX = {min: x2, max: 30 - w};
            const intervalY = {min: 30 - h, max: h - 30};
            const interval = {intervalX, intervalY};
            intervalList.push(interval);
        }
        if (h - y1 >= 30) {
            const intervalX = {min: 30 - w, max: w - 30};
            const intervalY = {min: y1, max: h - 30};
            const interval = {intervalX, intervalY};
            intervalList.push(interval);
        }
        if (h + y2 >= 30) {
            const intervalX = {min: 30 - w, max: w - 30};
            const intervalY = {min: y2, max: 30 - h};
            const interval = {intervalX, intervalY};
            intervalList.push(interval);
        }
        const index = utils.MathUtil.randomInt(0, intervalList.length - 1);
        const interval = intervalList[index];
        const x = utils.MathUtil.randomInt(interval.intervalX.min, interval.intervalX.max);
        const y = utils.MathUtil.randomInt(interval.intervalY.min, interval.intervalY.max);
        return {x, y};
    }

    private createNpcEntity(entity: NpcEntity, conversionSystem: IConversionSystem) {
        const newEntity = conversionSystem.getEntity(entity.NpcTemp.entity) as INewEntity;
        newEntity.addComponent(DataType.Direction);
        newEntity.addComponent(DataType.NpcIdentity);
        newEntity.Direction.direction = Direction.Type.None;
        newEntity.NpcIdentity.die = false;
        if (entity.NpcTemp.isEnemy) {
            const result = this.getXY();
            const x = result.x;
            const y = result.y;
            _vec3Temp.set(x, y);
            newEntity.node.position = _vec3Temp;
            newEntity.node.getComponent(Enemy).createEnemy("Stem_blue");
            newEntity.NpcIdentity.identity = NpcType.Enemy;
            newEntity.NpcIdentity.hp = this._battleModel.data.enemyHP;
            newEntity.addComponent(DataType.EnemyWeapon);
            newEntity.EnemyWeapon.attack = this._battleModel.data.enemyAttack;
        }
        else {
            Debug.log("初始化英雄");
            _vec3Temp.set(0, 0);
            newEntity.node.position = _vec3Temp;
            newEntity.node.getComponent(Hero).createHero("Hilda");
            newEntity.NpcIdentity.identity = NpcType.Hero;
            newEntity.NpcIdentity.hp = excel.file.Hero.get(1000).HP;
            newEntity.addComponent(DataType.HeroWeapon);
            newEntity.HeroWeapon.bulletCount = excel.file.HeroWeapon.get(1100).bulletCount;
            newEntity.HeroWeapon.bulletSpeed = excel.file.HeroWeapon.get(1100).bulletSpeed;
            newEntity.HeroWeapon.weaponType = excel.file.HeroWeapon.get(1100).type;
            newEntity.HeroWeapon.attack = excel.file.HeroWeapon.get(1100).attack;
            newEntity.HeroWeapon.attackDistance = excel.file.HeroWeapon.get(1100).attackDistance;
            newEntity.HeroWeapon.cd = excel.file.HeroWeapon.get(1100).cd;
            this._rockingModel.data.heroPos.set(_vec3Temp.x, _vec3Temp.y);
        }
    }

    private addGameObject(entity: NpcEntity, conversionSystem: IConversionSystem) {
        const count = entity.NpcTemp.count;
        if (entity.NpcTemp.isEnemy) {
            for (let i = 0; i < count; ++i) {
                this.createNpcEntity(entity, conversionSystem);
            }
            //创建完npc实体后要马上销毁用于初始化的实体（即那个让当前系统运行的实体），以免下一帧的时候再运行该系统，造成重复创建npc实体
            this.destroyEntity(entity);
        }
        else {
            for (let i = 0; i < count; ++i) {
                this.createNpcEntity(entity, conversionSystem);
            }
            //创建完npc实体后要马上销毁用于初始化的实体（即那个让当前系统运行的实体），以免下一帧的时候再运行该系统，造成重复创建npc实体
            this.destroyEntity(entity);
        }
    }

    protected onUpdate(dt: number): void {
        //初始化时使用的系统调用初始化的调度接口，该接口会执行传入的回调，会给回调传入 NpcEntity， IConversionSystem 两个类型的参数。
        //NpcTemp 是一个用于初始化组件数据，该系统会匹配具有 NpcTemp 组件数据的实体，如果不存在该实体，该系统不会继续执行 update 回调。
        //具有 NpcTemp 组件数据的实体其实就是 NpcEntity 类型的实体。
        this._initializationCommandBuffer.scheduler(this, this.addGameObject, DataType.NpcTemp);
    }
}