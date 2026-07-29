import { SystemDoesNotHaveNameException } from "./exceptions/SystemDoesNotHaveNameException";
import { utils } from "../utils";
import { setParentType } from "../decorator/Decorator";
import { IBaseEntity, IEndEntityCommandBufferSystem, IEntity, IEntityManager, IMatcher, ISystem } from "zest";

import { Debug } from "../Debugger";

/**
 * 系统类
 */
export abstract class CCSystem<T extends IEntity> implements ISystem<T> {
    private static createIndexes: number = 0;

    private _sysFlag: string;
    private _name: string;
    private _createIndex: number;
    private _pool: IEntityManager<T>;
    private _matcher: IMatcher<T>;
    private _enabled: boolean;
    private _startRan: boolean;
    
    protected _endEntityCommandBufferSystem: IEndEntityCommandBufferSystem;
    
    constructor(sysFlag: string = "System") {
        this._sysFlag     = sysFlag;
        this._enabled     = true;
        this._startRan    = false;
        this._createIndex = CCSystem.createIndexes++;
        this.init();
    }

    public get name() { return this._name; }
    public get startRan() { return this._startRan; }
    public set enabled(val: boolean) { 
        if (typeof val === 'boolean') {
            this._enabled = val; 
            if (!val) {
                this.onDisable();
            }
            else {
                this.onStart();
            }
        }
        else {
            throw Debug.error("给'enabled'赋值的类型必须是boolean");
        }
    }
    public get enabled() { return this._enabled; }
    public get matcher() { return this._matcher; }

    protected init() {
        if (utils.isUndefined(this._name)) {
            this._name = this['__classname__'];
            if (!this._name) this._name = this["__cid__"];
            if (utils.isUndefined(this._name) || utils.isNull(this._name) || this._name.length === 0) {
                throw new Error(new SystemDoesNotHaveNameException(this._createIndex, this.toString()).toString());
            }
        }
    }

    public setPool(pool: IEntityManager<T>) {
        this._pool = pool;
        this._pool.onEntityAddComponent.add(this.onEntityAddComponent.bind(this));
        this._pool.onEntityReleased.add(this.onEntityReleased.bind(this));
    }

    public setMatcher(matcher: IMatcher<T>) {
        this._matcher = matcher;
        this._matcher.onMatcherChange.add(this.onMatcherChange.bind(this));
    }

    public setEndEntityCommandBufferSystem(endEntityCommandBufferSystem: IEndEntityCommandBufferSystem) {
        this._endEntityCommandBufferSystem = endEntityCommandBufferSystem;
    }

    public destroyEntity(entity: T) {
        if (!entity.destroying) {
            entity.setDestroying(true);
            this._endEntityCommandBufferSystem.scheduler(this, this.destroyEntityHandle, entity);
        }
    }

    public destroyEntityAll() {
        const entities = this._pool.getEntities();
        for (const entity of entities) {
            this.destroyEntity(entity);
        }
    }

    private destroyEntityHandle(entity: T) {
        entity.destroyEntity();
    }

    //预销毁实体，处理野实体的销毁情况，如果此时实体存在组件数据，则不予销毁
    private preDestroyEntity(entity: T) {
        if (entity.types.length === 0) {
            entity.destroyEntity();
        }
    }

    //实体增加组件，检查该实体是否在待销毁任务里
    private onEntityAddComponent(entity: T) {
        if (entity.destroying) {
            entity.setDestroying(false);
            this._endEntityCommandBufferSystem.removeSame(entity);
        }
    }

    //实体释放是处理野实体的，野实体就是没有任何组件数据的实体
    private onEntityReleased(entity: T) {
        const groups = this._pool.getGroups();
        const group = groups[entity.groupId];
        //只有当前系统是引用了该实体组的，
        if (group.equal(this.name)) {
            if (!entity.destroying) {
                entity.setDestroying(true);
                this._endEntityCommandBufferSystem.scheduler(this, this.preDestroyEntity, entity);
            }
        }
    }

    //匹配器发生变化
    private onMatcherChange() {
        if (this._sysFlag === "System") {
            this._enabled = this._matcher.matcherEnabled();
        }
    }

    /**基类方法，外部不可调用此方法，否则会引发不可预知错误 */
    create(): void {
        this.onCreate();
    }
    /**基类方法，外部不可调用此方法，否则会引发不可预知错误 */
    start(): void {
        this._startRan = true;
        this.onStart();
    }
    /**基类方法，外部不可调用此方法，否则会引发不可预知错误 */
    update(dt: number): void {
        if (this._enabled) {
            this.onUpdate(dt, this._matcher);
        }
    }
    destroy(): void {
        this.onDestroy();
    }
    /**系统创建时调用，该方法为生命周期方法，子类可以重写覆盖该方法，父类未必会有实现 */
    protected onCreate() {}
    /**该方法是在系统每次激活时运行, 并且在onUpdate运行之前被调用一次，子类可以重写覆盖该方法，父类未必会有实现 */
    protected onStart(): void {}
    /**
     * 每一帧运行时被调用，该方法为生命周期方法，子类可以重写覆盖该方法，父类未必会有实现
     * @param dt 
     */
    protected onUpdate(dt: number, matcher: IMatcher<T>): void {}
    /**当前系统被禁用时调用，该方法为生命周期方法，子类可以重写覆盖该方法，父类未必会有实现 */
    protected onDisable(): void {}
    /**当前系统被销毁时调用，该方法为生命周期方法，子类可以重写覆盖该方法，父类未必会有实现 */
    protected onDestroy(): void {}

    public toString() {
        return utils.StringUtil.replace("[System:{0}] ", this._name);
    }
}

setParentType("system", CCSystem);