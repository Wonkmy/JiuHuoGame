import GameMain from "../GameMain";
import { BaseUI } from "../UIManager/BaseUI";
import { UIManager } from "../UIManager/UIManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ProfilePanel extends BaseUI {
    protected static className = "ProfilePanel";

    input_nickName:cc.EditBox = null;

    btn_ok:cc.Node = null;
    btn_back:cc.Node = null;
    btn_close:cc.Node = null;

    override onShow(): void {
        this.input_nickName = this.node.getChildByName("bg").getChildByName("input_nickName").getComponent(cc.EditBox);
        this.btn_back = this.node.getChildByName("back");
        this.btn_close = this.node.getChildByName("close");
        this.btn_ok = this.node.getChildByName("bg").getChildByName("btn_ok");

        this.btn_ok.on(cc.Node.EventType.TOUCH_END,this.onConfirm ,this)

        this.btn_back.on(cc.Node.EventType.TOUCH_END, () => {
            UIManager.getInstance().closeUI(ProfilePanel);
        }, this)

        this.btn_close.on(cc.Node.EventType.TOUCH_END, () => {
            UIManager.getInstance().closeUI(ProfilePanel);
        }, this)

        this.input_nickName.string = GameMain.instance.mainRuntime.ctx.nickName;
    }

    private onConfirm(){

    }
}
