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
        this.node.getChildByName("splash").on(cc.Node.EventType.TOUCH_END, () => {
            UIManager.getInstance().closeUI(TipPanel);
        },this)
    }

    showTip(txt:string,callBack:any,externAnim:boolean = false)
    {
        this.flyTxt.string = txt;
        this.node.active = true;
        if(externAnim){
            this.node.getChildByName("splash").opacity = 190;
            cc.tween(this.flyTxt.node.parent)
            .to(0.25,{scale:1.35},{easing:'inBack'})
            .to(0.25,{scale:1.0},{easing:'outBack'})
            .to(0.3,{y:this.flyTxt.node.parent.y + 50})
            .delay(1)
            .call(()=>{
                callBack();
                UIManager.getInstance().closeUI(TipPanel);
            })
            .start()
        }else{
            cc.tween(this.flyTxt.node.parent)
                .by(0.5,{y:150})
                .delay(0.75)
                .call(()=>{
                    UIManager.getInstance().closeUI(TipPanel);
                })
                .start()
        }
    }
}
