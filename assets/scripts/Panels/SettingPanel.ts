// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { ConstValue } from "../Global/ConstValue";
import { FaynUtils } from "../Global/FaynUtils";
import { BaseUI } from "../UIManager/BaseUI";
import { UIManager } from "../UIManager/UIManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SettingPanel extends BaseUI {
    protected static className = "SettingPanel";

    @property({type:cc.Node})
    close_Self:cc.Node = null!;
    override onShow(): void {
        this.close_Self.on(cc.Node.EventType.TOUCH_END,this.onCloseSelf,this);
    }

    private onCloseSelf(){
        FaynUtils.PlayMusic("click",false,1);
        UIManager.getInstance().closeUI(SettingPanel);
    }
}
