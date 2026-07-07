import { ItemInstance,TargetInfo,ROUND_TARGETS_INFO } from "../GameCodes/Datas/GameData";
import { appraise,AppraiseResult, getRoundTaskText, recordRoundTaskProgress } from "../GameCodes/GameRules";
import GameMain from "../GameMain";
import { BaseUI } from "../UIManager/BaseUI";
import ItemCellYJ from "../UIManager/ItemCellYJ";
import MainPanel from "./MainPanel";
import { UIManager } from "../UIManager/UIManager";
import TipPanel from "./TipPanel";
import ResultPanel from "./ResultPanel";
import SmallExpertsCell from "../UIManager/SmallExpertsCell";
import BagPanel from "./BagPanel";
const {ccclass, property} = cc._decorator;

@ccclass
export default class YiJiaPanel extends BaseUI {
    protected static className = "YiJiaPanel";

    @property({type:cc.Node})
    inventoryContainer:cc.Node = null!;

    @property({type:cc.Node})
    main_item:cc.Node = null!;

    @property({type:cc.Node})
    canshi_Node:cc.Node = null!;
    @property({type:cc.Node})
    open_Node:cc.Node = null!;
    @property({type:cc.Node})
    repair_Node:cc.Node = null!;

    @property({type:cc.Node})
    sell_Node:cc.Node = null!;

    @property({type:cc.Node})
    ownedExpertsContainers:cc.Node = null!;

    @property({type:cc.Node})
    openExpertBagPanel:cc.Node = null!;

    @property({type:cc.Label})
    marketTrendLabel:cc.Label = null!;

    @property({type:cc.Label})
    roundTaskLabel:cc.Label = null!;

    buyTotolPrice:number = 0;
    YijiaPrice:number = 0;

    override onShow(): void {
        this.node.getChildByName("target").active=false;
        this.main_item = this.node.getChildByName("main_item");
        UIManager.getInstance().openUI(TipPanel,0,(ui:TipPanel)=>{
            ui.onShow();
            ui.showTip("目标收益: "+ String(GameMain.instance.mainRuntime.ctx.targetInfo.target),()=>{
                this.upgradeTargetInfo();
            },true)
        })
        this.upgradeTotalMoney()
        this.updateMarketTrendInfo();
        this.updateRoundTaskInfo();

        let count:number = GameMain.instance.mainRuntime.ctx.inventoryItemInstance.length;
        if(count<=1){
            this.inventoryContainer.width = 722;
        }else{
            this.inventoryContainer.width = count * 200 + (count + 1) * 20;
        }
        for (let i = 0; i < GameMain.instance.mainRuntime.ctx.inventoryItemInstance.length; i++) {
            const itemIns: ItemInstance = GameMain.instance.mainRuntime.ctx.inventoryItemInstance[i];
            GameMain.instance.bundle.load("prefab/itemCellYJ", cc.Prefab, (err, prefab: cc.Prefab) => {
                if (err) {
                    console.error("load itemCell prefab error:", err);
                    return;
                }
                GameMain.instance.mainRuntime.initInventoryItemInsCell(prefab, itemIns,this.inventoryContainer,true);
            })
        }

        // 将已有的专家显示在鉴赏界面
        // for (let i = 0; i < GameMain.instance.mainRuntime.ctx.ownedExperts.length; i++) {
        //     const expertDef = GameMain.instance.mainRuntime.ctx.ownedExperts[i];
        //     // 代码用于创建和显示专家单元格
        //     GameMain.instance.bundle.load("prefab/SmallExpertsCell", cc.Prefab, (err, prefab: cc.Prefab) => {
        //         if (err) {
        //             console.error("load SmallExpertsCell prefab error:", err);
        //             return;
        //         }
        //         // 初始化专家单元格
        //         const expertCell = cc.instantiate(prefab);
        //         expertCell.getComponent(SmallExpertsCell).init(expertDef);
        //         this.ownedExpertsContainers.getChildByName("list").addChild(expertCell);
        //     })
        // }

        /**
         * 打开我的顾问团
         */
        this.openExpertBagPanel.on(cc.Node.EventType.TOUCH_END, () => {
            UIManager.getInstance().openUI(BagPanel, 0, (ui: BagPanel) => {
                ui.onShow();
                ui.setInventoryData("expert")
            })
        }, this)

        this.scheduleOnce(()=>{
            this.showMainItem(null!)
        },0.5);

        cc.game.on("on_select", (itemCellYj: ItemCellYJ) => {
            this.showMainItem(itemCellYj)
        })
        this.canshi_Node.on(cc.Node.EventType.TOUCH_END,this.onCashi ,this)
        this.open_Node.on(cc.Node.EventType.TOUCH_END,this.onOpen ,this)
        this.repair_Node.on(cc.Node.EventType.TOUCH_END,this.onRepair ,this)

        this.sell_Node.on(cc.Node.EventType.TOUCH_END,this.onSell ,this)
    }

    private onCashi(){
        let res: AppraiseResult = appraise('wipe').AppraiseResult;
        this.node.getChildByName("estimateMoney").getComponent(cc.Label).string = "当前估值:" + String(GameMain.instance.mainRuntime.ctx.curSelected.estimate)
        this.showDeltaPrice(res);
    }

    private onOpen(){
        let res: AppraiseResult = appraise('open').AppraiseResult;
        this.node.getChildByName("estimateMoney").getComponent(cc.Label).string = "当前估值:" + String(GameMain.instance.mainRuntime.ctx.curSelected.estimate)
        this.showDeltaPrice(res);
    };
    private onRepair(){
        let res: AppraiseResult = appraise('repair').AppraiseResult;
        this.node.getChildByName("estimateMoney").getComponent(cc.Label).string = "当前估值:" + String(GameMain.instance.mainRuntime.ctx.curSelected.estimate)
        this.showDeltaPrice(res);
    };

    private showDeltaPrice(res: AppraiseResult ){
        UIManager.getInstance().openUI(TipPanel, 0, (ui: TipPanel) => {
            ui.onShow();
            let cont = res.diff > 0 ? "+" + String(res.diff) : + String(Math.abs(res.diff));
            ui.showTip(res.eventText + "\n" + cont, null)
        })
    }

    private onSell(){
        if(GameMain.instance.mainRuntime.ctx.inventoryItemInstance.length <= 0)return;
        let deleteIndex:number = -1;
        let finalPrice:number = GameMain.instance.mainRuntime.ctx.curSelected.estimate;
        let curShouyi:number = finalPrice - GameMain.instance.mainRuntime.ctx.curSelected.buyPrice;
        GameMain.instance.mainRuntime.ctx.totalMoney += finalPrice;
        this.YijiaPrice += finalPrice;
        recordRoundTaskProgress(GameMain.instance.mainRuntime.ctx.curSelected);
        this.updateRoundTaskInfo();
        let _target = GameMain.instance.mainRuntime.ctx.targetInfo.target;
        let _targetExtra:number = this.YijiaPrice - this.buyTotolPrice;
        if(_targetExtra <0)_targetExtra=0;
        if(_targetExtra >= _target){
            this.node.getChildByName("target").getChildByName("target_slider").getChildByName("finish").active=true;
        }
        this.node.getChildByName("target").getChildByName("target_slider").getChildByName("fg").getComponent(cc.Sprite).fillRange = _targetExtra / _target;
        this.node.getChildByName("target").getChildByName("target_slider").getChildByName("num").getComponent(cc.Label).string = String(_targetExtra) + "/" + String(_target);
        this.upgradeTotalMoney();
        // 从背包中移除选中的那个货物
        GameMain.instance.mainRuntime.ctx.inventoryItemInstance.forEach((i)=>{
            if(i.uid === GameMain.instance.mainRuntime.ctx.curSelected.uid){
                deleteIndex = GameMain.instance.mainRuntime.ctx.inventoryItemInstance.indexOf(i);
            }
        })
        if (deleteIndex !== -1) {
            GameMain.instance.mainRuntime.ctx.inventoryItemInstance.splice(deleteIndex, 1);
            this.inventoryContainer.removeAllChildren();
            if (GameMain.instance.mainRuntime.ctx.inventoryItemInstance.length > 0) {
                for (let i = 0; i < GameMain.instance.mainRuntime.ctx.inventoryItemInstance.length; i++) {
                    const itemIns: ItemInstance = GameMain.instance.mainRuntime.ctx.inventoryItemInstance[i];
                    GameMain.instance.bundle.load("prefab/itemCellYJ", cc.Prefab, (err, prefab: cc.Prefab) => {
                        if (err) {
                            console.error("load itemCell prefab error:", err);
                            return;
                        }
                        GameMain.instance.mainRuntime.initInventoryItemInsCell(prefab, itemIns, this.inventoryContainer,true);
                    })
                }
                this.showMainItem(null!)
            }else{
                // 如果背包空了，直接关闭鉴赏界面，打开结算界面
                this.main_item.getComponent(cc.Sprite).spriteFrame = null!;
                this.node.getChildByName("estimateMoney").active=false;
                this.scheduleOnce(()=>{
                    UIManager.getInstance().closeUI(YiJiaPanel);
                    UIManager.getInstance().openUI(ResultPanel,0,(ui:ResultPanel)=>{
                    ui.onShow();
                    ui.setContentText(this.YijiaPrice , this.buyTotolPrice);// 结算收益 = 卖出总价 - 买入总价
                })
                },0.5);
            }
        }
    }
    private showMainItem(itemCellYj: ItemCellYJ){
        if(itemCellYj==null){
            GameMain.instance.bundle.load("arts/items/" + GameMain.instance.mainRuntime.ctx.inventoryItemInstance[0].image, cc.SpriteFrame, (err, spriteFrame: cc.SpriteFrame) => {
                if (err) {
                    console.error("load item spriteFrame error:", err);
                    return;
                }
                let sprite: cc.Sprite = this.main_item.getComponent(cc.Sprite);
                sprite.spriteFrame = spriteFrame;
                this.inventoryContainer.children.forEach((n) => {
                    n.getComponent(ItemCellYJ).ISSelected = false;
                }, this)
                this.inventoryContainer.children[0].getComponent(ItemCellYJ).ISSelected = true;
                GameMain.instance.mainRuntime.ctx.curSelected = GameMain.instance.mainRuntime.ctx.inventoryItemInstance[0];
                this.node.getChildByName("estimateMoney").getComponent(cc.Label).string = "当前估值:" + String(GameMain.instance.mainRuntime.ctx.curSelected.estimate);
            });
        }else{
            // GameMain.instance.bundle.load("arts/items/" + GameMain.instance.mainRuntime.ctx.curSelected.image, cc.SpriteFrame, (err, spriteFrame: cc.SpriteFrame) => {
            //     if (err) {
            //         console.error("load item spriteFrame error:", err);
            //         return;
            //     }

            //     });
            if (this.main_item === null) {
                this.main_item = this.node.getChildByName("main_item");
            }
            let sprite: cc.Sprite = this.main_item.getComponent(cc.Sprite);
            sprite.spriteFrame = itemCellYj.node.getChildByName("view").getComponent(cc.Sprite).spriteFrame;
            this.inventoryContainer.children.forEach((n) => {
                n.getComponent(ItemCellYJ).ISSelected = false;
            }, this)
            itemCellYj.ISSelected = true;
            this.node.getChildByName("estimateMoney").getComponent(cc.Label).string = "当前估值:" + String(GameMain.instance.mainRuntime.ctx.curSelected.estimate)

        }
    }

    private upgradeTotalMoney(){
        this.node.getChildByName("totalMoney").getComponent(cc.Label).string = "总预算: "+ String(GameMain.instance.mainRuntime.ctx.totalMoney);
    }

    private updateMarketTrendInfo(){
        if(this.marketTrendLabel && MainPanel.instance){
            this.marketTrendLabel.string = GameMain.instance.mainRuntime.getMarketTrendText();
        }
    }

    private updateRoundTaskInfo(){
        if(this.roundTaskLabel){
            this.roundTaskLabel.string = getRoundTaskText();
        }
    }

    private upgradeTargetInfo(){
        this.node.getChildByName("target").active=true;
        let _target = GameMain.instance.mainRuntime.ctx.targetInfo.target;
        this.node.getChildByName("target").getChildByName("target_slider").getChildByName("fg").getComponent(cc.Sprite).fillRange = this.YijiaPrice / _target;
        this.node.getChildByName("target").getChildByName("target_slider").getChildByName("num").getComponent(cc.Label).string = String(this.YijiaPrice) + "/" + String(_target);
        this.node.getChildByName("target").getChildByName("content").getComponent(cc.Label).string = "目标收益: "+ String(_target);
    }
}
