import { BaseUI } from "../UIManager/BaseUI";
import { ItemInstance,TargetInfo,ROUND_TARGETS_INFO } from "../GameCodes/Datas/GameData";
import MainPanel from "./MainPanel";
import GameMain from "../GameMain";
const {ccclass, property} = cc._decorator;
import { UIManager } from "../UIManager/UIManager";

@ccclass
export default class BagPanel extends BaseUI {
    protected static className = "BagPanel";

    @property({type:cc.Node})
    inventoryContainer:cc.Node = null!;

    @property({type:cc.Node})
    closeBtn:cc.Node = null!;

    override onShow(): void {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            UIManager.getInstance().closeUI(BagPanel);
        },this)
        let count: number = GameMain.instance.mainRuntime.ctx.inventoryItemInstance.length;
        if(count<=0){
            this.node.getChildByName("ItemContainers").getChildByName("empty_tip").getComponent(cc.Label).string = "背包空空如也，快去购买物品吧！";
        }else{
            this.node.getChildByName("ItemContainers").getChildByName("empty_tip").active = false;
        }
        if (count <= 1) {
            this.inventoryContainer.width = 722;
        } else {
            this.inventoryContainer.width = count * 200 + (count + 1) * 20;
        }
        for (let i = 0; i < GameMain.instance.mainRuntime.ctx.inventoryItemInstance.length; i++) {
            const itemIns: ItemInstance = GameMain.instance.mainRuntime.ctx.inventoryItemInstance[i];
            cc.resources.load("prefab/itemCellYJ", cc.Prefab, (err, prefab: cc.Prefab) => {
                if (err) {
                    console.error("load itemCell prefab error:", err);
                    return;
                }
                GameMain.instance.mainRuntime.initInventoryItemInsCell(prefab, itemIns, this.inventoryContainer,false);
            })
        }
    }
}
