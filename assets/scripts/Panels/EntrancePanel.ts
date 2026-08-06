import { Advertise } from "../GameCodes/Advertise";
import GameMain from "../GameMain";
import { BaseUI } from "../UIManager/BaseUI";
import { UIManager } from "../UIManager/UIManager";
import CangpinPanel from "./CangpinPanel";
import MainPanel from "./MainPanel";
import PintuPanel from "./PintuPanel";
import RankPanel from "./RankPanel";
import TipPanel from "./TipPanel";
import { createMarketItems,createItemByRarityValue } from "../GameCodes/GameRules";

const {ccclass, property} = cc._decorator;

@ccclass
export default class EntrancePanel extends BaseUI {
    protected static className = "EntrancePanel";
    public static instance:EntrancePanel = null!;
    @property({type:cc.Node})
    btn_entryJiaoyiMode:cc.Node = null!;

    @property({type:cc.Node})
    btn_cangpinMode:cc.Node = null!;

    @property({type:cc.Node})
    btn_xiandingMode:cc.Node = null!;

    gongfangNode:cc.Node = null!;

    pintuNode:cc.Node = null!;

    rkSingleNode:cc.Node = null!;
    rkTotalNode:cc.Node = null!;

    // EntrancePanel/scroll/Content/view/gongfang/smallgame/list/pintu

    protected onLoad(): void {
        EntrancePanel.instance = this;
        this.rkSingleNode = this.node.getChildByName("rksingle");
        this.rkTotalNode = this.node.getChildByName("rktotal");

        this.gongfangNode = this.node.getChildByName("scroll").getChildByName("view").getChildByName("content").getChildByName("gongfang");

        this.pintuNode = this.gongfangNode.getChildByName("smallgame").getChildByName("list").getChildByName("pintu");

        this.rkSingleNode.on(cc.Node.EventType.TOUCH_END,this.onOpenSingleRank,this)
        this.rkTotalNode.on(cc.Node.EventType.TOUCH_END,this.onOpenTotalRank,this)

        this.pintuNode.on(cc.Node.EventType.TOUCH_END,this.onOpenPintu,this)
    }

    private onOpenPintu(){
        UIManager.getInstance().openUI(PintuPanel, 1, (ui: PintuPanel) => {
            ui.onShow();
            let excludeIds = GameMain.instance.mainRuntime.ctx.inventoryItemInstance.map(item => item.id);
            let itemInstance = createItemByRarityValue(2,excludeIds);
            ui.setResultSprite(itemInstance);
        })
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
        this.btn_xiandingMode.on(cc.Node.EventType.TOUCH_END,this.onEnterXianding,this)

        Advertise.instance.ShowHengfuAd();

        let hand = this.btn_entryJiaoyiMode.getChildByName("hand2");

        cc.tween(hand)
            .repeatForever(
                cc.tween()
                .to(0,{opacity:255})
                .by(0.6,{scale:0.3},{easing:"sineInOut"})
                .by(0.6,{scale:-0.3},{easing:"sineInOut"})
                .by(0.6,{scale:0.3},{easing:"sineInOut"})
                .by(0.6,{scale:-0.3},{easing:"sineInOut"})
                .delay(0.5)
                .call(()=>{
                    hand.opacity = 0;
                })
                .delay(3.5)
            )
            .start()

        // cc.tween(this.btn_entryJiaoyiMode.parent)
        //     .repeatForever(
        //         cc.tween().to(0.35,{scale:1.05})
        //             .to(0.9,{scale:1.0})
        //     )
        //     .start()

            // cc.tween(this.node.getChildByName("cangguan"))
            // .repeatForever(
            //     cc.tween().to(0.85,{scale:1.05},{easing:"outBack"})
            //         .to(0.85,{scale:1.0})
            // )
            // .start()
    }
    // 打开藏品馆馆界面
    private onEnterCangpin(){
        // UIManager.getInstance().openUI(TipPanel, 1, (ui: TipPanel) => {
        //     ui.onShow();
        //     ui.showTip("藏馆布置中,等展柜安好，再开门迎客", null, false, 1.5)
        // })
        //
        UIManager.getInstance().closeUI(EntrancePanel);
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

    private onEnterXianding(){
        UIManager.getInstance().openUI(TipPanel, 1, (ui: TipPanel) => {
            ui.onShow();
            ui.showTip("敬请期待~", null, false, 1.5)
        })
    }

    upgradeTotalMoney(){
        this.node.getChildByName("totalMoney").getChildByName("content").getComponent(cc.Label).string = "总预算: "+ String(GameMain.instance.mainRuntime.ctx.totalMoney);
    }

    onDestroy(): void {
        Advertise.instance.HideHengfuAd();
    }
}
