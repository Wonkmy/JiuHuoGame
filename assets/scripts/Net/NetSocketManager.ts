import Utils from "../Global/Utils";
import MainPanel from "../Panels/MainPanel";
import { UIManager } from "../UIManager/UIManager";
import Singleton from "./SingleTon";


/**
 * webSocket
 */
export default class NetSocketManager extends Singleton {
    private _reconnectLock: boolean = false;
    private _pingTimeOut: number = 5000;// 心跳超时时间 (单位毫秒)
    private _pingTimeOutTag: number = undefined;
    private _serverTimeOutTag: number = undefined;
    private _reConnectCount: number = 0; // 断线重连的次数
    private _maxReconnect: number = 3; // 最大重连次数
    private _socket: WebSocket = null;  //当前的webSocket的对象
    private _reqCode: string = "";
    // private _url: string = "ws://m.kefeichangduo.top/websocket";
    private _url: string = "wss://m.kefeichangduo.top/websocket";

    public startSocket(code: string) {
        this._reqCode = code;
        console.log("start connect socket ", this._url + code);
        this.createWebSocket();
    }

    /**创建Socket */
    private createWebSocket() {
        if (this.isOpen()) {
            console.error("socket have open");
        }
        //清空以前socket的绑定
        if (this._socket) {
            this._socket.onopen = undefined;
            this._socket.onmessage = undefined;
            this._socket.onclose = undefined;
            this._socket.onerror = undefined;
        }

        this._socket = new WebSocket(this._url + "?code=" + this._reqCode);
        this._socket.binaryType = "arraybuffer"; // We are talking binary
        this._socket.onopen = () => {
            console.log("Websocket Successfully Connected");
            //开始心跳
            // this.startHeart();
            cc.game.dispatchEvent(new cc.Event.EventCustom("wsOpen", false));
        };

        this._socket.onclose = (event) => {
            this._reconnectLock = false;
            // this.reConnect();
            console.log("Socket success onclose", event.reason);
        };

        this._socket.onerror = (event) => {
            this._reconnectLock = false;
            // this.reConnect();
            console.log("Socket onerror", event);
        };

        this._socket.onmessage = (event) => {
            this.onMessage(event["data"]);
        };
    }

    private reConnect(callback?, num?) {
        if (this._reconnectLock) {
            console.log("正在尝试重新连接中...");
            return;
        }

        this._reConnectCount++;
        if (this._reConnectCount >= this._maxReconnect) {
            clearTimeout(this._serverTimeOutTag);
            // 弹框提示网络或服务器异常
            return;
        }

        if (this._socket && cc.sys.isObjectValid(this._socket)) {
            if (this._socket.readyState > WebSocket.OPEN) {
                this._socket.close();
                // this.createWebSocket();
            } else {
                if (this.isOpen() === true) {
                    this.startHeart();
                    if (callback) callback(num);
                }
            }
        } else {
            // this.createWebSocket();
        }

        this._reconnectLock = true;
    }

    /**
     * 开启心跳检测
     */
    private startHeart() {
        if (this._pingTimeOutTag) {
            clearTimeout(this._pingTimeOutTag)
            this._pingTimeOut = undefined;
        }

        // 发送心跳包
        this._pingTimeOutTag = setTimeout(() => {
            this.sendMsg("heart");
            this._serverTimeOutTag = setTimeout(() => {
                this.close();
            }, this._serverTimeOutTag);
        }, this._pingTimeOut);
    }

    /**
     * 接收消息
     */
    private onMessage(data: any) {
        console.log("frome server ", data);
        if (!data) return;

        if ("1" == data) {
            // 好有助力成功通知
            // NotifyMrg.getInstance().sendNotify(NotifyEventType.FriendHelpBack);
            // cc.game.emit("FriendHelpBack");
            UIManager.getInstance().closeUI(MainPanel);
        } else if ("200" == data) {
            // 广告回调
            // NotifyMrg.getInstance().sendNotify(NotifyEventType.AdReqCb);
            cc.game.emit("AdReqCb");
        }

        if (!Utils.isJsonStr(data)) {
            console.log("no invalid json");
            return ;
        }

        let msg = JSON.parse(data);
        if (msg.heart) {
            clearTimeout(this._serverTimeOutTag);
            // 重新开始心跳
            this.startHeart();
        }
    }

    /**
     * 发送消息
     */
    public sendMsg(msg: string) {
        if (this.isOpen()) {
            this._socket.send(msg);
        }
    }


    public isOpen() {
        if (this._socket && cc.sys.isObjectValid(this._socket)) {
            return this._socket.readyState === WebSocket.OPEN;
        } else {
            return false;
        }
    }

    public isConnecting() {
        if (this._socket && cc.sys.isObjectValid(this._socket)) {
            return this._socket.readyState === WebSocket.CONNECTING;
        } else {
            return false;
        }
    }

    public close() {
        if (this._socket && cc.sys.isObjectValid(this._socket)) {
            this._socket.close();
        } else {
            console.log("NO Socket");
        }

        this._reqCode = "";
    }
}
