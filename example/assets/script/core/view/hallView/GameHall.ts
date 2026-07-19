import { Prefab } from "cc";
import { Debug, IAssetRegister, IRegister, TweenAudio, decorator, guide, network, tools, tweenAudio, ui, utils } from "zest";
import { GameHallView } from "./GameHallView";
import { instantiate } from "cc";
import { TestMessage } from "../../model/TestMessage";

const {zestClass, template, bundle} = decorator;

@zestClass("GameHall")
@template("HallView")
@bundle("hall")
export class GameHall extends ui.GameWindow<GameHallView> {

    listAssetUrls(assetRegister: IAssetRegister) {
        assetRegister.addFilePath("bg0");
        assetRegister.addFilePath("bg1");
        assetRegister.addFilePath("bg2");
        assetRegister.addFilePath("bg3");
        assetRegister.addFilePath("bg4");
    }

    onCreate(register: IRegister) {
        return ui.Type.ROOT_LAYER;
    }

    onStart() {
        const index = utils.MathUtil.randomInt(0, 4);
        const prefab = this.getGameAsset("bg" + index, Prefab);
        const node = instantiate(prefab);
        this.view.showBg(node);
        
        //测试引导模块
        // guide.manager.guideOpen();
        
        //测试消息模块
        // network.socket.initHeartbeat("heartbeatMessage");
        // network.socket.connect("ws://localhost:3000", network.Protocol.ARRAY_BUFFER).then(() => {
        //     const message = network.socket.get("testMessage", TestMessage);
        //     message.send({
        //         test: "这是一个测试消息"
        //     });
        // }).catch(err => {
        //     Debug.log("服务器连接错误：", err);
        // });

        //测试音频模块
        // const tween = tweenAudio("guide").audio(TweenAudio.Model.PARALLEL)
        // .effect({url: "audio/explore", oneShot: false})
        // .play()
        // .catch(err => {
        //     Debug.error(err);
        // });
        // tools.Timer.setInterval(() => {
        //     // tween.effect({url: "audio/LevelWinSound", oneShot: false})
        //     // .play();
        //     tween.stop();
        // }, 3);
    }
}