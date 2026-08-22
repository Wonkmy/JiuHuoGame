import GameMain from "../GameMain";
import { BaseUI } from "../UIManager/BaseUI";
import { UIManager } from "../UIManager/UIManager";
import {getLocationCategoriesName, postMaiDian} from "../GameCodes/GameRules"
import DialogPanel from "./DialogPanel";
import TipPanel from "./TipPanel";
import MainPanel from "./MainPanel";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ChooseLocationPanel extends BaseUI {
    protected static className = "ChooseLocationPanel";

    @property({type:cc.Node})
    laojieNode:cc.Node = null!;
    @property({type:cc.Node})
    haibianNode:cc.Node = null!;
    @property({type:cc.Node})
    jiuzhaiNode:cc.Node = null!;
    @property({type:cc.Node})
    changquNode:cc.Node = null!;

    tipNode:cc.Label = null;

    graphics:cc.Graphics = null;


    @property({type:cc.Node})
    closeBtn:cc.Node = null!;

    override onShow(): void {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            UIManager.getInstance().closeUI(ChooseLocationPanel);
        }, this)
        this.tipNode = this.node.getChildByName("tip").getComponent(cc.Label);

        this.graphics = this.node.getChildByName("bg").getChildByName("map_line").getComponent(cc.Graphics);

        this.hideAllLocationNodeCheck();

        this.laojieNode.on(cc.Node.EventType.TOUCH_END,this.chooseLaojie,this)
        this.haibianNode.on(cc.Node.EventType.TOUCH_END,this.chooseHaibian,this)
        this.jiuzhaiNode.on(cc.Node.EventType.TOUCH_END,this.chooseJiuZhai,this)
        this.changquNode.on(cc.Node.EventType.TOUCH_END,this.chooseChangQu,this)

        this.setDefaultDisplay();
        this.upgradeTotalMoney();

        postMaiDian("进入选择地点界面")
    }

    drawLineWithTween(startPos: Vec3, endPos: Vec3, duration: number = 1.0,callBack:any = null) {
        let progress = 0;

        // 先清空
        this.graphics.clear();

        cc.tween({ value: 0 })
            .to(duration, { value: 1 }, {
                onUpdate: (target: any) => {
                    progress = target.value;
                    this.graphics.clear();
                    this.graphics.lineWidth = 5;
                    this.graphics.strokeColor.fromHEX('#ff0000');

                    // 核心：根据进度插值计算终点位置
                    const currentX = startPos.x + (endPos.x - startPos.x) * progress;
                    const currentY = startPos.y + (endPos.y - startPos.y) * progress;

                    this.graphics.moveTo(startPos.x, startPos.y);
                    this.graphics.lineTo(currentX, currentY);
                    this.graphics.stroke();
                }
            })
            .call(()=>{
                this.graphics.clear();
                if(callBack!=null){
                    callBack();
                }
            })
            .start();
    }

    private setDefaultDisplay(){
        if(GameMain.instance.mainRuntime.ctx.currentLocation == "oldStreet" || GameMain.instance.mainRuntime.ctx.currentLocation == ""){
            this.laojieNode.getChildByName("check").active = true;
        }
        if(GameMain.instance.mainRuntime.ctx.currentLocation == "seaside"){
            this.haibianNode.getChildByName("check").active = true;
        }
        if(GameMain.instance.mainRuntime.ctx.currentLocation == "oldHouse"){
            this.jiuzhaiNode.getChildByName("check").active = true;
        }
        if(GameMain.instance.mainRuntime.ctx.currentLocation == "factory"){
            this.changquNode.getChildByName("check").active = true;
        }
        this.setTipNode("当前选中地点:"+this.keyName2chName(GameMain.instance.mainRuntime.ctx.currentLocation))
    }

    private chooseLaojie() {
        if(GameMain.instance.mainRuntime.ctx.currentLocation === "oldStreet")return;
        UIManager.getInstance().openUI(DialogPanel, 1, (ui: DialogPanel) => {
            ui.onShow();
            ui.setContent("是否花费500路费前往该地点?", () => {
                if(GameMain.instance.mainRuntime.ctx.totalMoney >=500){
                    GameMain.instance.mainRuntime.ctx.addMoney(-500)
                    this.moveToLine("oldStreet", () => {
                        cc.sys.localStorage.setItem("location", GameMain.instance.mainRuntime.ctx.currentLocation);
                        this.hideAllLocationNodeCheck();
                        this.laojieNode.getChildByName("check").active = true;
                        this.setTipNode("当前选中地点: 老街杂摊");
                    })
                }else{
                    UIManager.getInstance().openUI(TipPanel, 2, (ui: TipPanel) => {
                        ui.onShow();
                        ui.showTip("预算不够了", false)
                    })
                }
                this.upgradeTotalMoney();
                UIManager.getInstance().closeUI(DialogPanel);
            }, "确认",false)
        })
    }
    private chooseHaibian(){
        if(GameMain.instance.mainRuntime.ctx.currentLocation === "seaside")return;
        UIManager.getInstance().openUI(DialogPanel, 1, (ui: DialogPanel) => {
            ui.onShow();
            ui.setContent("是否花费500路费前往该地点?", () => {
                if(GameMain.instance.mainRuntime.ctx.totalMoney >=500){
                    GameMain.instance.mainRuntime.ctx.addMoney(-500)
                    this.moveToLine("seaside", () => {
                        cc.sys.localStorage.setItem("location", GameMain.instance.mainRuntime.ctx.currentLocation);
                        this.hideAllLocationNodeCheck();
                        this.haibianNode.getChildByName("check").active = true;
                        this.setTipNode("当前选中地点: 海边旧市")
                    });
                }else{
                    UIManager.getInstance().openUI(TipPanel, 2, (ui: TipPanel) => {
                        ui.onShow();
                        ui.showTip("预算不够了", false)
                    })
                }
                this.upgradeTotalMoney();
                UIManager.getInstance().closeUI(DialogPanel);
            }, "确认",false)
        })

    }
    private chooseJiuZhai() {
        if(GameMain.instance.mainRuntime.ctx.currentLocation === "oldHouse")return;
        UIManager.getInstance().openUI(DialogPanel, 1, (ui: DialogPanel) => {
            ui.onShow();
            ui.setContent("是否花费500路费前往该地点?", () => {
                if(GameMain.instance.mainRuntime.ctx.totalMoney >=500){
                    GameMain.instance.mainRuntime.ctx.addMoney(-500)
                    this.moveToLine("oldHouse", () => {
                        cc.sys.localStorage.setItem("location", GameMain.instance.mainRuntime.ctx.currentLocation);
                        this.hideAllLocationNodeCheck();
                        this.jiuzhaiNode.getChildByName("check").active = true;
                        this.setTipNode("当前选中地点: 旧宅门口")
                    });
                }else{
                    UIManager.getInstance().openUI(TipPanel, 2, (ui: TipPanel) => {
                        ui.onShow();
                        ui.showTip("预算不够了", false)
                    })
                }
                this.upgradeTotalMoney();
                UIManager.getInstance().closeUI(DialogPanel);
            }, "确认",false)
        })

    }
    private chooseChangQu() {
        if(GameMain.instance.mainRuntime.ctx.currentLocation === "factory")return;
        UIManager.getInstance().openUI(DialogPanel, 1, (ui: DialogPanel) => {
            ui.onShow();
            ui.setContent("你的背包里没有任何藏品\n去交易行购买一些吧", () => {
                if(GameMain.instance.mainRuntime.ctx.totalMoney >=500){
                    GameMain.instance.mainRuntime.ctx.addMoney(-500)
                    this.moveToLine("factory", () => {
                        cc.sys.localStorage.setItem("location", GameMain.instance.mainRuntime.ctx.currentLocation);
                        this.hideAllLocationNodeCheck();
                        this.changquNode.getChildByName("check").active = true;
                        this.setTipNode("当前选中地点: 厂区仓摊")
                    });
                }else{
                    UIManager.getInstance().openUI(TipPanel, 2, (ui: TipPanel) => {
                        ui.onShow();
                        ui.showTip("预算不够了", false)
                    })
                }
                this.upgradeTotalMoney();
                UIManager.getInstance().closeUI(DialogPanel);
            }, "确认",false)
        })
    }


    upgradeTotalMoney() {
        this.node.getChildByName("bg").getChildByName("totalMoney").getChildByName("content").getComponent(cc.Label).string = "总预算: " + String(GameMain.instance.mainRuntime.ctx.totalMoney);
    }

    private moveToLine(newLocationKey:string,callBack:any = null){
        let oldStr = GameMain.instance.mainRuntime.ctx.currentLocation;
        if(oldStr === newLocationKey)return;
        GameMain.instance.mainRuntime.ctx.currentLocation = newLocationKey
        this.drawLineWithTween(this.keyName2LocaNode(oldStr).position,this.keyName2LocaNode(GameMain.instance.mainRuntime.ctx.currentLocation).position,1,callBack)
    }

    keyName2chName(keyName:string){
        if(keyName == "oldStreet"){
            return "老街杂摊";
        }else if(keyName == "seaside"){
            return "海边旧市";
        }else if(keyName == "oldHouse"){
            return "旧宅门口";
        }else if(keyName == "factory"){
            return "厂区仓摊";
        }else {
            return "老街杂摊";
        }
    }

    keyName2LocaNode(keyName:string){
        if(keyName == "oldStreet"){
            return this.laojieNode;
        }else if(keyName == "seaside"){
            return this.haibianNode
        }else if(keyName == "oldHouse"){
            return this.jiuzhaiNode
        }else if(keyName == "factory"){
            return this.changquNode
        }else {
            return this.laojieNode;
        }
    }

    private hideAllLocationNodeCheck(){
        this.laojieNode.getChildByName("check").active =  false;
        this.haibianNode.getChildByName("check").active = false;
        this.jiuzhaiNode.getChildByName("check").active = false;
        this.changquNode.getChildByName("check").active = false;
    }


    private setTipNode(str:string){
        cc.tween(this.tipNode.node)
            .to(0.2,{scale:1.15})
            .to(0.2,{scale:1.0})
            .start()
        this.tipNode.string = str + "\n" + "此地常出现: "+"\n"+getLocationCategoriesName(GameMain.instance.mainRuntime.ctx.currentLocation) + "物品"

        postMaiDian("选中新地点"+this.keyName2chName(GameMain.instance.mainRuntime.ctx.currentLocation))
    }
}
