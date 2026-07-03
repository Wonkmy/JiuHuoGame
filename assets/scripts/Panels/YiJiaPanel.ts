import { ItemInstance,TargetInfo,ROUND_TARGETS_INFO } from "../GameCodes/Datas/GameData";
import { appraise } from "../GameCodes/GameRules";
import GameMain from "../GameMain";
import { BaseUI } from "../UIManager/BaseUI";
import ItemCellYJ from "../UIManager/ItemCellYJ";
import MainPanel from "./MainPanel";
import { UIManager } from "../UIManager/UIManager";
import TipPanel from "./TipPanel";
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

    override onShow(): void {
        this.node.getChildByName("target").getChildByName("content").active=false;
        UIManager.getInstance().openUI(TipPanel,0,(ui:TipPanel)=>{
            ui.onShow();
            ui.showTip("目标收益:￥ "+ String(GameMain.instance.mainRuntime.ctx.targetInfo.target),()=>{
                this.upgradeTargetInfo();
            },true)
        })
        this.upgradeTotalMoney()

        let count:number = GameMain.instance.mainRuntime.inventoryItemInstance.length;
        if(count<=1){
            this.inventoryContainer.width = 722;
        }else{
            this.inventoryContainer.width = count * 200 + (count + 1) * 20;
        }


        for (let i = 0; i < GameMain.instance.mainRuntime.inventoryItemInstance.length; i++) {
            const itemIns: ItemInstance = GameMain.instance.mainRuntime.inventoryItemInstance[i];
            cc.resources.load("prefab/itemCellYJ", cc.Prefab, (err, prefab: cc.Prefab) => {
                if (err) {
                    console.error("load itemCell prefab error:", err);
                    return;
                }
                GameMain.instance.mainRuntime.initInventoryItemInsCell(prefab, itemIns,this.inventoryContainer);
            })
        }

        this.scheduleOnce(()=>{
            this.showMainItem(null!)
        },0.5);

        cc.game.on("on_select", (itemCellYj: ItemCellYJ) => {
            this.showMainItem(itemCellYj)
        })
        this.canshi_Node.on(cc.Node.EventType.TOUCH_END,this.onCashi ,this)
        this.open_Node.on(cc.Node.EventType.TOUCH_END,this.onOpen ,this)
        this.repair_Node.on(cc.Node.EventType.TOUCH_END,this.onRepair ,this)
    }

    private onCashi(){
        let res = appraise('wipe')
        this.node.getChildByName("estimateMoney").getComponent(cc.Label).string = "当前估值:" + String(GameMain.instance.mainRuntime.ctx.curSelected.estimate)
        console.log(res);// 鉴赏结果，这里先打印出来。后面做飘字
    }

    private onOpen(){
        let res = appraise('open')
        this.node.getChildByName("estimateMoney").getComponent(cc.Label).string = "当前估值:" + String(GameMain.instance.mainRuntime.ctx.curSelected.estimate)
    }
    private onRepair(){
        let res = appraise('repair')
        this.node.getChildByName("estimateMoney").getComponent(cc.Label).string = "当前估值:" + String(GameMain.instance.mainRuntime.ctx.curSelected.estimate)
    }
    private showMainItem(itemCellYj: ItemCellYJ){
        if(itemCellYj==null){
            cc.resources.load("arts/items/" + GameMain.instance.mainRuntime.inventoryItemInstance[0].image, cc.SpriteFrame, (err, spriteFrame: cc.SpriteFrame) => {
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
                GameMain.instance.mainRuntime.ctx.curSelected = GameMain.instance.mainRuntime.inventoryItemInstance[0];
                this.node.getChildByName("estimateMoney").getComponent(cc.Label).string = "当前估值:" + String(GameMain.instance.mainRuntime.ctx.curSelected.estimate);
            });
        }else{
            cc.resources.load("arts/items/" + GameMain.instance.mainRuntime.ctx.curSelected.image, cc.SpriteFrame, (err, spriteFrame: cc.SpriteFrame) => {
                if (err) {
                    console.error("load item spriteFrame error:", err);
                    return;
                }
                let sprite: cc.Sprite = this.main_item.getComponent(cc.Sprite);
                sprite.spriteFrame = spriteFrame;
                this.inventoryContainer.children.forEach((n) => {
                    n.getComponent(ItemCellYJ).ISSelected = false;
                }, this)
                itemCellYj.ISSelected = true
                this.node.getChildByName("estimateMoney").getComponent(cc.Label).string = "当前估值:" + String(GameMain.instance.mainRuntime.ctx.curSelected.estimate)
            });
        }
    }

    private upgradeTotalMoney(){
        this.node.getChildByName("totalMoney").getComponent(cc.Label).string = "总预算:￥ "+ String(MainPanel.instance.totalMoney);
    }

    private upgradeTargetInfo(){
        this.node.getChildByName("target").getChildByName("content").active=true;
        this.node.getChildByName("target").getChildByName("content").getComponent(cc.Label).string = "目标收益:￥ "+ String(GameMain.instance.mainRuntime.ctx.targetInfo.target);
    }
}
