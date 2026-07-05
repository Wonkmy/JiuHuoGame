import { ITEM_DEFS, ItemDef, ItemInstance } from "../GameCodes/Datas/GameData";
import { createMarketItems } from "../GameCodes/GameRules";
import GameContext from "../GameCodes/GameRules";
import GameMain from "../GameMain";
import { ConstValue } from "../Global/ConstValue";
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
    totalMoney:number = 0;

    btn_YJ:cc.Node = null!;
    btn_ReRoll:cc.Node = null!;

    marketItemContainer:cc.Node = null!;

    totalCostMoney:number = 0;

    @property({type:cc.Node})
    openBagPanel:cc.Node = null!;

    onLoad(): void {
        MainPanel.instance = this;
    }

    override onShow(): void {
        this.btn_YJ = this.node.getChildByName("btn_YJ");
        this.btn_ReRoll = this.node.getChildByName("btn_ReRoll");
        this.marketItemContainer = this.node.getChildByName("ItemContainers").getChildByName("sview").getChildByName("view").getChildByName("content")
        this.totalMoney = ConstValue.defaultMoney;
        this.onCreateItems();

        this.btn_YJ.on(cc.Node.EventType.TOUCH_END,this.onYiJia ,this)
        this.btn_ReRoll.on(cc.Node.EventType.TOUCH_END,this.onReRoll ,this)
        this.openBagPanel.on(cc.Node.EventType.TOUCH_END, () => {
            UIManager.getInstance().openUI(BagPanel, 0, (ui: BagPanel) => {
                ui.onShow();
            })
        }, this)
    }

    private onCreateItems(){
        this.marketItemContainer.removeAllChildren();

        let allItemInstance = createMarketItems(()=>GameMain.instance.mainRuntime.ctx.getUid())// 生成摊位上的老旧物品
        this.upgradeTotalMoney();
        this.node.getChildByName("targetName").getComponent(cc.Label).string = String(GameMain.instance.mainRuntime.ctx.targetInfo.marketName);
        let count:number = Math.round(allItemInstance.length / 3);
        this.marketItemContainer.height = count * 216.2 + (count + 1) * 30;
        for (let i = 0; i < allItemInstance.length; i++) {
            const itemIns:ItemInstance = allItemInstance[i];
            cc.resources.load("prefab/itemCell", cc.Prefab, (err, prefab: cc.Prefab) => {
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
        if(GameMain.instance.mainRuntime.inventoryItemInstance.length<=0){
            UIManager.getInstance().openUI(TipPanel,0,(ui:TipPanel)=>{
                ui.onShow();
                ui.showTip("请购买至少一件老物件",null)
            })
        }else{
        UIManager.getInstance().closeUI(MainPanel);
            UIManager.getInstance().openUI(YiJiaPanel,0,(ui:YiJiaPanel)=>{
                ui.buyTotolPrice = this.totalCostMoney;
                ui.onShow();
            })
        }
    }

    /**
     * 重新刷新当前店铺物品，需要花费高额预算（后期看广告的盈利点）
     */
    private onReRoll(){
        if(this.totalMoney >= ConstValue.REROLL_COST){
            this.totalMoney -= ConstValue.REROLL_COST;
            this.upgradeTotalMoney();
            this.onCreateItems();
        }else{
            UIManager.getInstance().openUI(TipPanel,0,(ui:TipPanel)=>{
                ui.onShow();
                ui.showTip("预算不够了",null)
            })
        }
    }

    onBuyItemInstance(_itemIns:ItemInstance){
        if(this.totalMoney >=  _itemIns.buyPrice){
            this.totalMoney -=  _itemIns.buyPrice;
            this.totalCostMoney +=  _itemIns.buyPrice;
            this.upgradeTotalMoney();
            UIManager.getInstance().openUI(TipPanel,0,(ui:TipPanel)=>{
                ui.onShow();
                ui.showTip(`成功购买 ${_itemIns.name}。价格: ￥${_itemIns.buyPrice}`,null)
            })
            GameMain.instance.mainRuntime.inventoryItemInstance.push(_itemIns);
            return true;
        }else{
            UIManager.getInstance().openUI(TipPanel,0,(ui:TipPanel)=>{
                ui.onShow();
                ui.showTip("预算不够了",null)
            })
        }
        return false;
    }

    private upgradeTotalMoney(){
        this.node.getChildByName("totalMoney").getChildByName("content").getComponent(cc.Label).string = "总预算:￥ "+ String(this.totalMoney);
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
