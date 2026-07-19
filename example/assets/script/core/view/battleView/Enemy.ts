import { _decorator, Node, sp, Collider2D, Contact2DType, IPhysics2DContact } from 'cc';
import { TweenAnimat, tweenAnimat, app, Debug, ITweenAnimat } from "zest";
import { ResConst } from '../../const';
import { ColliderGroup } from './BattleDefine';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends app.BaseLayout {

    @property(sp.Skeleton)
    private spine: sp.Skeleton = null;


    private _die: boolean;
    private _attacking: boolean; //发起攻击
    private _attacked: boolean;  //被攻击
    private _contacted: boolean; //发生了碰撞
    start() {
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

    public getAttacking() {
        return this._attacking;
    }

    public setAttacked(attacked: boolean) {
        this._attacked = attacked;
    }

    public getDie() { return this._die; }

    private onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D) {
        // 只在两个碰撞体开始接触时被调用一次
        this._contacted = true;
        const heroBullet = 1 << ColliderGroup.HERO_BULLET;
        const hero = 1 << ColliderGroup.HERO;
        if (otherCollider.group === heroBullet) {
            this._attacked = true;
            otherCollider.node.active = false;
        }
        else if (otherCollider.group === hero) {
            this._attacking = true;
        }
    }

    private onEndContact(selfCollider: Collider2D, otherCollider: Collider2D) {
        // 只在两个碰撞体结束接触时被调用一次
        this._contacted = false;
        const hero = 1 << ColliderGroup.HERO;
        if (otherCollider.group === hero) {
            this._attacking = false;
        }
    }

    private _animat: ITweenAnimat;
    public createEnemy(filename: string) {
        this._animat = tweenAnimat(this.spine.node, "battle");
        this._animat.spine({
            name: "fx_monster_arise_layer01",
            url: ResConst.SPINE_ANIMATION + "fx_arise",
            repeatCount: 1
        });
        this._animat.spine({
            name: "daiji",
            url: ResConst.SPINE_ENEMY + filename,
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
            name: "daiji",
            loop: true
        }).play();
    }

    public die() {
        this._animat.spine({
            name: "die",
            loop: false
        }).onStop(() => {
            this._die = true;
        }).play();
    }

    update(deltaTime: number) {
        
    }
}

