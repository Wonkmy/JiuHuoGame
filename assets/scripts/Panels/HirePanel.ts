import { Advertise } from "../GameCodes/Advertise";
import { ExpertDef } from "../GameCodes/Datas/GameData";
import GameMain from "../GameMain";
import { FaynUtils } from "../Global/FaynUtils";
import { BaseUI } from "../UIManager/BaseUI";
import ExpertCell from "../UIManager/ExpertCell";
import { UIManager } from "../UIManager/UIManager";
import MainPanel from "./MainPanel";
import ResultPanel from "./ResultPanel";
import { pickExperts, postMaiDian } from "../GameCodes/GameRules";
import DialogPanel from "./DialogPanel";

const {ccclass, property} = cc._decorator;

@ccclass
export default class HirePanel extends BaseUI {
    protected static className = "HirePanel";

    @property({type: cc.Node})
    list_container: cc.Node = null!;

    @property({type: cc.Node})
    reroll: cc.Node = null!;

    hirePanelData:ExpertDef[] = []

    override onShow(): void {
        cc.game.on("on_use_expert", this.onUseExpert);
        Advertise.instance.ShowHengfuAd();
        this.refreshNewHireData();

        this.reroll.on(cc.Node.EventType.TOUCH_END,()=>{
            UIManager.getInstance().openUI(DialogPanel, 1, (ui: DialogPanel) => {
                ui.onShow();
                ui.setContent("是否重新结识一位顾问?", () => {
                    UIManager.getInstance().closeUI(DialogPanel);
                    postMaiDian("重新结识一位顾问")
                    Advertise.instance.ShowVideoAd((res: number) => {
                        if (res === 1) {
                            this.refreshNewHireData()
                        }
                    })
                },"确认", true)
            })
        },this)

        postMaiDian("进入雇佣专家界面")
    }

    private onUseExpert(expertDef: ExpertDef) {
        console.log("雇佣专家:", expertDef);
        FaynUtils.PlayMusic("buff",false,1);
        GameMain.instance.mainRuntime.ctx.ownedExperts.push(expertDef);
        postMaiDian("雇佣专家:"+ expertDef.name)
        UIManager.getInstance().closeUI(HirePanel);
    }

    private setContent(hirePanelData:ExpertDef[]){
        this.list_container.removeAllChildren();
        for (let i = 0; i < 3; i++) {
            const hireDef: ExpertDef = hirePanelData[i];
            GameMain.instance.bundle.load("prefab/ExpertCell", cc.Prefab, (err, prefab: cc.Prefab) => {
                if (err) {
                    console.error("load itemCell prefab error:", err);
                    return;
                }
                const expertCell = cc.instantiate(prefab);
                expertCell.getComponent(ExpertCell).init(hireDef);
                this.list_container.addChild(expertCell);
            })
        }
    }

    private refreshNewHireData(){
        this.hirePanelData = pickExperts(3, GameMain.instance.mainRuntime.ctx.ownedExperts);
        this.setContent(this.hirePanelData);
    }

    onDestroy(): void {
        Advertise.instance.HideHengfuAd();
    }
}
