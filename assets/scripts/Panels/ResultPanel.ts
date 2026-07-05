import GameMain from "../GameMain";
import { BaseUI } from "../UIManager/BaseUI";
import MainPanel from "./MainPanel";
const {ccclass, property} = cc._decorator;

@ccclass
export default class ResultPanel extends BaseUI{
    protected static className = "ResultPanel";

    @property({type:cc.Node})
    btn_NextTurn:cc.Node = null!;

    override onShow(): void {
        this.btn_NextTurn.on(cc.Node.EventType.TOUCH_END,this.onNextTurn ,this);
        this.upgradeTotalMoney();
    }

    onNextTurn(){

    }

    setContentText(sellTotal: number, buyTotal: number){
        this.node.getChildByName("res_tip").getComponent(cc.Label).string = `本轮议价总收益:￥ `+String(sellTotal - buyTotal);
    }

    private upgradeTotalMoney(){
        this.node.getChildByName("totalMoney").getChildByName("content").getComponent(cc.Label).string = "总预算:￥ "+ String(MainPanel.instance.totalMoney);
    }
}
