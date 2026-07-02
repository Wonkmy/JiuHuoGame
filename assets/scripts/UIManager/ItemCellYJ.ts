// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { ItemInstance } from "../GameCodes/Datas/GameData";
import GameMain from "../GameMain";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ItemCellYJ extends cc.Component {
    @property({type:cc.Node})
    selectBtn:cc.Node = null!;

    Icon_isSelected:cc.Node = null!;

    itemIns: ItemInstance = null!;
    isSelected:boolean = false;

    get ISSelected(){
        return this.isSelected;
    }

    set ISSelected(s:boolean){
        this.isSelected = s;
        this.Icon_isSelected.color = s == false?cc.Color.GRAY:cc.Color.WHITE;
    }

    init(_itemIns: ItemInstance) {
        this.itemIns = _itemIns;
        this.Icon_isSelected = this.node.getChildByName("Icon_isSelected")
        this.Icon_isSelected.color = cc.Color.GRAY;
        this.ISSelected = false;
        cc.resources.load("arts/items/" + this.itemIns.image, cc.SpriteFrame, (err, spriteFrame: cc.SpriteFrame) => {
            if (err) {
                console.error("load item spriteFrame error:", err);
                return;
            }
            let sprite: cc.Sprite = this.node.getChildByName("view").getComponent(cc.Sprite);
            sprite.spriteFrame = spriteFrame;
        })
        this.node.getChildByName("buyPrice").getComponent(cc.Label).string = "购买价:￥" + String(_itemIns.buyPrice);
        this.node.getChildByName("item_name").getComponent(cc.Label).string = String("古董物品") + _itemIns.uid;

        this.selectBtn.on(cc.Node.EventType.TOUCH_END,this.onSelected ,this)
    }

    private onSelected(){
        if(!this.isSelected){
            GameMain.instance.mainRuntime.ctx.curSelected = this.itemIns;
            cc.game.emit("on_select",this);
        }
    }
}
