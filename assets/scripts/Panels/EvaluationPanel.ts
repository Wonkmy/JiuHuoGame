// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameMain from "../GameMain";
import { BaseUI } from "../UIManager/BaseUI";
import { UIManager } from "../UIManager/UIManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class EvaluationPanel extends BaseUI {
    protected static className = "EvaluationPanel";

    btn_ok:cc.Node = null;
    btn_back:cc.Node = null;
    btn_close:cc.Node = null;
    nickName:cc.Label = null;
    content:cc.EditBox = null;

    override onShow(): void {
        this.btn_back = this.node.getChildByName("back");
        this.btn_close = this.node.getChildByName("close");
        this.btn_ok = this.node.getChildByName("bg").getChildByName("btn_ok");
        this.nickName = this.node.getChildByName("bg").getChildByName("nickName").getComponent(cc.Label);
        this.content = this.node.getChildByName("bg").getChildByName("input_content").getComponent(cc.Label);

        this.btn_ok.on(cc.Node.EventType.TOUCH_END, this.onConfirm, this)

        this.btn_back.on(cc.Node.EventType.TOUCH_END, () => {
            UIManager.getInstance().closeUI(EvaluationPanel);
        }, this)

        this.btn_close.on(cc.Node.EventType.TOUCH_END, () => {
            UIManager.getInstance().closeUI(EvaluationPanel);
        }, this)


        this.nickName.string = GameMain.instance.mainRuntime.ctx.nickName;
    }


    private onConfirm(){
        // 上传内容到服务器即可
        let uid = GameMain.instance.mainRuntime.ctx.userid;

    }
}
