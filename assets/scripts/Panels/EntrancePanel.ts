import { Advertise } from "../GameCodes/Advertise";
import GameMain from "../GameMain";
import { BaseUI } from "../UIManager/BaseUI";
import { UIManager } from "../UIManager/UIManager";
import CangpinPanel from "./CangpinPanel";
import MainPanel from "./MainPanel";
import RankPanel from "./RankPanel";
import TipPanel from "./TipPanel";

const {ccclass, property} = cc._decorator;

@ccclass
export default class EntrancePanel extends BaseUI {
    protected static className = "EntrancePanel";
    public static instance:EntrancePanel = null!;
    @property({type:cc.Node})
    btn_entryJiaoyiMode:cc.Node = null!;

    @property({type:cc.Node})
    btn_cangpinMode:cc.Node = null!;

    rkSingleNode:cc.Node = null!;
    rkTotalNode:cc.Node = null!;

    protected onLoad(): void {
        EntrancePanel.instance = this;
        this.rkSingleNode = this.node.getChildByName("rksingle");
        this.rkTotalNode = this.node.getChildByName("rktotal");

        this.rkSingleNode.on(cc.Node.EventType.TOUCH_END,this.onOpenSingleRank,this)
        this.rkTotalNode.on(cc.Node.EventType.TOUCH_END,this.onOpenTotalRank,this)
    }

    private onOpenSingleRank(){
        UIManager.getInstance().openUI(RankPanel, 2, (ui: RankPanel) => {
            ui.onShow();
            ui.showRank("rksingle");
        })
    }

    private onOpenTotalRank(){
        UIManager.getInstance().openUI(RankPanel, 2, (ui: RankPanel) => {
            ui.onShow();
            ui.showRank("rktotal");
        })
    }

    override onShow(): void {
        this.upgradeTotalMoney();
        this.btn_entryJiaoyiMode.on(cc.Node.EventType.TOUCH_END,this.onEnterJiaoyi,this)
        this.btn_cangpinMode.on(cc.Node.EventType.TOUCH_END,this.onEnterCangpin,this)

        Advertise.instance.ShowHengfuAd();

        cc.tween(this.node.getChildByName("jiaoyi"))
            .repeatForever(
                cc.tween().to(0.9,{scale:1.05})
                    .to(0.9,{scale:1.0})
            )
            .start()

            cc.tween(this.node.getChildByName("cangguan"))
            .repeatForever(
                cc.tween().to(0.85,{scale:1.05},{easing:"outBack"})
                    .to(0.85,{scale:1.0})
            )
            .start()
    }
    // 打开藏品馆馆界面
    private onEnterCangpin(){
        // UIManager.getInstance().openUI(TipPanel, 1, (ui: TipPanel) => {
        //     ui.onShow();
        //     ui.showTip("藏馆布置中,等展柜安好，再开门迎客", null, false, 1.5)
        // })
        //
        Advertise.instance.HideHengfuAd();
        UIManager.getInstance().openUI(CangpinPanel, 1, (ui: CangpinPanel) => {
            ui.onShow();
        })
    }

    private onEnterJiaoyi(){
        UIManager.getInstance().closeUI(EntrancePanel);
        UIManager.getInstance().openUI(MainPanel, 0, (ui: MainPanel) => {
            ui.onShow();
        })
    }

    upgradeTotalMoney(){
        this.node.getChildByName("totalMoney").getChildByName("content").getComponent(cc.Label).string = "总预算: "+ String(GameMain.instance.mainRuntime.ctx.totalMoney);
    }

    onDestroy(): void {
        Advertise.instance.HideHengfuAd();
    }
}
