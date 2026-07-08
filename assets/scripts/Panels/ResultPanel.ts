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
        let isGreatResult = finalProfit >= _target && taskFinished;
        this.clearResultContent();
        this.showFinalResultContent(displayProfit,sellTotal,taskReward,buyTotal,finalProfit,taskFinished,taskText,resultText,false);
        // 达标且委托完成才使用强反馈，否则用轻量渐显，避免失败局也像奖励。
        if(isGreatResult){
            FaynUtils.PlayMusic("buff",false,1);
            this.playSmashResultContent();
        }else{
            FaynUtils.PlayMusic(finalProfit >= _target ? "click" : "error",false,1);
            this.playFadeInResultContent();
        }
        this.showGuideTipOnce("result","最终收益 = 卖出总价 + 委托奖励 - 买入花费。达标后可进入下一摊。",isGreatResult ? 2.2 : 1.1);
        this.isCrossRound = finalProfit >= _target;
    }

    private upgradeTotalMoney(){
        this.node.getChildByName("totalMoney").getChildByName("content").getComponent(cc.Label).string = "总预算: "+ String(GameMain.instance.mainRuntime.ctx.totalMoney);
    }

    private clearResultContent(){
        this.node.getChildByName("res_tip").getComponent(cc.Label).string = "";
        this.node.getChildByName("task").getComponent(cc.Label).string = "";
        this.node.getChildByName("totalMoney").getChildByName("content").getComponent(cc.Label).string = "";
        if(this.profitFormulaLabel){
            this.profitFormulaLabel.string = "";
        }
        if(this.btn_NextTurn && this.btn_NextTurn.getComponent(cc.Button)){
            this.btn_NextTurn.getComponent(cc.Button).interactable = false;
        }
        if(this.btn_OpenHire && this.btn_OpenHire.getComponent(cc.Button)){
            this.btn_OpenHire.getComponent(cc.Button).interactable = false;
        }
    }

    private showFinalResultContent(displayProfit:number,sellTotal:number,taskReward:number,buyTotal:number,finalProfit:number,taskFinished:boolean,taskText:string,resultText:string,enableButtons:boolean = true){
        this.node.getChildByName("res_tip").getComponent(cc.Label).string = `本轮交易总收益:\n`+String(displayProfit);
        if(this.profitFormulaLabel){
            let formulaText = "收益 = 卖出总价 " + sellTotal + " + 委托奖励 " + taskReward + " - 买入花费 " + buyTotal + "\n = " + finalProfit;
            if(finalProfit < 0){
                formulaText += "，按0显示";
            }
            this.profitFormulaLabel.string = formulaText;
        }
        this.node.getChildByName("task").color = taskFinished ? cc.Color.WHITE : cc.Color.RED;
        this.node.getChildByName("task").getComponent(cc.Label).string = taskText + resultText;
        this.upgradeTotalMoney();
        this.setResultButtonsInteractable(enableButtons);
    }

    private playSmashResultContent(){
        let nodes = this.getResultContentNodes();
        this.setResultContentOpacity(0);
        nodes.forEach((node,index)=>{
            let oldY = node.y;
            let oldScale = node.scale;
            node.y = oldY + 50;
            node.scale = oldScale * 1.12;
            this.scheduleOnce(()=>{
                node.opacity = 255;
                FaynUtils.PlayMusic("hit",false,0.6);
                // 文本快速落下，制造“砸到界面上”的结算反馈。
                cc.tween(node)
                    .to(0.08,{y:oldY - 8,scale:oldScale * 0.96},{easing:"quadIn"})
                    .to(0.06,{y:oldY + 4,scale:oldScale * 1.03})
                    .to(0.06,{y:oldY,scale:oldScale})
                    .start();
                this.shakeResultPanel();
            },index * 0.16);
        })
        this.scheduleOnce(()=>{
            this.setResultButtonsInteractable(true);
        },nodes.length * 0.16 + 0.35);
    }

    private playFadeInResultContent(){
        let nodes = this.getResultContentNodes();
        this.setResultContentOpacity(0);
        nodes.forEach((node)=>{
            cc.tween(node).to(0.65,{opacity:255}).start();
        })
        this.scheduleOnce(()=>{
            this.setResultButtonsInteractable(true);
        },0.7);
    }

    private shakeResultPanel(){
        let oldX = this.node.x;
        cc.tween(this.node)
            .to(0.025,{x:oldX + 8})
            .to(0.025,{x:oldX - 7})
            .to(0.025,{x:oldX + 4})
            .to(0.025,{x:oldX})
            .start();
    }

    private getResultContentNodes():cc.Node[]{
        let nodes:cc.Node[] = [];
        let resTip = this.node.getChildByName("res_tip");
        let task = this.node.getChildByName("task");
        let totalMoney = this.node.getChildByName("totalMoney");
        if(resTip)nodes.push(resTip);
        if(this.profitFormulaLabel)nodes.push(this.profitFormulaLabel.node);
        if(task)nodes.push(task);
        if(totalMoney)nodes.push(totalMoney);
        return nodes;
    }

    private setResultContentOpacity(opacity:number){
        let nodes = this.getResultContentNodes();
        nodes.forEach((node)=>{
            node.opacity = opacity;
        })
    }

    private setResultButtonsInteractable(interactable:boolean){
        if(this.btn_NextTurn && this.btn_NextTurn.getComponent(cc.Button)){
            this.btn_NextTurn.getComponent(cc.Button).interactable = interactable;
        }
        if(this.btn_OpenHire && this.btn_OpenHire.active && this.btn_OpenHire.getComponent(cc.Button)){
            this.btn_OpenHire.getComponent(cc.Button).interactable = interactable;
        }
    }

    /*
    旧版 TipPanel 分步弹窗结算已停用：现在改为结算面板内砸字/渐显反馈。
    private showRoundProfitSteps(sellTotal:number,taskReward:number,buyTotal:number,finalProfit:number){
        this.showResultTipLater("结算开始\n卖出总价 +" + sellTotal,0.2);
        this.showResultTipLater("委托奖励\n+" + taskReward,1.7);
        this.showResultTipLater("扣除买入花费\n-" + buyTotal,3.2);
        let tag = finalProfit >= GameMain.instance.mainRuntime.ctx.targetInfo.target ? "【达标过关】" : "【本轮失手】";
        this.showResultTipLater(tag + "\n最终收益 = " + finalProfit,4.7);
    }

    private showResultTipLater(txt:string,delayTime:number){
        this.scheduleOnce(()=>{
            UIManager.getInstance().openUI(TipPanel, 0, (ui: TipPanel) => {
                ui.onShow();
                ui.showTip(txt, null)
            })
        },delayTime);
    }
    */

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
