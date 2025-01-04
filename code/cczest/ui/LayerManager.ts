import { ILayerManager, IWindowBase } from "zest";
import { tools } from "../tools";
import { WindowLayer } from "./WindowLayer";



/**
 * author: HePeiDong
 * 
 * date: 2019/9/13
 * 
 * name: 层级管理器
 * 
 * description: 还有窗口队列需要去设计实现完善，对游戏层进行管理，例如把窗口增加到游戏层里面，
 *              还有对窗口队列进行管理。
 */
export abstract class LayerManager implements ILayerManager {
    private _canRelease: boolean;
    protected _windowLayer: WindowLayer;
    protected _list: IWindowBase[];
    protected _cacheWindow: IWindowBase[];  //缓存打开过的窗口，用于场景切换时释放资源
    protected _map: Map<string, IWindowBase|tools.ObjectPool<IWindowBase>>;
    constructor(canRelease: boolean, windowLayer: WindowLayer) {
        this._canRelease  = canRelease;
        this._windowLayer = windowLayer;
        this._list        = [];
        this._cacheWindow = [];
        this._map         = new Map();
    }

    public setDisappears(visible: boolean) {
        const len = this._list.length;
        for (let i: number = 0; i < len; ++i) {
            if (!visible) {
                this._list[i]['hideView']();
            }
        }
    }

    /**在场景转换时，是否要被释放资源 */
    public get canRelease(): boolean { return this._canRelease; }

    abstract initView(view: IWindowBase): void;

    abstract addView(view: IWindowBase, ...args: any[]): void;

    abstract delView(isDestroy: boolean): boolean;

    abstract getView(): IWindowBase;

    public set(view: IWindowBase) {
        this._map.set(view.accessId, view);
    }

    public get(accessId: string) {
        return this._map.get(accessId) as IWindowBase;
    }

    public has(accessId: string) {
        return this._map.has(accessId);
    }

    public hasView(view: IWindowBase): boolean {
        const len = this._list.length;
        for (let i: number = 0; i < len; ++i) {
            if (this._list[i] === view) {
                return true;
            }
        }
        return false;
    }

    public removeView(view: IWindowBase): boolean {
        const len = this._list.length;
        for (let i: number = 0; i < len; ++i) {
            let ele: IWindowBase = this._list[i] as IWindowBase;
            if (ele === view) {
                view.close();
                this._list.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    public clear(switchingScene: boolean = false): void {
        // this._map.forEach((view) => {
        //     if (!(view instanceof tools.ObjectPool)) {
        //         if (view.winModel !== "TOAST") {
        //             view.close(this.canRelease, switchingScene);
        //         }
        //     }
        // });
        let list: IWindowBase[];
        if (switchingScene) {
            //场景切换时释放资源
            list = this._cacheWindow;
            const len = list.length;
            for (let i: number = 0; i < len; ++i) {
                list[i].close(this.canRelease, switchingScene);
            }
        }
        else {
            //正常关闭窗口
            list = this._list;
            const len = list.length;
            for (let i: number = 0; i < len; ++i) {
                list[i].close(this.canRelease, switchingScene);
            }
        }
        this._list = null;
        this._list = [];
        if (switchingScene)  {
            this._cacheWindow = null;
            this._cacheWindow = [];
        }
    }
    /**返回当前还未关闭的窗口数 */
    public getCount(): number { return this._list.length; }
}