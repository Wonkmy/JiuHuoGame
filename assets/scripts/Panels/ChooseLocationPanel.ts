import GameMain from "../GameMain";
import { BaseUI } from "../UIManager/BaseUI";
import { UIManager } from "../UIManager/UIManager";
import {getLocationCategoriesName} from "../GameCodes/GameRules"

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


    @property({type:cc.Node})
    closeBtn:cc.Node = null!;

    override onShow(): void {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            UIManager.getInstance().closeUI(ChooseLocationPanel);
        }, this)
        this.tipNode = this.node.getChildByName("tip").getComponent(cc.Label);
        this.hideAllLocationNodeCheck();

        this.laojieNode.on(cc.Node.EventType.TOUCH_END,this.chooseLaojie,this)
        this.haibianNode.on(cc.Node.EventType.TOUCH_END,this.chooseHaibian,this)
        this.jiuzhaiNode.on(cc.Node.EventType.TOUCH_END,this.chooseJiuZhai,this)
        this.changquNode.on(cc.Node.EventType.TOUCH_END,this.chooseChangQu,this)

        this.setDefaultDisplay();
    }

    private setDefaultDisplay(){
        if(GameMain.instance.mainRuntime.ctx.currentLocation == "oldStreet"){
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

    private chooseLaojie(){
        GameMain.instance.mainRuntime.ctx.currentLocation = "oldStreet"
        cc.sys.localStorage.setItem("location",GameMain.instance.mainRuntime.ctx.currentLocation);
        this.hideAllLocationNodeCheck();
        this.laojieNode.getChildByName("check").active = true;
        this.setTipNode("当前选中地点: 老街杂摊");
    }
    private chooseHaibian(){
        GameMain.instance.mainRuntime.ctx.currentLocation = "seaside"
        cc.sys.localStorage.setItem("location",GameMain.instance.mainRuntime.ctx.currentLocation);
        this.hideAllLocationNodeCheck();
        this.haibianNode.getChildByName("check").active = true;
        this.setTipNode("当前选中地点: 海边旧市")
    }
    private chooseJiuZhai(){
        GameMain.instance.mainRuntime.ctx.currentLocation = "oldHouse"
        cc.sys.localStorage.setItem("location",GameMain.instance.mainRuntime.ctx.currentLocation);
        this.hideAllLocationNodeCheck();
        this.jiuzhaiNode.getChildByName("check").active = true;
        this.setTipNode("当前选中地点: 旧宅门口")
    }
    private chooseChangQu(){
        GameMain.instance.mainRuntime.ctx.currentLocation = "factory"
        cc.sys.localStorage.setItem("location",GameMain.instance.mainRuntime.ctx.currentLocation);
        this.hideAllLocationNodeCheck();
        this.changquNode.getChildByName("check").active = true;
        this.setTipNode("当前选中地点: 厂区仓摊")
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
    }
}
