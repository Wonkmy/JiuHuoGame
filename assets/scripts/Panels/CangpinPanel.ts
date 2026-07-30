// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { BaseUI } from "../UIManager/BaseUI";
import { UIManager } from "../UIManager/UIManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CangpinPanel extends BaseUI {
    protected static className = "CangpinPanel";

    override onShow(): void {
        console.log("拿到背包中正在展览的物品数据，然后展示到桌子上");
        console.log("拿到正在展示着物品的桌子id");

        this.node.getChildByName("body").getChildByName("back").on(cc.Node.EventType.TOUCH_END,this.onCloseSelf,this)
    }

    private onCloseSelf(){
        UIManager.getInstance().closeUI(CangpinPanel);
    }
}
