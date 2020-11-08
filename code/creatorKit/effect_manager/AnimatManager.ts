import FrameAnimat from "./FrameAnimat";
import SpineAnimat from "./SpineAnimat";


enum AnimatType {
    /**普通帧动画 */
    ANIMATION,
    /**spine骨骼动画 */
    SPINE
}

/**
 * author: 何沛东
 * date: 2020/10/20
 * description: 动画播放管理，支持链式结构按顺序播放多个不同类型的动画，可以延迟播放动画，可以抛出错误异常
 */
export class Animat {
    private _target: cc.Node;
    private _status: string = 'pending';
    private _err: Error;
    private _animatIndex: number = 0;
    private _animators: AnimatType[] = [];
    private _frameAnimat: FrameAnimat;
    private _spineAnimat: SpineAnimat;

    constructor() {

    }

    public static get create() {
        return new Animat();
    }

    public static stopAll(): void {
        FrameAnimat.stopAll();
        SpineAnimat.stopAll();
    }

    public target(node: cc.Node) {
        if (!node) {
            this._status = 'rejected';
            let res = typeof node;
            this._err = new Error('目标节点this._target为' + res+'!');
        }
        else if ((node instanceof cc.Node) === false) {
            this._status = 'rejected';
            this._err = new Error('目标节点this._target的类型不符!');
        }
        this._target = node;
        return this;
    }

    

    /**开始播放动画 */
    public play(): Animat {
        try {
            if (this._status === 'pending') {
                if (this._animators[this._animatIndex] === AnimatType.ANIMATION) {
                    this._status = 'resolved';
                    this._frameAnimat.play()
                    .onNext(this.nextAnimat.bind(this))
                    .catch((e) => {
                        this._status = 'rejected';
                        this._err = e;
                    });
                }
                else if (this._animators[this._animatIndex] === AnimatType.SPINE) {
                    this._status = 'resolved';
                    this._spineAnimat.play()
                    .onNext(this.nextAnimat.bind(this))
                    .catch((e) => {
                        this._status = 'rejected';
                        this._err = e;
                    });
                }
            }

        } catch (error) {
            this._status = 'rejected';
            this._err = error;
        }
        return this;
    }
    /**停止动画 */
    public stop(): Animat {
        try {
            if (this._status === 'pending') {
                if (this._animators[this._animatIndex] === AnimatType.ANIMATION) {
                    this._frameAnimat.stop().catch((e) => {
                        this._status = 'rejected';
                        this._err = e;
                    });
                }
                else if (this._animators[this._animatIndex] === AnimatType.SPINE) {
                    this._spineAnimat.stop().catch((e) => {
                        this._status = 'rejected';
                        this._err = e;
                    });
                }
            }
        } catch (error) {
            this._status = 'rejected';
            this._err = error;
        }
        return this;
    }
    /**暂停电画 */
    public pause(): Animat {
        try {
            if (this._status === 'pending') {
                if (this._animators[this._animatIndex] === AnimatType.ANIMATION) {
                    this._frameAnimat.pause().catch((e) => {
                        this._status = 'rejected';
                        this._err = e;
                    });
                }
                //spine动画暂时没有暂停
                // else if (this._animators[this._animatIndex] === AnimatType.SPINE) {
                    
                // }
            } 
        } catch (error) {
            this._status = 'rejected';
            this._err = error;
        }
        return this;
    }
    /**恢复动画 */
    public resume(): Animat {
        try {
            if (this._status === 'pending') {
                if (this._animators[this._animatIndex] === AnimatType.ANIMATION) {
                    this._frameAnimat.resume().catch((e) => {
                        this._status = 'rejected';
                        this._err = e;
                    });
                }
                //spine动画暂时没有恢复动画功能
                // else if (this._animators[this._animatIndex] === AnimatType.SPINE) {
    
                // }
            }
        } catch (error) {
            this._status = 'rejected';
            this._err = error;
        }
        return this;
    }

    /**
     * 播放默认剪辑动画
     * @param delay 
     * @param startTime 
     */
    public defaultClip(delay?: number, startTime?: number): Animat {
        try {
            if (this._status === 'pending') {
                ///////////////////////////////////////////
                this._animators.push(AnimatType.ANIMATION);
                if (!this._frameAnimat) {
                    this._frameAnimat = new FrameAnimat(this._target);
                }
                //默认动画的名称不需要指定，直接获取默认动画的动画名称
                let props: IFrameAnimat = {
                    name: null,
                    delay: delay,
                    startTime: startTime,
                    default: true
                }
                this._frameAnimat.addAnimatProps(props);
            }
        } catch (error) {
            this._status = 'rejected';
            this._err = error;
        }
        return this;
    }

    /**
     * 把要播放的剪辑动画压入队列中，等待播放
     * @param props 剪辑动画属性
     */
    public clip(props: IFrameAnimat): Animat {
        try {
            if (this._status === 'pending') {
                ///////////////////////////////////////////
                this._animators.push(AnimatType.ANIMATION);
                if (!this._frameAnimat) {
                    this._frameAnimat = new FrameAnimat(this._target);
                }
                if (props.clip) {
                    this._frameAnimat.addClip(props.clip);
                }
                if (props.url) {
                    this.animationLoaded(props.url);
                }
                this._frameAnimat.addAnimatProps(props);
            }
        } catch (error) {
            this._status = 'rejected';
            this._err = error;
        }
        return this;
    }

    /**
     * 把要播放的spine骨骼动画压入队列中，等待播放
     * @param props 骨骼动画属性
     */
    public spine(props: ISpineAnimat): Animat {
        try {
            if (this._status === 'pending') {
                ///////////////////////////////////
                this._animators.push(AnimatType.SPINE);
                if (!this._spineAnimat) {
                    this._spineAnimat = new SpineAnimat(this._target);
                }
                if (props.url) {
                    this.skeletonLoaded(props.url);
                }
                this._spineAnimat.addAnimatProps(props);
            }
        } catch (error) {
            this._status = 'rejected';
            this._err = error;
        }
        return this;
    }

    /**
     * 增加动画播放时的回调
     * @param resolved 
     */
    public onPlay(resolved: (value: any) => void): Animat {
        this.addCallback(resolved, 'play');
        return this;
    }

    /**
     * 增加动画播放结束后的回调
     * @param resolved 
     */
    public onStop(resolved: (value: any) => void): Animat {
        this.addCallback(resolved, 'stop');
        return this;
    }

    /**捕获播放异常的方法，会给回调返回错误信息 */
    public catch(rejected: (e: Error) => void): void {
        if (this._status === 'rejected') {
            rejected(this._err);
        }
    }

    private nextAnimat() {
        this._animatIndex++;
        if (this._animators[this._animatIndex] === AnimatType.ANIMATION) {
            this._frameAnimat.play();
        }
        else if (this._animators[this._animatIndex] === AnimatType.SPINE) {
            this._spineAnimat.play();
        }
    }

    private addCallback(resolved: (value: any) => void, type: string) {
        if (this._status === 'pending') {
            let len: number = this._animators.length;
            if (len === 0) {
                this._status = 'rejected';
                this._err = new Error('必须先指定播放的哪个动画！');
                return this;
            }
            if (this._animators[len - 1] === AnimatType.ANIMATION) {
                this._frameAnimat.addCallback({ call: resolved, type: type });
            }
            else if (this._animators[len - 1] === AnimatType.SPINE) {
                this._spineAnimat.addCallback({ call: resolved, type: type });
            }
        }
    }

    //加载spine骨骼动画
    private async skeletonLoaded(url: string) {
        let asset = await this.awaitLoad(sp.Skeleton, url).catch((e) => {
            this._status = e;
            this._err = new Error('spine骨骼动画加载错误！');
        });
        if (asset) {
            this._spineAnimat.setSkeletonData(asset);
        }
    }

    //加载clip动画
    private async animationLoaded(url: string) {
        let asset = await this.awaitLoad(cc.Animation, url).catch((e) => {
            this._status = e;
            this._err = new Error('clip动画加载错误！');
        });
        if (asset) {
            this._frameAnimat.addClip(asset);
        }
    }

    private awaitLoad(type: typeof cc.Animation| typeof sp.Skeleton, url: string) {
        return new Promise((resolve: (val: any) => void, reject: (err: any) => void) => {
            kit.Loader.setAnimat(this._target, url, type, (asset: any) => {
                if (!asset) {
                    reject('rejected');
                }
                resolve(asset);
            });
        });
    }
}
