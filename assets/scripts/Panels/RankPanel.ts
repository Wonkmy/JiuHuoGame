import { postMaiDian } from "../GameCodes/GameRules";
import RankCell from "../GameCodes/RankCell";
import GameMain from "../GameMain";
import Opendata from "../libs/Opendata";
import { BaseUI } from "../UIManager/BaseUI";
import { UIManager } from "../UIManager/UIManager";
import DialogPanel from "./DialogPanel";
import EntrancePanel from "./EntrancePanel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RankPanel extends BaseUI {
    public static instance: RankPanel = null!;
    protected static className = "RankPanel";
    @property({ type: cc.Node })
    close_btn: cc.Node = null!;


    @property({ type: cc.Node })
    left_btn: cc.Node = null!;

    @property({ type: cc.Node })
    right_btn: cc.Node = null!;

    @property({ type: cc.Node })
    btn_singleRank: cc.Node = null!;

    @property({ type: cc.Node })
    btn_total_friendRank: cc.Node = null!;

    @property({ type: cc.Node })
    btn_total_GlobalRank: cc.Node = null!;

    currentPage: number = 1;
    currentRankName: string = "rksingle";


    private rankBtnCooling: boolean = false;

    protected onLoad(): void {
        RankPanel.instance = this;
        this.close_btn.on(cc.Node.EventType.TOUCH_END, this.closePanel, this);
        this.left_btn.on(cc.Node.EventType.TOUCH_END, this.prevPage, this);
        this.right_btn.on(cc.Node.EventType.TOUCH_END, this.nextPage, this);

        this.btn_singleRank.on(cc.Node.EventType.TOUCH_END,this.onOpenSingleRank,this)
        this.btn_total_friendRank.on(cc.Node.EventType.TOUCH_END,this.onOpentotal_friendRank,this)
        this.btn_total_GlobalRank.on(cc.Node.EventType.TOUCH_END,this.onOpentotal_GlobalRank,this)
    }

    private prevPage() {
        if (this.rankBtnCooling) return;

        if (this.currentPage <= 1) {
            return;
        }

        this.currentPage--;
        this.node.getChildByName("page").getComponent(cc.Label).string = "第" + this.currentPage + "页";
        this.refreshRankWithCoolDown();
    }

    private nextPage() {
        if (this.rankBtnCooling) return;

        this.currentPage++;
        this.node.getChildByName("page").getComponent(cc.Label).string = "第" + this.currentPage + "页";
        this.refreshRankWithCoolDown();
    }
    private refreshRankWithCoolDown() {
        this.rankBtnCooling = true;
        this.refreshRank();

        this.scheduleOnce(() => {
            this.rankBtnCooling = false;
        }, 0.3);
    }
    override onShow(): void {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) { //判断微信环境
            console.log("打开排行榜");
            this.currentPage = 1;
            this.node.getChildByName("page").getComponent(cc.Label).string = "第" + this.currentPage + "页";
        }
        postMaiDian("进入排行榜")
    }

    onOpenSingleRank(){
        this.node.getChildByName("top").getChildByName("list").removeAllChildren();
        this.currentPage = 1;
        this.btn_singleRank.color = cc.Color.RED;
        this.btn_total_friendRank.color = cc.Color.WHITE;
        this.btn_total_GlobalRank.color = cc.Color.WHITE;
        this.currentRankName = "rksingle";
        this.refreshRank();
        postMaiDian("进入单局榜")
    }
    onOpentotal_friendRank(){
        this.node.getChildByName("top").getChildByName("list").removeAllChildren();
        this.currentPage = 1;
        this.btn_singleRank.color = cc.Color.WHITE;
        this.btn_total_friendRank.color = cc.Color.RED;
        this.btn_total_GlobalRank.color = cc.Color.WHITE;
        this.currentRankName = "rktotal";
        this.refreshRank();
        postMaiDian("进入总榜(好友)")
    }

    onOpentotal_GlobalRank(){
        if (cc.sys.platform !== cc.sys.WECHAT_GAME) {
            console.log("不是微信环境，直接return了");

            return;
        }

        if (!Opendata.instance || !Opendata.instance.getOpencontext()) {
            return;
        }
        Opendata.instance.getOpencontext().postMessage({
            type: 'engine',
            event: 'clear',
        });
        UIManager.getInstance().openUI(DialogPanel, 3, (ui: DialogPanel) => {
            ui.onShow();
            ui.setContent("修改下昵称更容易在榜上找到自己", () => {
                EntrancePanel.instance.onOpenProfilePanel();
            },"去修改", false)

            this.currentPage = 1;
            this.btn_singleRank.color = cc.Color.WHITE;
            this.btn_total_friendRank.color = cc.Color.WHITE;
            this.btn_total_GlobalRank.color = cc.Color.RED;
            this.currentRankName = "gbtotal";
            this.refreshRank();
            postMaiDian("进入总榜(全服)")
            UIManager.getInstance().closeUI(DialogPanel);
        })
    }

    showRank() {
        // if (rankType === "rksingle") {
        //     this.node.getChildByName("title").getComponent(cc.Label).string = "单局榜";

        // } else if (rankType === "rktotal") {
        //     this.node.getChildByName("title").getComponent(cc.Label).string = "总榜";
        // }
        // this.refreshRank();
        if (cc.sys.platform === cc.sys.WECHAT_GAME){
            this.onOpenSingleRank();
        }else{
            this.onOpentotal_GlobalRank()
        }
    }

    private refreshRank() {
        if(this.currentRankName === "gbtotal"){
            this.node.getChildByName("top").getChildByName("list").removeAllChildren();
            this.getPlayer(this.currentPage, 5, (players) => {
                for (let i = 0; i < players.length; i++) {
                    const pdata = players[i];
                    GameMain.instance.bundle.load("prefab/rankCell", cc.Prefab, (err, rkp: cc.Prefab) => {
                        if (err) {
                            console.error("load item spriteFrame error:", err);
                            return;
                        }
                        let newRankCell = cc.instantiate(rkp);
                        this.node.getChildByName("top").getChildByName("list").addChild(newRankCell);
                        let rank = (this.currentPage - 1) * 5 + (i + 1);
                        newRankCell.getComponent(RankCell).init(rank, pdata)
                    })
                }
            });
        }else{
            if (cc.sys.platform !== cc.sys.WECHAT_GAME) {
                return;
            }

            if (!Opendata.instance || !Opendata.instance.getOpencontext()) {
                return;
            }
            Opendata.instance.getOpencontext().postMessage({
                type: 'engine',
                event: 'level',
                key: this.currentRankName,
                page: this.currentPage,
            });
        }
    }
    private closePanel() {
        UIManager.getInstance().closeUI(RankPanel);
    }

    private getPlayer(pageIndex:number = 1,pageSize:number = 10,callback:any) {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.request({
                url: `https://jianbao.dxstudio.site/api/dyn/player?page=${pageIndex}&pageSize=${pageSize}&sortBy=totalmoney`,
                data: {},
                header: { 'content-type': 'application/json' },
                method: 'GET',
                dataType: 'json',
                responseType: 'text',
                success: (result) => {
                    // console.log('GET 请求成功:getPlayer', result);
                    var players = result.data.data.list;
                    callback(players);
                },
                fail: (errMsg) => {
                    console.error('request GET 请求失败', errMsg);
                },
                complete: () => { }
            });
        } else {
            fetch(`https://jianbao.dxstudio.site/api/dyn/player?page=${pageIndex}&pageSize=${pageSize}&sortBy=totalmoney`, {
                method: 'GET',
            })
                .then((response: Response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    // 根据返回数据类型选择解析方式
                    return response.json(); // 或 response.text() 获取纯文本
                })
                .then((result) => {
                    console.log('GET 请求成功:getPlayer', result);
                    var players = result.data.list;
                    callback(players);
                })
                .catch((error) => {
                    console.error('GET 请求失败:', error);
                });
        }
    }
}
