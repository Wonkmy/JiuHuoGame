import { ExpertDef } from "../GameCodes/Datas/GameData";
import { getRoundTaskReward, getRoundTaskText, isRoundTaskFinished, pickExperts } from "../GameCodes/GameRules";
import GameMain from "../GameMain";
import { BaseUI } from "../UIManager/BaseUI";
import { UIManager } from "../UIManager/UIManager";
import HirePanel from "./HirePanel";
import MainPanel from "./MainPanel";
const {ccclass, property} = cc._decorator;

@ccclass
export default class ResultPanel extends BaseUI{
    protected static className = "ResultPanel";

    @property({type:cc.Node})
    btn_NextTurn:cc.Node = null!;

    @property({type:cc.Node})
    btn_OpenHire:cc.Node = null!;

    private isCrossRound: boolean = false;// 本轮目标是否达成

    override onShow(): void {
        this.btn_NextTurn.on(cc.Node.EventType.TOUCH_END,this.onNextTurn ,this);
        this.btn_OpenHire.on(cc.Node.EventType.TOUCH_END,this.onOpenHire ,this);
        this.upgradeTotalMoney();
    }

    private onNextTurn(){
        if(this.isCrossRound){
            GameMain.instance.mainRuntime.ctx.CurLevel++;
        }
        GameMain.instance.mainRuntime.ctx.startRound();
        UIManager.getInstance().closeUI(ResultPanel);
        UIManager.getInstance().openUI(MainPanel, 0, (ui: MainPanel) => {
            ui.onShow();
        })
    }

    setOpenHoreBtnActive(active:boolean){
        this.btn_OpenHire.active = active;
    }
    private onOpenHire(){
        UIManager.getInstance().openUI(HirePanel, 0, (ui: HirePanel) => {
            ui.onShow();
            let hirePanelData:ExpertDef[] = pickExperts(3, GameMain.instance.mainRuntime.ctx.ownedExperts);
            ui.setContent(hirePanelData);
        })
        // 这里可能是一个盈利点，看一次广告后，可以再次雇佣一个
        this.btn_OpenHire.getComponent(cc.Button).interactable = false;
        this.btn_OpenHire.color = new cc.Color(128,128,128);
        this.btn_OpenHire.off(cc.Node.EventType.TOUCH_END,this.onOpenHire ,this);
    }

    setContentText(sellTotal: number, buyTotal: number){
        let _profit: number = sellTotal - buyTotal;
        let taskFinished = isRoundTaskFinished();
        let taskReward = taskFinished ? getRoundTaskReward() : 0;
        if(taskReward > 0 && !GameMain.instance.mainRuntime.ctx.taskRewardClaimed){
            // 委托奖励只发一次，并计入本轮收益。
            MainPanel.instance.totalMoney += taskReward;
            GameMain.instance.mainRuntime.ctx.taskRewardClaimed = true;
        }
        let finalProfit = _profit + taskReward;
        let taskText = taskFinished ? "\n委托完成，额外收益: " + taskReward : "\n委托未完成\n" + getRoundTaskText();
        this.node.getChildByName("res_tip").getComponent(cc.Label).string = `本轮议价总收益: `+String(finalProfit) + taskText;
        let _target = GameMain.instance.mainRuntime.ctx.targetInfo.target;
        this.isCrossRound = finalProfit >= _target;
        this.upgradeTotalMoney();
    }

    private upgradeTotalMoney(){
        this.node.getChildByName("totalMoney").getChildByName("content").getComponent(cc.Label).string = "总预算: "+ String(MainPanel.instance.totalMoney);
    }
}
