import { Debug, IAssetRegister, app, decorator, guide } from "zest";
import { UIEnum } from "./core/UIEnum";
import { I18nManager } from "./i18n/I18nManager";

const { zestClass, startScene } = decorator;


/**
 * 游戏主程序类
 */
@zestClass("DemonGirl")
@startScene("MainScene")
export class DemonGirl extends app.GameWorld {
    /**列出游戏加载页面需要加载的资源，加载的必须是resources资源包里的资源 */
    protected listAsset(assetRegister: IAssetRegister) {
        
    }

    /**游戏启动完成，在首场景加载显示后调用 */
    protected startup() {
        Debug.log("游戏启动完成");
        //用于记录存档数据或者缓存数据
        app.archive.createArchive({name: "游戏缓存数据"});
        app.archive.openArchive(0);
        ///////////////////////////////////////////
        //i18n多语言初始化
        I18nManager.getInstance().init().catch(error => {
            Debug.error(error);
        });
        guide.manager.setGuideView(UIEnum.GameGuide);

        /**
         * 在这里选择游戏平台类型，以适配相应的游戏平台
         * 默认在预览平台
         */
        return app.Platform.PREVIEW;
    }
    /**
     * 游戏进入后台 
     * 请注意，在 WEB 平台，这个事件不一定会 100% 触发，这完全取决于浏览器的回调行为。
     * 在原生平台，它对应的是应用被切换到后台事件，下拉菜单和上拉状态栏等不一定会触发这个事件，这取决于系统行为。
     */
    protected onBackground(): void {

    }
    /**
     * 进入前台 
     * 请注意，在 WEB 平台，这个事件不一定会 100% 触发，这完全取决于浏览器的回调行为。
     * 在原生平台，它对应的是应用被切换回前台事件。
     */
    protected onForeground(): void {

    }
    /**
     * 是否可以打开GameWindow
     * @param accessId 窗口对应的Id名
     * @returns 返回true则可以打开窗口，返回false则无法打开窗口
     */
    public canOpenWinForm(accessId: string): boolean { 
        /**
         * 在这里处理UI窗口打开的权限，true则可以打开窗口，false则无法打开窗口
         * 一般用在需要权限才能打开窗口的情况，如果没有这些功能，则保持true即可
         */
        return true; 
    }
    /**每一帧刷新的回调 */
    update(dt: number): void {

    }
}