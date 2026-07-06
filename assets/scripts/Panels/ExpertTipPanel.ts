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
export default class ExpertTipPanel extends BaseUI {
    protected static className = "ExpertTipPanel";
    flyTxt:cc.Label = null!;
    override onShow(): void {
        this.flyTxt = this.node.getChildByName("flyTxt").getComponentInChildren(cc.Label);
        this.node.getChildByName("splash").on(cc.Node.EventType.TOUCH_END, () => {
            UIManager.getInstance().closeUI(ExpertTipPanel);
        }, this)
    }

    showTip(txt:string,head:string)
    {
        this.flyTxt.string = txt;
        this.node.active = true;
        cc.resources.load("arts/experts/"+ head,cc.SpriteFrame,(err,spriteFrame:cc.SpriteFrame)=>{
            if(err){
                console.error("load item spriteFrame error:",err);
                return;
            }
            let sprite:cc.Sprite = this.node.getChildByName("flyTxt").getChildByName("head").getComponent(cc.Sprite);
            sprite.spriteFrame = spriteFrame;
        })
        cc.tween(this.flyTxt.node.parent)
                .by(0.5,{scale:0.2})
                .by(0.5,{scale:-0.2})
                .start()
    }
}
