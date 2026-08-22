// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { createItemByRarityValue } from "../GameCodes/GameRules";
import GameMain from "../GameMain";
import { BaseUI } from "../UIManager/BaseUI";
import { UIManager } from "../UIManager/UIManager";
import EntrancePanel from "./EntrancePanel";
import MainPanel from "./MainPanel";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RewardPanel extends BaseUI {
    protected static className = "RewardPanel";

    override onShow(): void {
        let excludeIds = GameMain.instance.mainRuntime.ctx.inventoryItemInstance.map(item => item.id);
        let itemInstance = createItemByRarityValue(4, excludeIds);

        this.node.getChildByName("bg").getChildByName("getmoney").on(cc.Node.EventType.TOUCH_END,()=>{
            GameMain.instance.mainRuntime.ctx.addMoney(500);
            if(MainPanel.instance){
                MainPanel.instance.upgradeTotalMoney();
            }else if(EntrancePanel.instance){
                EntrancePanel.instance.upgradeTotalMoney();
            }
        },this)

        this.node.getChildByName("bg").getChildByName("getgoods").on(cc.Node.EventType.TOUCH_END, () => {
            UIManager.getInstance().openUI(DialogPanel, 1, (ui: DialogPanel) => {
                ui.onShow();
                ui.setContent(`是否看视频获得${itemInstance.name}?`, () => {
                    UIManager.getInstance().closeUI(DialogPanel);
                    postMaiDian(`准备看视频获得${itemInstance.name}`)
                    Advertise.instance.ShowVideoAd((res: number) => {
                        if (res === 1) {
                            GameMain.instance.mainRuntime.ctx.inventoryItemInstance.push(this.itemInstance);
                            cc.sys.localStorage.setItem("bag_data", JSON.stringify(GameMain.instance.mainRuntime.ctx.inventoryItemInstance));
                            postMaiDian(`看视频获得了${itemInstance.name}`)
                        }
                    })
                }, "确认",true)
            })
        }, this)
    }
}
