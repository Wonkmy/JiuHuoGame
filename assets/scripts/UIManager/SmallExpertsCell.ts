// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { ExpertDef } from "../GameCodes/Datas/GameData";
import ExpertTipPanel from "../Panels/ExpertTipPanel";
import TipPanel from "../Panels/TipPanel";
import { UIManager } from "./UIManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SmallExpertsCell extends cc.Component {
    init(expertDef: ExpertDef) {
        cc.resources.load("arts/experts/" + expertDef.image, cc.SpriteFrame, (err, spriteFrame: cc.SpriteFrame) => {
            if (err) {
                console.error("load item spriteFrame error:", err);
                return;
            }
            let sprite: cc.Sprite = this.node.getChildByName("head").getComponent(cc.Sprite);
            sprite.spriteFrame = spriteFrame;
        })
        this.node.getChildByName("desc").getComponent(cc.Label).string = expertDef.desc;

        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            UIManager.getInstance().openUI(ExpertTipPanel, 0, (ui: ExpertTipPanel) => {
                ui.onShow();
                ui.showTip(`已拥有\n专家名称: ${expertDef.name}\n专家称号: ${expertDef.title}\n专家描述: ${expertDef.desc}`, expertDef.image);
            })
        }, this)
    }
}
