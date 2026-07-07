// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { ExpertDef } from "../GameCodes/Datas/GameData";
import GameMain from "../GameMain";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ExpertBagCell extends cc.Component {
    expertDef:ExpertDef = null!;
    init(_expertDef: ExpertDef){
            this.expertDef = _expertDef;
            GameMain.instance.bundle.load("arts/experts/" + this.expertDef.image, cc.SpriteFrame, (err, spriteFrame: cc.SpriteFrame) => {
                if (err) {
                    console.error("load item spriteFrame error:", err);
                    return;
                }
                let sprite: cc.Sprite = this.node.getChildByName("head").getComponent(cc.Sprite);
                sprite.spriteFrame = spriteFrame;
            })
            this.node.getChildByName("name").getComponent(cc.Label).string = _expertDef.name;
            this.node.getChildByName("desc").getComponent(cc.Label).string = String(_expertDef.desc);
        }
}
