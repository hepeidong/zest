import { Vec3 } from "cc";
import { Direction, IEntity, IPrimaryEntity } from "zest";
import { NpcType } from "../../lib/NpcTypeEnum";



export interface NpcEntity extends IEntity {
    NpcTemp: NpcTemp
}

export enum DataType {
    NpcTemp,
    Position,
    Direction,
    NpcIdentity,
    EnemyWeapon,
    HeroWeapon,
    AttackTarget,
    FindEnemy,
    ActivateEnemy,

    total
}

export interface NpcTemp {
    entity: IPrimaryEntity,
    count: number;
    /**是否是敌人 */
    isEnemy: boolean;
}

export interface Position {
    /**这个不是具体的坐标，而且X轴坐标的移动偏移方向，例如向东时为1，表示真实X轴坐标向量增加，-1则为减少 */
    x: number;
    /**这个不是具体的坐标，而且Y轴坐标的移动偏移方向，例如向东时为1，表示真实Y轴坐标向量增加，-1则为减少 */
    y: number;
    /**移动速度 */
    speed: number;
}

export interface DirectionData {
    direction: Direction.Type;
}

export interface NpcIdentity {
    identity: NpcType;
    hp: number;
    id: number;
    die: boolean;
}

export interface EnemyWeapon {
    attack: number;
}

export interface AttackTarget {
    /**攻击目标 */
    target: Vec3;
}

export interface HeroWeapon {
    bulletCount: number;
    weaponType: number;
    bulletSpeed: number;
    attack: number;
    attackDistance: number;
    cd: number;
}

export interface FindEnemy {
}

export interface ActivateEnemy {
}