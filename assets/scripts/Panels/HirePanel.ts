import { ExpertDef } from "../GameCodes/Datas/GameData";
import GameMain from "../GameMain";
import { BaseUI } from "../UIManager/BaseUI";
import ExpertCell from "../UIManager/ExpertCell";
import { UIManager } from "../UIManager/UIManager";
import MainPanel from "./MainPanel";
import ResultPanel from "./ResultPanel";

const {ccclass, property} = cc._decorator;

@ccclass
export default class HirePanel extends BaseUI {
    protected static className = "HirePanel";

    @property({type: cc.Node})
    list_container: cc.Node = null!;

    override onShow(): void {
        cc.game.on("on_use_expert", this.onUseExpert);
    }

    private onUseExpert(expertDef: ExpertDef) {
        console.log("雇佣专家:", expertDef);
        GameMain.instance.mainRuntime.ctx.ownedExperts.push(expertDef);
        UIManager.getInstance().closeUI(HirePanel);
    }

    setContent(hirePanelData:ExpertDef[]){
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
}
