import {ItemInstance } from "../GameCodes/Datas/GameData";
import { createMarketItems } from "../GameCodes/GameRules";
import GameContext from "../GameCodes/GameRules";
import GameMain from "../GameMain";
import { ConstValue } from "../Global/ConstValue";
import { FaynUtils } from "../Global/FaynUtils";
import { BaseUI } from "../UIManager/BaseUI";
import ItemCell from "../UIManager/ItemCell";
import { UIManager } from "../UIManager/UIManager";
import MainPanelRuntime from "./MainPanelRuntime";
import TipPanel from "./TipPanel";
import YiJiaPanel from "./YiJiaPanel";
import BagPanel from "./BagPanel";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MainPanel extends BaseUI {
    public static instance:MainPanel = null!;
    protected static className = "MainPanel";

    btn_YJ:cc.Node = null!;
    btn_ReRoll:cc.Node = null!;

    marketItemContainer:cc.Node = null!;

    totalCostMoney:number = 0;

    @property({type:cc.Node})
    openBagPanel:cc.Node = null!;

    @property({type:cc.Node})
    openExpertBagPanel:cc.Node = null!;

    onLoad(): void {
        MainPanel.instance = this;
    }

    override onShow(): void {
        this.btn_YJ = this.node.getChildByName("btn_YJ");
        this.btn_ReRoll = this.node.getChildByName("btn_ReRoll");
        this.marketItemContainer = this.node.getChildByName("ItemContainers").getChildByName("sview").getChildByName("view").getChildByName("content")
        GameMain.instance.mainRuntime.createMarketTrend();
        this.onCreateItems();

        this.btn_YJ.on(cc.Node.EventType.TOUCH_END,this.onYiJia ,this)
        this.btn_ReRoll.on(cc.Node.EventType.TOUCH_END,this.onReRoll ,this)
        this.openBagPanel.on(cc.Node.EventType.TOUCH_END, () => {
            FaynUtils.PlayMusic("btnclick",false,1);
            UIManager.getInstance().openUI(BagPanel, 0, (ui: BagPanel) => {
                ui.onShow();
                ui.setInventoryData("bag")
            })
        }, this)

        this.openExpertBagPanel.on(cc.Node.EventType.TOUCH_END, () => {
            FaynUtils.PlayMusic("btnclick",false,1);
            UIManager.getInstance().openUI(BagPanel, 0, (ui: BagPanel) => {
                ui.onShow();
                ui.setInventoryData("expert")
            })
        }, this)

        this.showGuideTipOnce("main_buy","先买入几件旧货，买入价越低，试错空间越大。",2);
    }

    onCreateItems(){
        this.marketItemContainer.removeAllChildren();
        let nextuid = ()=>GameMain.instance.mainRuntime.ctx.getUid()
        let curLevel = GameMain.instance.mainRuntime.ctx.CurLevel;
        let excludeIds = GameMain.instance.mainRuntime.ctx.inventoryItemInstance.map(item => item.id);
        let allItemInstance = createMarketItems(nextuid,curLevel + 1, excludeIds)// 生成摊位上的老旧物品
        allItemInstance.forEach((itemIns)=>{
            GameMain.instance.mainRuntime.applyHiddenMarket(itemIns);
            GameMain.instance.mainRuntime.applyMarketTrend(itemIns);// 本轮行情只影响卖价预期，不影响买入价
        });
        this.upgradeTotalMoney();
        let marketName = String(GameMain.instance.mainRuntime.ctx.targetInfo.marketName);
        if(GameMain.instance.mainRuntime.ctx.hiddenMarketActive){
            marketName += "·熟客引荐";
        }
        this.node.getChildByName("targetName").getComponent(cc.Label).string = marketName;
        let count:number = Math.round(allItemInstance.length / 3);
        this.marketItemContainer.height = count * 216.2 + (count + 1) * 30;
        for (let i = 0; i < allItemInstance.length; i++) {
            const itemIns:ItemInstance = allItemInstance[i];
            GameMain.instance.bundle.load("prefab/itemCell", cc.Prefab, (err, prefab: cc.Prefab) => {
                if (err) {
                    console.error("load itemCell prefab error:", err);
                    return;
                }
                GameMain.instance.mainRuntime.initItemInsCell(prefab,itemIns,this.marketItemContainer);
            })
        }
    }

    /**
     * 开始进入议价界面
     */
    private onYiJia(){
        FaynUtils.PlayMusic("btnclick",false,1);
        if (GameMain.instance.mainRuntime.ctx.inventoryItemInstance.length <= 0) {
            FaynUtils.PlayMusic("error",false,1);
            UIManager.getInstance().openUI(TipPanel, 0, (ui: TipPanel) => {
                ui.onShow();
                ui.showTip("请购买至少一件老物件", null)
            })
        } else {
            UIManager.getInstance().closeUI(MainPanel);
            UIManager.getInstance().openUI(YiJiaPanel, 0, (ui: YiJiaPanel) => {
                ui.buyTotolPrice = this.totalCostMoney;
                ui.onShow();
            })
        }
    }

    /**
     * 重新刷新当前店铺物品，需要花费高额预算（后期看广告的盈利点）
     */
    private onReRoll(){
        FaynUtils.PlayMusic("btnclick",false,1);
        if(GameMain.instance.mainRuntime.ctx.totalMoney >= ConstValue.REROLL_COST){
            GameMain.instance.mainRuntime.ctx.totalMoney -= ConstValue.REROLL_COST;
            FaynUtils.PlayMusic("click",false,1);
            this.upgradeTotalMoney();
            this.onCreateItems();
        }else{
            FaynUtils.PlayMusic("error",false,1);
            UIManager.getInstance().openUI(TipPanel,0,(ui:TipPanel)=>{
                ui.onShow();
                ui.showTip("预算不够了",null)
            })
        }
    }

    onBuyItemInstance(_itemIns:ItemInstance){
        if(GameMain.instance.mainRuntime.ctx.totalMoney >=  _itemIns.buyPrice){
            GameMain.instance.mainRuntime.ctx.totalMoney -=  _itemIns.buyPrice;
            this.totalCostMoney +=  _itemIns.buyPrice;
            FaynUtils.PlayMusic("buy",false,1);
            this.upgradeTotalMoney();
            UIManager.getInstance().openUI(TipPanel,0,(ui:TipPanel)=>{
                ui.onShow();
                ui.showTip(`成功购买 ${_itemIns.name}。价格: ${_itemIns.buyPrice}`,null)
            })
            this.showGuideTipOnce("after_buy","买够后点击鉴赏，看看这些货到底值不值钱。",1.4);
            GameMain.instance.mainRuntime.ctx.inventoryItemInstance.push(_itemIns);
            return true;
        }else{
            FaynUtils.PlayMusic("error",false,1);
            UIManager.getInstance().openUI(TipPanel,0,(ui:TipPanel)=>{
                ui.onShow();
                ui.showTip("预算不够了",null)
            })
        }
        return false;
    }

    private upgradeTotalMoney(){
        this.node.getChildByName("totalMoney").getChildByName("content").getComponent(cc.Label).string = "总预算: "+ String(GameMain.instance.mainRuntime.ctx.totalMoney);
    }

    private showGuideTipOnce(key:string,txt:string,delayTime:number = 0){
        let guideKey = "JiuHuoGuide_" + key;
        if(cc.sys.localStorage.getItem(guideKey) === "1")return;
        cc.sys.localStorage.setItem(guideKey,"1");
        // 新手提示只出现一次，避免后续重复打断玩家。
        this.scheduleOnce(()=>{
            UIManager.getInstance().openUI(TipPanel, 0, (ui: TipPanel) => {
                ui.onShow();
                ui.showTip(txt, null)
            })
        },delayTime);
    }
}


export interface BuffData{
    id: number;
    name: string;
    buffType: number;
    buffKind: number;
    des: string;
    effects: string;
    bDuration: number;
    isOverlay: number;
}
