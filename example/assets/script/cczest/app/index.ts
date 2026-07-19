import { CCGameWorld } from "./CCGameWorld";
import { SceneBase } from "./SceneBase";
import { AdapterManager } from "./adapter_manager/AdapterManager";
import { MacroCommand } from "../puremvc";
import { SimpleCommand } from "../puremvc";
import { CCDocument } from "./CCDocument";
import { GamePlatform, GameSceneType } from "./AppEnum";
import { CCBaseLayout } from "./CCBaseLayout";
import { DataSave } from "./file-save";
import { IBaseLayout, IEventBody, IGameWorld } from "zest";


export class app {
    /**包含了游戏MVC下主要子程序，负责MVC分配消息给相应的子程序 */
    public static get game() { return CCGameWorld.getInstance() as IGameWorld; }
    /**多分辨率完美适配 */
    public static get adapter() { return AdapterManager.instance; }
    /**存档数据，用于本地存储数据，把数据存储在本地设备中，例如手机本地存储 */
    public static get archive() { return DataSave.instance;}
}

export namespace app {
    /**游戏场景类型 */
    export enum SceneType {
        /**不是任何类型的场景，非法的选项，不可选择 */
        NONE = GameSceneType.NONE,
        /**普通场景 */
        Normal = GameSceneType.Normal,
        /**过渡阶段的场景（一般类似用于加载资源的场景，这类场景切换时，场景内所加载的资源，包括打开过的UI都不会被释放） */
        Interim = GameSceneType.Interim
    }
    /**游戏平台类型 */
    export enum Platform { 
        /**预览模式 */
        PREVIEW = GamePlatform.PREVIEW,
        /**网页H5平台 */
        BROWSER = GamePlatform.BROWSER,
        /**微信小游戏平台 */
        WECHAT = GamePlatform.WECHAT,
        /**字节小游戏平台 */
        BYTE = GamePlatform.BYTE,
        /**安卓原生平台 */
        ANDROID = GamePlatform.ANDROID,
        /**苹果原生平台 */
        IOS = GamePlatform.IOS,
        /**window平台 */
        WIN32 = GamePlatform.WIN32
    }
    export class BaseLayout extends CCBaseLayout {
        protected onEvent(body: IEventBody) {}
    }
    export class GameWorld extends CCGameWorld {}
    export class Scene<T extends IBaseLayout = any> extends SceneBase<T> {}
    export class Command extends SimpleCommand {
        private static _ref: number = 0;

        public static addRef() {
            this._ref++;
        }

        public static delRef() {
            this._ref--;
        }

        public static getRef() {
            return this._ref;
        }
    }
    export class CommandGroup extends MacroCommand {
        private static _ref: number = 0;

        public static addRef() {
            this._ref++;
        }

        public static delRef() {
            this._ref--;
        }

        public static getRef() {
            return this._ref;
        }

        addSubCommand(commandClassRef: Function): void {
            (commandClassRef as typeof Command).addRef();
            super.addSubCommand(commandClassRef);
        }
    }
    export class Document<T> extends CCDocument<T> {}
}

export * from "./adapter_manager/component/AdapterHelper";
export * from "./adapter_manager/component/AdapterWidget";