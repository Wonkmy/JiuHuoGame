import HomePanel from "./Panels/HomePanel";
import MainPanelRuntime from "./Panels/MainPanelRuntime";
import TipPanel from "./Panels/TipPanel";
import { UIManager } from "./UIManager/UIManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameMain extends cc.Component {
    public static instance:GameMain = null!;

    protected static className = "GameMain";

    @property({type: cc.JsonAsset})
    gameConfig: cc.JsonAsset = null!;

    mainRuntime:MainPanelRuntime = null!;

    protected onLoad(): void {
        cc.director.getCollisionManager().enabled=true;
        cc.director.getPhysicsManager().enabled = true;
        GameMain.instance = this;
        this.mainRuntime = new MainPanelRuntime();
        this.gameLoader();
    }


    gameLoader(){
        UIManager.getInstance().openUI(HomePanel,0,(ui:HomePanel)=>{
            ui.onShow();
        })
    }

    showTip(content:string){
        UIManager.getInstance().openUI(TipPanel,0,(ui:TipPanel)=>{
            ui.onShow();
            ui.showTip(content);
        })
    }
}
