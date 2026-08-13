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
import ZhenjiaPanel from "./ZhenjiaPanel";
import DialogPanel from "./DialogPanel";
import ChooseLocationPanel from "./ChooseLocationPanel";

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

    @property({type:cc.Label})
    noADNodeTimer:cc.Label = null!;

    gongfangNode:cc.Node = null!;

    pintuNode:cc.Node = null!;
    zhenjiaNode:cc.Node = null!;

    rkSingleNode:cc.Node = null!;
    rkTotalNode:cc.Node = null!;

    noADNode:cc.Node = null!;// 看激励视频免广告30分钟

    paotanNode:cc.Node = null;

    protected onLoad(): void {
        EntrancePanel.instance = this;
        Advertise.instance.ShowChapingAd();
        this.rkSingleNode = this.node.getChildByName("rksingle");
        this.rkTotalNode = this.node.getChildByName("rktotal");
        this.noADNode = this.node.getChildByName("noADNode");
        this.paotanNode = this.node.getChildByName("paotan");

        this.gongfangNode = this.node.getChildByName("scroll").getChildByName("view").getChildByName("content").getChildByName("gongfang");

        this.pintuNode = this.gongfangNode.getChildByName("smallgame").getChildByName("list").getChildByName("pintu");
        this.zhenjiaNode = this.gongfangNode.getChildByName("smallgame").getChildByName("list").getChildByName("zhenjia");

        this.rkSingleNode.on(cc.Node.EventType.TOUCH_END,this.onOpenSingleRank,this)
        this.rkTotalNode.on(cc.Node.EventType.TOUCH_END,this.onOpenTotalRank,this)

        this.pintuNode.on(cc.Node.EventType.TOUCH_END,this.onOpenPintu,this)
        this.zhenjiaNode.on(cc.Node.EventType.TOUCH_END,this.onOpenZhenjia,this)
        this.noADNode.on(cc.Node.EventType.TOUCH_END,this.onNoAd,this)
        this.paotanNode.on(cc.Node.EventType.TOUCH_END,this.onOpenPaotan,this)


        setTimeout(() => {
            let left = GameMain.instance.getNoAdLeftSeconds();
            if(left<=0){
                this.noADNodeTimer.string = ""
            }else{
                let min = Math.floor(left / 60);
                let sec = left % 60;
                this.noADNodeTimer.string = `剩余 ${min}:${sec < 10 ? "0" + sec : sec}`
            }
        }, 1000);
    }

    private onOpenPaotan(){
        UIManager.getInstance().openUI(ChooseLocationPanel, 1, (ui: ChooseLocationPanel) => {
            ui.onShow();
        })
    }

    private onNoAd(){
        UIManager.getInstance().openUI(DialogPanel, 1, (ui: DialogPanel) => {
            ui.onShow();
            ui.setContent("看一段赞助,5分钟内不再弹出自动广告?\n本次游戏生效", () => {
                Advertise.instance.ShowVideoAd((res:number)=>{
                    if(res === 1){
                        GameMain.instance.openNoAdForMinutes(5);
                        UIManager.getInstance().closeUI(DialogPanel);
                    }
                });
            }, true)
        })
    }

    private onOpenPintu(){
        UIManager.getInstance().openUI(PintuPanel, 1, (ui: PintuPanel) => {
            ui.onShow();
            let excludeIds = GameMain.instance.mainRuntime.ctx.inventoryItemInstance.map(item => item.id);
            let itemInstance = createItemByRarityValue(2,excludeIds);
            ui.setResultSprite(itemInstance);
        })
    }

    private onOpenZhenjia(){
        UIManager.getInstance().openUI(ZhenjiaPanel, 1, (ui: ZhenjiaPanel) => {
            ui.onShow();
            let excludeIds = GameMain.instance.mainRuntime.ctx.inventoryItemInstance.map(item => item.id);
            let itemInstance = createItemByRarityValue(2,excludeIds);
            ui.setGoods(itemInstance);
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
        this.node.getChildByName("UserInfoContainer").getChildByName("nickName").getComponent(cc.Label).string = GameMain.instance.mainRuntime.ctx.nickName;
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

        this.playWorkshopBtnAnim()
    }

    private playWorkshopBtnAnim() {
        const normalScale = 1.5;
        const bigScale = 1.72;

        this.pintuNode.stopAllActions();
        this.zhenjiaNode.stopAllActions();

        this.pintuNode.scale = normalScale;
        this.zhenjiaNode.scale = normalScale;

        // 注意：Action 不能复用，所以每个节点都要重新创建一套 action
        const createAction = () => {
            return cc.repeatForever(
                cc.sequence(
                    cc.scaleTo(0.25, bigScale),
                    cc.scaleTo(0.25, normalScale),
                    cc.delayTime(1)
                )
            );
        };

        this.pintuNode.runAction(createAction());

        this.scheduleOnce(() => {
            this.zhenjiaNode.runAction(createAction());
        }, 0.5);
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
        postMaiDian("限定馆")
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
