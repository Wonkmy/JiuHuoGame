import GameMain from "../GameMain";
import Opendata from "../libs/Opendata";
import { BaseUI } from "../UIManager/BaseUI";
import { UIManager } from "../UIManager/UIManager";

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

    currentPage: number = 1;
    currentRankName: string = "rksingle";


    private rankBtnCooling: boolean = false;

    protected onLoad(): void {
        RankPanel.instance = this;
        this.close_btn.on(cc.Node.EventType.TOUCH_END, this.closePanel, this);
        this.left_btn.on(cc.Node.EventType.TOUCH_END, this.prevPage, this);
        this.right_btn.on(cc.Node.EventType.TOUCH_END, this.nextPage, this);
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
    }

    showRank(rankType: string) {
        if (rankType === "rksingle") {
            this.node.getChildByName("title").getComponent(cc.Label).string = "单局榜";
            this.currentRankName = "rksingle";
        } else if (rankType === "rktotal") {
            this.node.getChildByName("title").getComponent(cc.Label).string = "总榜";
            this.currentRankName = "rktotal";
        }
        this.refreshRank();
    }

    private refreshRank() {
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
    private closePanel() {
        UIManager.getInstance().closeUI(RankPanel);
    }
}
