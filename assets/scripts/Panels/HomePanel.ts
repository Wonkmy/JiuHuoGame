import GameMain from "../GameMain";
import { BaseUI } from "../UIManager/BaseUI";
import { UIManager } from "../UIManager/UIManager";
import MainPanel from "./MainPanel";
import MainPanelRuntime from "./MainPanelRuntime";

const {ccclass, property} = cc._decorator;

@ccclass
export default class HomePanel extends BaseUI {
    public static instance:HomePanel = null!;
    protected static className = "HomePanel";

    @property({type:cc.Sprite})
    slider_bg:cc.Sprite = null!;

    onLoad(): void {
        HomePanel.instance = this;
    }

    override onShow(): void {
        this.onGameInit();
    }
    onGameInit(){
        this.startProgress();
    }
    startProgress(){
        const setTimeID = setInterval(()=>{
            this.slider_bg.fillRange += 0.1;
            if(this.slider_bg.fillRange >= 1){
                clearInterval(setTimeID);
                UIManager.getInstance().closeUI(HomePanel);

                UIManager.getInstance().openUI(MainPanel,0,(ui:MainPanel)=>{
                    GameMain.instance.mainRuntime.init(ui);
                    ui.onShow();
                    GameMain.instance.playMarketBgmOnce();
                })
            }
        },100);
    }
}
