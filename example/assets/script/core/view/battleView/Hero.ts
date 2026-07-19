import { _decorator, Component, Node, sp, Contact2DType, Collider2D, IPhysics2DContact, Prefab, Vec3, NodePool, instantiate, tween } from 'cc';
import { tweenAnimat, TweenAnimat, app, Debug, ITweenAnimat } from "zest";
import { ResConst } from '../../const';
import { EventType } from '../../EventType';
import { BulletData, BulletType, ColliderGroup } from './BattleDefine';
const { ccclass, property } = _decorator;

const _vec3Temp = new Vec3();

@ccclass('Hero')
export class Hero extends app.BaseLayout {
    @property(sp.Skeleton)
    private spine: sp.Skeleton = null;

    @property(Node)
    private firePoint: Node = null;

    @property(Node)
    private gun: Node = null;

    @property(sp.Skeleton)
    private gunSpine: sp.Skeleton = null;


    private _repel: boolean;
    private _die: boolean;
    private _attacked: boolean;
    private _contacted: boolean;
    start() {
        this._repel = false;
        this._die = false;
        this._attacked = false;
        this._contacted = false;
        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }

    public getContacted() {
        return this._contacted;
    }

    public getAttacked() {
        return this._attacked;
    }

    public setAttacked(attacked: boolean) {
        this._attacked = attacked;
    }

    public getDie() { return this._die; }

    public getRepel() { return this._repel; }

    private onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D) {
        // 只在两个碰撞体开始接触时被调用一次
        this._contacted = true;
        const enemy = 1 << ColliderGroup.ENEMY;
        if (otherCollider.group === enemy) {
            this._attacked = true;
        }
    }

    private onEndContact(selfCollider: Collider2D, otherCollider: Collider2D) {
        // 只在两个碰撞体结束接触时被调用一次
        this._contacted = false;
    }

    private _gunAnimat: ITweenAnimat;
    private _animat: ITweenAnimat;
    public createHero(filename: string) {
        this._animat = tweenAnimat(this.spine.node, "battle")
        this._animat.spine({
            name: "idle",
            url: ResConst.SPINE_HERO + filename,
            loop: true
        }).play().catch(e => {
            Debug.error(e);
        });
    }

    public setSpineAnimation(animation: string, loop: boolean) {
        this._animat.spine({
            name: animation,
            loop
        }).play();
    }

    public setAwait() {
        this._animat.spine({
            name: "idle",
            loop: true
        }).play();
    }

    public repel() {
        this._animat.spine({
            name: "repel",
            loop: false
        }).onPlay(() => {
            this._repel = true;
        }).onStop(() => {
            this._repel = false;
        }).play();
    }

    public die() {
        this._animat.spine({
            name: "die",
            loop: false
        }).onStop(() => {
            this._die = true;
        }).play().catch(err => {
            Debug.error("英雄死亡动画播放错误：", err);
        });
    }

    public gunFire(time: number, target: Vec3) {
        if (!this._gunAnimat) {
            this._gunAnimat = tweenAnimat(this.gunSpine.node, "battle");
        }
        this._gunAnimat
        .spine({name: "attack", repeatCount: 1})
        .onPlay(() => {
            const data: BulletData = {
                worldPos: this.firePoint.worldPosition,
                type: BulletType.HERO_BULLET,
                time,
                toPos: target
            }
            this.sendNotice(EventType.HERO_GUN_FIRE, data);
        })
        .spine({
            name: "idle",
            loop: true
        }).play();
    }

    public rotationGun(angle: number) {
        const x = this.gun.eulerAngles.x;
        const y = this.gun.eulerAngles.y;
        const oldZ = this.gun.eulerAngles.z;
        _vec3Temp.set(x, y, oldZ - angle);
        this.gun.eulerAngles = _vec3Temp;
    }

    public updateHp(hp: number) {
        this.sendNotice(EventType.UPDATE_HP, hp);
    }

    update(deltaTime: number) {
        
    }
}

