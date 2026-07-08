import { ExpertDef } from "../GameCodes/Datas/GameData";
import { getRoundTaskReward, getRoundTaskText, isRoundTaskFinished, pickExperts } from "../GameCodes/GameRules";
import GameMain from "../GameMain";
import { FaynUtils } from "../Global/FaynUtils";
import { BaseUI } from "../UIManager/BaseUI";
import { UIManager } from "../UIManager/UIManager";
import HirePanel from "./HirePanel";
import MainPanel from "./MainPanel";
import TipPanel from "./TipPanel";
const {ccclass, property} = cc._decorator;

@ccclass
export default class ResultPanel extends BaseUI{
    protected static className = "ResultPanel";

    @property({type:cc.Node})
    btn_NextTurn:cc.Node = null!;

    @property({type:cc.Node})
    btn_OpenHire:cc.Node = null!;

    @property({type:cc.Label})
    profitFormulaLabel:cc.Label = null!;

    private isCrossRound: boolean = false;// 本轮目标是否达成

    override onShow(): void {
        this.btn_NextTurn.on(cc.Node.EventType.TOUCH_END,this.onNextTurn ,this);
        this.btn_OpenHire.on(cc.Node.EventType.TOUCH_END,this.onOpenHire ,this);
        this.upgradeTotalMoney();
    }

    private onNextTurn(){
        FaynUtils.PlayMusic("btnclick",false,1);
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
        FaynUtils.PlayMusic("btnclick",false,1);
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
        let taskFinished = isRoundTaskFinished();
        let taskReward = taskFinished ? getRoundTaskReward() : 0;
        if(taskReward > 0 && !GameMain.instance.mainRuntime.ctx.taskRewardClaimed){
            // 委托奖励只发一次，并计入本轮收益。
            GameMain.instance.mainRuntime.ctx.totalMoney += taskReward;
            GameMain.instance.mainRuntime.ctx.taskRewardClaimed = true;
        }
        // 最终收益 = 本轮卖出总价 + 委托收益 - 本轮买入花费。
        let roundTotalIncome = sellTotal + taskReward;
        let finalProfit = roundTotalIncome - buyTotal;
        let taskText = taskFinished ? "\n委托完成,额外收益: +" + taskReward : "\n委托未完成\n" + getRoundTaskText();
        let _target = GameMain.instance.mainRuntime.ctx.targetInfo.target;
        let resultText = "";
        if(!GameMain.instance.mainRuntime.ctx.roundResultClaimed){
            if(finalProfit >= _target * 1.5 && taskFinished){
                GameMain.instance.mainRuntime.ctx.hiddenMarketNextRound = true;
                resultText = "\n大赚一局! 下一轮获得熟客引荐摊";
            }else if(finalProfit < _target){
                let penaltyRate = taskFinished ? 0.08 : 0.15;
                let penalty = Math.max(50,Math.round(GameMain.instance.mainRuntime.ctx.totalMoney * penaltyRate));
                GameMain.instance.mainRuntime.ctx.budgetPenaltyNextRound = penalty;
                resultText = "\n本轮失手,下轮预算减少: " + penalty;
            }else{
                resultText = "\n顺利过关";
            }
            GameMain.instance.mainRuntime.ctx.roundResultClaimed = true;
        }
        let displayProfit = finalProfit <=0?0:finalProfit;
        // 结算结果按最终目标是否达成反馈，避免委托完成但收益失败时误播奖励音。
        FaynUtils.PlayMusic(finalProfit >= _target ? "buff" : "error",false,1);
        this.node.getChildByName("res_tip").getComponent(cc.Label).string = `本轮交易总收益:\n`+String(displayProfit);
        if(this.profitFormulaLabel){
            let formulaText = "收益 = 卖出总价 " + sellTotal + " + 委托奖励 " + taskReward + " - 买入花费 " + buyTotal + "\n = " + finalProfit;
            if(finalProfit < 0){
                formulaText += "，按0显示";
            }
            this.profitFormulaLabel.string = formulaText;
        }
        if(taskFinished== false){this.node.getChildByName("task").color = cc.Color.RED}
        this.node.getChildByName("task").getComponent(cc.Label).string = taskText + resultText;
        this.showGuideTipOnce("result","最终收益 = 卖出总价 + 委托奖励 - 买入花费。达标后可进入下一摊。",2);
        this.isCrossRound = finalProfit >= _target;
        this.upgradeTotalMoney();
    }

    private upgradeTotalMoney(){
        this.node.getChildByName("totalMoney").getChildByName("content").getComponent(cc.Label).string = "总预算: "+ String(GameMain.instance.mainRuntime.ctx.totalMoney);
    }

    private showGuideTipOnce(key:string,txt:string,delayTime:number = 0){
        let guideKey = "JiuHuoGuide_" + key;
        if(cc.sys.localStorage.getItem(guideKey) === "1")return;
        cc.sys.localStorage.setItem(guideKey,"1");
        // 结算说明只在首次结算时提示一次。
        this.scheduleOnce(()=>{
            UIManager.getInstance().openUI(TipPanel, 0, (ui: TipPanel) => {
                ui.onShow();
                ui.showTip(txt, null)
            })
        },delayTime);
    }
}
