/**
 * http 请求
 */
import { ConstValue } from "../Global/ConstValue";
import Utils, { Action, HttpReqSt, PropType, WebRequestResult } from "../Global/Utils";
import ConfigData from "./ConfigData";
import Singleton from "./SingleTon";

export enum NetState {
    Normal,
    Disconnect
}

export default class HttpQuestManager extends Singleton {
    // 签名Key
    //  let REQUEST_KEY = "gwBGmuptzUoyCzzhBsImdISpUt7PoDot";
    private _reqList: Array<HttpReqSt> = [];
    private _awaitTime: number = 2; // 请求时长超过该时间显示loading
    private _timeOutTag: number = -1;
    /**重连次数 */
    private _reconTimes: number = 0;
    /**最大重连次数 */
    private _maxReconTimes: number = 3;

    private removeReq(id: string) {
        for (let index = 0; index < this._reqList.length; index++) {
            let reqSt = this._reqList[index];
            if (id == reqSt.id) {
                this._reqList.splice(index, 1);
            }
        }
    }

    private addReq(reqstr: HttpReqSt) {
        let bHave = false;
        for (let index = 0; index < this._reqList.length; index++) {
            let reqSt = this._reqList[index];
            if (reqstr.id == reqSt.id) {
                bHave = true;
                break;
            }
        }

        if (!bHave) {
            this._reqList.push(reqstr);
        }
    }

    /**
     * send 请求
     */
    public send(url: string, param: any, act: Action) {
        let _act = new Action(this, (res: WebRequestResult) => {
            if (500 == res.code || 0 == res.code) {
                console.log(res.msg);
            }

            if (act) {
                act.Run([res]);
            }

            if (0 != res.code && undefined != res.code) {
                // 排除请求异常
                this.removeReq(res.id);
            }

            clearTimeout(this._timeOutTag);
            this._timeOutTag = -1;


        });

        let reqSt = new HttpReqSt(url+"?" + Utils.getSign(param), url, param, _act);
        // let reqSt=null;
        this.addReq(reqSt);
        let log = `发送http请求:${reqSt.id}`;
        console.log(log);
        Utils.requestWeb(reqSt);

        if (this._timeOutTag >= 0) {
            clearTimeout(this._timeOutTag);
            this._timeOutTag = -1;
        }
        this._timeOutTag = setTimeout(() => {
            if (this._reqList.length > 0) {
                // UIManager.getInstance().showDialog(DialogName.NetLoadingDialog);
                // 这里需要的话弹出一个网络加载的提示图即可
            }
        }, this._awaitTime * 1000);
    }

    /**
     * 进入游戏请求
     * @param activityId: 活动Id
     */
    gameInitStart(act: Action = null): void {
        this.send(ConfigData.resWebUrl + "cattleGame/gameIndex", { activityId: ConfigData.activityId }, new Action(this, function (res: WebRequestResult) {
            if (500 == res.code || "fail" == res.result) {
                return;
            }

            let data = res.data;
            ConfigData.userId = res.data.userid;
            ConfigData.userKey = "user" + ConfigData.userId + "_" + ConfigData.activityId;
            ConstValue.curLevel = data.levelNum2 - 1;
            // console.log(data);


            if (act) {
                act.Run([res]);
            }
            // 可以在这里做一个全局通知，通知游戏可以进行初始化了
            cc.game.emit("game_init",data);
        }));
    }

    /**
     * 请求道具数量通过类型
     * @param propType: 道具类型
     */
    getPropTypeNum(propType: number, act: Action = null): void {
        this.send(ConfigData.resWebUrl + "cattleGame/seleKnapsack", { type: propType }, act);
    }

    /**
     * 使用道具
     * @param propId: 道具ID
     */
    useProp(propId: number, act: Action = null): void {
        this.send(ConfigData.resWebUrl + "cattleGame/consumeItems", { type: propId, activityId: ConfigData.activityId }, act);
    }

    /**
     * 游戏失败复活请求
     * @param endType: 1复活卡，2下单，3助力，4成功过1关上报
     */
    gameEndRequest(endType: number, act: Action = null): void {
        this.send(ConfigData.resWebUrl + "cattleGame/clicFunction", { type: endType, activityId: ConfigData.activityId }, act);
    }

    /**
     * 游戏过关上报
     * @param times 用时
     * @param count 点击次数
     * @param num  杀死数量
     */
    // gamePassRequest(times: number, count: number, num: number, act: Action = null): void {
    //     this.send(ConfigData.resWebUrl + "cattleGame/clicLevel", { times: times, count: count, num: num, activityId: ConfigData.activityId }, act);
    // }

    /**
     *  剩余蚊子数
     */
    // takeMosquitoes(num: number, act: Action = null): void {
    //     this.send(ConfigData.resWebUrl + "cattleGame/takeMosquitoes", { num: num, activityId: ConfigData.activityId }, act);
    // }
    // /**
    //  *  核对答案
    //  */
    // checkAnswers(id: number, correct: number, act: Action = null): void {
    //     this.send(ConfigData.resWebUrl + "cattleGame/checkAnswers", { id: id, correct: correct, activityId: ConfigData.activityId }, act);
    // }

    /**
     * 商城道具列表请求
     * @param propType:
     */
    getShopPropList(propType: PropType, act: Action = null): void {
        this.send(ConfigData.resWebUrl + "game/getGameGoodList", { propType: propType, activityId: ConfigData.activityId }, act);
    }

    /**
     * 商城购买
     * @param id:
     */
    buyShopProp(id: number, act: Action = null): void {
        this.send(ConfigData.resWebUrl + "cattleGame/buyGameGood", { id: id, activityId: ConfigData.activityId }, act);
    }

    /**
     * 碎片列表
     * @param id:
     */
    debrisList(act: Action = null): void {
        this.send(ConfigData.resWebUrl + "cattleGame/debrisList", { activityId: ConfigData.activityId }, act);
    }
    /**
     * 碎片合成
     * @param id:
     */
    requestCompound(act: Action = null): void {
        this.send(ConfigData.resWebUrl + "cattleGame/clickCompound", { activityId: ConfigData.activityId }, act);
    }
    /**
     * 合成列表
     * @param _type:1待使用，2已使用，3已过期
     */
    compoundList(_type: number, act: Action = null): void {
        this.send(ConfigData.resWebUrl + "cattleGame/compoundList", { type: _type, activityId: ConfigData.activityId }, act);
    }

    /**
     * 获取转盘数据列表
     */
    raffleList(act: Action = null): void {
        this.send(ConfigData.resWebUrl + "raffle/raffleList", { activityId: ConfigData.activityId }, act);
    }

    /**
     * 开始抽奖
     */
    raffleClick(act: Action = null): void {
        this.send(ConfigData.resWebUrl + "raffle/raffleClick", { activityId: ConfigData.activityId }, act);
    }

    /**
     * 排行榜
     * @param _type 1： 全国排行 2:好友排行
     */
    rankingList(_type: number, act: Action = null): void {
        this.send(ConfigData.resWebUrl + "goddessGame/rankingList", { type: _type, activityId: ConfigData.activityId }, act);
    }

    /**心跳 */
    startHeart(act?: Action) {
        let reqSt = new HttpReqSt(Date.now().toString(), ConfigData.resWebUrl + "gamePay/gameHeart", {}, new Action(this, (res: WebRequestResult) => {
            if (res.result == "success") {
                if (act) {
                    act.Run(["success"]);
                }
                // console.log("收到服务器心跳");
                setTimeout(() => {
                    this.startHeart();
                }, 6000);
            } else {
                // 网络或服务器异常尝试重新连接
                // 这里提示网络/心跳请求失败
                console.log("心跳请求失败");
            }
        }));
        Utils.requestWeb(reqSt);
    }

    /**重新连接 */
    reconnect(auto: boolean = true) {
        let self = this;
        let tryreconnect = function (act: Action) {
            let reqSt = new HttpReqSt(Date.now().toString(), ConfigData.resWebUrl + "gamePay/gameHeart", {}, new Action(self, (res: WebRequestResult) => {
                if (res.result == "success") {
                    if (act) {
                        act.Run(["success"]);
                    }
                    console.log("reconnect success");
                } else {
                    // 网络或服务器异常尝试重新连接
                    if (act) {
                        act.Run(["fail"]);
                    }
                    console.log("reconnect fail");
                }
            }));
            Utils.requestWeb(reqSt);
        };

        tryreconnect(new Action(this, (result) => {
            if ("success" == result) {
                // 重连成功
                // NotifyMrg.getInstance().sendNotify(NotifyEventType.NetState, NetState.Normal);
                // NotifyMrg.getInstance().sendNotify(NotifyEventType.NetReconnect, { res: "success" });
                // 可以做一个提示重连成功
                this._reconTimes = 0;
                // 重新发送请求
                if (this._reqList.length > 0) {
                    let list = Utils.deepArrayCopy(this._reqList);
                    this._reqList = []
                    for (let index = 0; index < list.length; index++) {
                        const reqSt = list[index];
                        this.send(reqSt.url, reqSt.param, reqSt.act);
                    }
                }
                // 开启心跳
                this.startHeart();
            } else {
                // 重连失败
                this._reconTimes++;
                if (auto) {
                    // 这里需要的话可以做一个断线重连的逻辑,例如发送一个断线重连的全局消息
                    //NotifyMrg.getInstance().sendNotify(NotifyEventType.NetReconnect, { res: "fail", times: this._reconTimes, maxReconTimes: this._maxReconTimes });
                } else {
                    // 这里需要的话可以做一个断线重连的逻辑,例如发送一个断线重连的全局消息
                    //NotifyMrg.getInstance().sendNotify(NotifyEventType.NetReconnect, { res: "fail" });
                }

                if (this._reconTimes >= this._maxReconTimes) {
                    this._reconTimes = 0;
                }
            }
        }));
    }
}
