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
export default class TipPanel extends BaseUI {
    public static instance:TipPanel = null!;
    protected static className = "TipPanel";

    flyTxt:cc.Label = null!;
    override onShow(): void {
        this.flyTxt = this.node.getChildByName("flyTxt").getComponentInChildren(cc.Label);
    }

    showTip(txt:string)
    {
        this.flyTxt.string = txt;
        this.node.active = true;
        cc.tween(this.flyTxt.node.parent)
            .by(1,{y:100})
            .call(()=>{
                UIManager.getInstance().closeUI(TipPanel);
            })
            .start()
    }
}
