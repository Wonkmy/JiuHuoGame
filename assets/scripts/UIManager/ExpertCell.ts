import { ExpertDef } from "../GameCodes/Datas/GameData";
import GameMain from "../GameMain";
import { FaynUtils } from "../Global/FaynUtils";
import HirePanel from "../Panels/HirePanel";
import { UIManager } from "./UIManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ExpertCell extends cc.Component {
    expertDef: ExpertDef = null!;
    btnUse:cc.Node = null!;
    init(expertDef: ExpertDef) {
        this.expertDef = expertDef;
        this.btnUse = this.node.getChildByName("btn_use");
        GameMain.instance.bundle.load("arts/experts/"+ expertDef.image,cc.SpriteFrame,(err,spriteFrame:cc.SpriteFrame)=>{
            if(err){
                console.error("load item spriteFrame error:",err);
                return;
            }
            let sprite:cc.Sprite = this.node.getChildByName("head").getComponent(cc.Sprite);
            sprite.spriteFrame = spriteFrame;
        })
        this.node.getChildByName("title").getComponent(cc.Label).string = expertDef.title;
        this.node.getChildByName("name").getComponent(cc.Label).string = expertDef.name;
        this.node.getChildByName("desc").getComponent(cc.Label).string = expertDef.desc;
        this.btnUse.on(cc.Node.EventType.TOUCH_END,this.onClickUseExpert,this)
    }

    private onClickUseExpert() {
        console.log("onClickUseExpert");
        FaynUtils.PlayMusic("btnclick",false,1);
        cc.game.emit("on_use_expert", this.expertDef);
    }
}
