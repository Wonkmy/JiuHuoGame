import GameMain from "../GameMain";

/*
 * @Author: Fayn86
 * @Date: 2020-12-01 16:24:49
 * @LastEditTime: 2020-12-02 17:33:23
 * @LastEditors: Fayn86
 * @FilePath: \HuoShanPenFa\assets\scripts\FaynUtils.ts
 */
export class FaynUtils {
    //#region cocos PlayMusic
    static PlayMusic(name, loop = false, volume = 1) {
        AudioEngine.Play(name, loop, volume);
    }
    static PauseMusic(name) {
        AudioEngine.Pause(name);
    }
    static ResumeMusic(name) {
        AudioEngine.Resume(name);
    }
    //#endregion

    static CocosExtend() {

        //#region 属性
        // @ts-ignore
        cc.Node.prototype.sprite = function () {
            return this.getComponent(cc.Sprite);
        }// @ts-ignore
        cc.Node.prototype.spriteFrame = function () {
            return (this.getComponent(cc.Sprite) as cc.Sprite).spriteFrame;
        }
        // @ts-ignore
        cc.Node.prototype.label = function () {
            return this.getComponent(cc.Label);
        }
        // @ts-ignore
        cc.Node.prototype.labelString = function () {
            return (this.getComponent(cc.Label) as cc.Label).string;
        }
        // @ts-ignore
        cc.Node.prototype.dragonBone = function () {
            return this.getComponent(dragonBones.ArmatureDisplay);
        }
        //#endregion

        //#region 动画
        // @ts-ignore
        cc.Node.prototype.show = function(t = 0, callFunc = null) {
            cc.tween(this).to(t, {opacity: 255}).call(callFunc != null ? callFunc: "").start();
        }
        // @ts-ignore
        cc.Node.prototype.hide = function(t = 0, active = false, callFunc = null) {
            cc.tween(this).to(t, {opacity: 0}).call(() => {
                this.active = active;
                return callFunc != null ? callFunc(): null;
            }).start();
        }
        // @ts-ignore
        cc.Node.prototype.heartBeat1 = function() {
            cc.tween(this).repeatForever(cc.tween().delay(1).to(0.2, {scale: 1.03}).to(0.1, {scale: 1}).to(0.15, {scale: 1.02}).to(0.1, {scale: 1})).start()
        }
        // @ts-ignore
        cc.Node.prototype.heartBeat2 = function() {
            cc.tween(this).repeatForever(cc.tween().to(0.2, {scale: 1.1}).to(0.1, {scale: 1}).to(0.15, {scale: 1.05}).to(0.1, {scale: 1}).to(0.1, {angle: 4}).to(0.2, {angle: -4}).to(0.1, {angle: 2}).to(0.1, {angle: -2}).to(0.05, {angle: 0}).delay(1)).start()
        }
        //#endregion

        //#region 方法
        // @ts-ignore
        cc.Node.prototype.getPosFromNode = function(otherNode: cc.Node) {
            let node = this as cc.Node;
            let wp = node.parent.convertToWorldSpaceAR(node.position);
            let op = otherNode.parent.convertToNodeSpaceAR(wp);
            return op;
        }
// @ts-ignore
        cc.Node.prototype.moveToNodePos = function(otherNode: cc.Node, dt, eas = null, callFunc = null) {
            let node = this as cc.Node;
            let wp = otherNode.parent.convertToWorldSpaceAR(node.position);
            let op = node.parent.convertToNodeSpaceAR(wp);
            cc.tween(this).to(dt, {position: op}, {easing: eas}).call(callFunc).start();
            return op;
        }
// @ts-ignore
        cc.Node.prototype.find = function(name) {
            return (this as cc.Node).getChildByName(name);
        }
        // @ts-ignore
        cc.Node.prototype.comp = function(name) {
            return (this as cc.Node).getComponent(name);
        }
        //#endregion
    }


    ////#region 事件
    private static events: IEvents = {};

    private static onceEvents: IEvents = {};

    /**
     * 监听事件
     * @param event 事件名
     * @param callback 回调
     * @param object 订阅对象
     */
    public static on(event: string, callback: Function, object?: any) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push({ callback, object });
    }

    /**
     * 监听事件（一次性）
     * @param event 事件名
     * @param callback 回调
     * @param object 订阅对象
     */
    public static once(event: string, callback: Function, object?: any) {
        if (!this.onceEvents[event]) this.onceEvents[event] = [];
        this.onceEvents[event].push({ callback, object });
    }

    /**
     * 取消监听事件
     * @param event 事件名
     * @param callback 回调
     * @param object 订阅对象
     */
    public static off(event: string, callback: Function, object?: any) {
        if (this.events[event]) {
            for (let i = 0; i < this.events[event].length; i++) {
                if (this.events[event][i].callback === callback && (!object || this.events[event][i].object === object)) {
                    this.events[event].splice(i, 1);
                    i--;
                }
            }
        }
        // 一次性事件
        if (this.onceEvents[event]) {
            for (let i = 0; i < this.onceEvents[event].length; i++) {
                if (this.onceEvents[event][i].callback === callback && (!object || this.onceEvents[event][i].object === object)) {
                    this.onceEvents[event].splice(i, 1);
                    i--;
                }
            }
        }
    }

    /**
     * 发射事件
     * @param event 事件名
     * @param args 参数
     */
    public static emit(event: string, ...args: any[]) {
        if (this.events[event]) {
            for (let i = 0; i < this.events[event].length; i++) {
                this.events[event][i].callback.apply(this.events[event][i].object, args);
            }
        }
        // 一次性事件
        if (this.onceEvents[event]) {
            for (let i = 0; i < this.onceEvents[event].length; i++) {
                this.onceEvents[event][i].callback.apply(this.onceEvents[event][i].object, args);
            }
            this.onceEvents[event] = [];
        }
    }

    /**
     * 移除事件
     * @param event 事件名
     */
    public static remove(event: string) {
        if (this.events[event]) delete this.events[event];
        if (this.onceEvents[event]) delete this.onceEvents[event];
    }

    /**
     * 移除所有事件
     */
    public static removeAll() {
        this.events = {};
        this.onceEvents = {};
    }
    //#endregion
}

interface ISubscription {
    callback: Function;
    object: any;
}

interface IEvents {
    [event: string]: ISubscription[];
}



const { ccclass, property } = cc._decorator;

@ccclass

class AudioEngine extends cc.Component {
    // LIFE-CYCLE CALLBACKS:

    private static audios: Audio[] = [];
    private static path: string = "";

    private static Preload(path:string) {
        AudioEngine.audios = new Array<Audio>();
        GameMain.instance.bundle.preloadDir(path, cc.AudioClip);

        this.path = path;
    }

    public static Play(name:string, loop = false, volume = 1) {
        if (AudioEngine.audios == undefined) {
            AudioEngine.audios = new Array<Audio>();
            GameMain.instance.bundle.preloadDir('audios', cc.AudioClip);
        }

        let audioID;
        let a: Audio;
        GameMain.instance.bundle.load((this.path != "" ? this.path + "/" + name : "audios/" + name), cc.AudioClip, (err, audio: cc.AudioClip) => {
            audioID = cc.audioEngine.play(audio, loop, volume);
            a = new Audio(audioID, audio);
            AudioEngine.audios.push(a);
            cc.audioEngine.setFinishCallback(audioID, function () {
                AudioEngine.removeFinishedAudio(audioID);
            })
        })

        return audioID;
    }

    public static Resume(name) {
        let aId = this.GetIdByName(name);
        if (aId != -1) {
            cc.audioEngine.resume(aId);
            return aId;
        }
        return -1;
    }

    public static Pause(name) {
        let audioId = AudioEngine.GetIdByName(name);

        if (audioId != null) {
            return cc.audioEngine.pause(audioId);
        }

        return null;
    }

    public static GetState(name) {

        let audioId = AudioEngine.GetIdByName(name)

        if (audioId != null) return cc.audioEngine.getState(audioId)

        return null;
    }

    private static removeFinishedAudio(audioID) {
        //删除非循环播放
        for (let taudio of AudioEngine.audios) {
            if (taudio.id === audioID && cc.audioEngine.isLoop(audioID) == false) {
                let index = AudioEngine.audios.indexOf(taudio);
                if (index > -1) {
                    AudioEngine.audios.splice(index, 1);
                    return;
                }
            }
        }
    }



    private static GetIdByName(name) {
        for (let taudio of AudioEngine.audios) {
            if (taudio.name === name) {
                return taudio.id
            }
        }
        return -1;
    }
    // update (dt) {}
}

class Audio {
    public id: number;
    public clip: cc.AudioClip;
    public name: string;

    constructor(_id, _clip) {
        this.id = _id;
        this.clip = _clip;
        this.name = _clip.name;
    }

}

FaynUtils.CocosExtend();
