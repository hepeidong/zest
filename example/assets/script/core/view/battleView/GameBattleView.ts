import { _decorator, Node, instantiate, Prefab, Vec2, Vec3, EventTouch, UITransform, sp } from 'cc';
import { tweenAnimat, excel, Debug, decorator, ecs, IConversionSystem, IConvertToEntity, RockingBar, ui, utils } from "zest";
import { DataType, NpcEntity } from '../../battleSystem/dataType';
import { CommandEnum, NoticeType } from '../../CommandEnum';
import { NodePool } from 'cc';
import { tween } from 'cc';
import { BulletType } from './BattleDefine';
import { ProgressBar } from 'cc';
import { Label } from 'cc';
import { LayerEnum } from '../../LayerEnum';
const { ccclass, property } = _decorator;

const {convertToEntity} = decorator;

@ccclass('GameBattleView')
@convertToEntity
export class GameBattleView extends ui.GameLayout implements IConvertToEntity {

    @property(Node)
    private map: Node = null;

    @property(Node)
    private npc: Node = null;

    @property(Prefab)
    private hero: Prefab = null;

    @property(Prefab)
    private enemy: Prefab = null;

    @property(sp.Skeleton)
    private enemyTip: sp.Skeleton = null;

    @property(Prefab)
    private heroBullet: Prefab = null;

    @property(Prefab)
    private enemyBullet: Prefab = null;

    @property(ProgressBar)
    private hpProgress: ProgressBar = null;

    @property(Label)
    private battleTip: Label = null;

    @property(Label)
    private killsCount: Label = null;

    @property(Label)
    private battleTime: Label = null;

    @property(Label)
    private gameLevel: Label = null;


    private _isEnemy: boolean;
    private _heroBulletPool: NodePool;
    private _enemyBulletPool: NodePool;
    start() {
        this._heroBulletPool = new NodePool();
        this._enemyBulletPool = new NodePool();
        this.battleTime.string = utils.StringUtil.format("时间：%s", excel.file.Const.get("battleTime").value);
    }

    declareReference(conversionSystem: IConversionSystem) {
        conversionSystem.add(this.hero).to(this.npc);   //把英雄预制体增加到npc层，用于ECS构建英雄对象
        conversionSystem.add(this.enemy).to(this.npc);  //把敌人预制体增加到npc层，用于ECS构建敌人对象
    }

    convert(conversionSystem: IConversionSystem) {
        const entity = ecs.World.instance.entityManager.createEntity("Init") as NpcEntity;
        if (!entity.hasComponent(DataType.NpcTemp)) {
            entity.addComponent(DataType.NpcTemp);
        }
        entity.NpcTemp.isEnemy = this._isEnemy;
        if (this._isEnemy) {
            entity.NpcTemp.count = excel.file.Const.get("enemyCount").value;
            entity.NpcTemp.count = 1;
            const primaryEntity = conversionSystem.getPrimaryEntity(this.enemy);
            entity.NpcTemp.entity = primaryEntity;
        }
        else {
            entity.NpcTemp.count = 1;
            const primaryEntity = conversionSystem.getPrimaryEntity(this.hero);
            entity.NpcTemp.entity = primaryEntity;
        }
    }

    public setMap(mapAsset: Prefab) {
        this.map.removeAllChildren();
        const newMap = instantiate(mapAsset);
        this.setLayer(newMap, 1 << LayerEnum.MAP);
        this.map.addChild(newMap);
        const ui = newMap.getComponent(UITransform);
        this.sendNotice(CommandEnum.RockingCommand, {w: ui.width, h: ui.height}, NoticeType.RockingCommand_mapSize);

        //增加敌人前，定义预制体引用，做好转换准备
        ecs.World.instance.declareReference(this);
        this._isEnemy = false;
        this.addNpcEntity();
        //增加敌人
        this.scheduleOnce(() => {
            this._isEnemy = true;
            tweenAnimat(this.enemyTip.node).spine({
                name: this.enemyTip.animation,
                repeatCount: 1
            }).onStop(() => {
                this.sendNotice(CommandEnum.BattleCommand);
                this.addNpcEntity();
            }).play().catch(e => {
                Debug.error(e);
            });
        }, 0.5);
    }

    public gunFire(worldPos: Vec3, type: BulletType, time: number, toPos: Vec3) {
        const bullet = this.createBullet(type);
        this.map.addChild(bullet);
        bullet.worldPosition = worldPos;
        tween(bullet).to(time, {position: toPos}).call(() => {
            if (type === BulletType.ENEMY_BULLET) {
                this._heroBulletPool.put(bullet);
            }
            else if (type === BulletType.HERO_BULLET) {
                this._enemyBulletPool.put(bullet);
            }
        }).start();
    }

    public initBattleInfo(killsCount: number, gameLevel: number) {
        this.battleTip.string = utils.StringUtil.format("击杀%s个敌人", killsCount);
        this.gameLevel.string = utils.StringUtil.format("第 %s 关", gameLevel);
    }

    public updateHpProgress(progress: number) {
        this.hpProgress.progress = progress;
    }

    public updateKillsCount(count: number, killsCount: number) {
        this.killsCount.string = utils.StringUtil.format("%s/%s", count, killsCount);
    }

    public updateBattleTime(time: number) {
        this.battleTime.string = utils.StringUtil.format("时间：%s", time);
    }

    public refreshEnemy() {
        this._isEnemy = true;
        this.addNpcEntity();
    }

    private setLayer(target: Node, layer: number) {
        target.layer = layer;
        for (const child of target.children) {
            child.layer = layer;
        }
    }

    private createBullet(type: BulletType) {
        if (type === BulletType.HERO_BULLET) {
            return this.genBullet(this._heroBulletPool, this.heroBullet);
        }
        else if (type === BulletType.ENEMY_BULLET) {
            return this.genBullet(this._enemyBulletPool, this.enemyBullet);
        }
    }

    private genBullet(pool: NodePool, bulletTemp: Prefab) {
        let bulletNode: Node;
        if (pool.size() > 0) {
            bulletNode = pool.get();
            bulletNode.active = true;
        }
        else {
            bulletNode = instantiate(bulletTemp);
        }
        return bulletNode;
    }

    private addNpcEntity() {
        ecs.World.instance.convert(this);
    }

    onBackToOriginEvent() {
        this.sendNotice(CommandEnum.RockingCommand, null, NoticeType.RockingCommand_stop);
    }

    onMoveRockingBar(rockingBar: RockingBar) {
        this.sendNotice(CommandEnum.RockingCommand, rockingBar.ragian, NoticeType.RockingCommand_ragian);
        this.sendNotice(CommandEnum.RockingCommand, rockingBar.angle, NoticeType.RockingCommand_rotation);
        this.sendNotice(CommandEnum.RockingCommand, rockingBar.direction, NoticeType.RockingCommand_direction);
    }


    //
    update(deltaTime: number) {
        
    }
}

