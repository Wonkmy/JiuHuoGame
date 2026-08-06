// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { ItemInstance } from "../GameCodes/Datas/GameData";
import GameMain from "../GameMain";
import { BaseUI } from "../UIManager/BaseUI";
import { UIManager } from "../UIManager/UIManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ZhenjiaPanel extends BaseUI {
    protected static className = "ZhenjiaPanel";

    @property({type:cc.Node})
    closeBtn:cc.Node = null!;

    goodsSpriteFrame: cc.SpriteFrame = null!;
    itemInstance:ItemInstance = null!;

    override onShow(): void {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            UIManager.getInstance().closeUI(ZhenjiaPanel);
        }, this)
    }

    setGoods(itenInstance: ItemInstance) {
                if (!itenInstance) {
                    console.warn("ZhenjiaPanel.setResultSprite: itenInstance is null");
                    return;
                }
                this.itemInstance = itenInstance;

                GameMain.instance.bundle.load("arts/items/"+itenInstance.image, cc.SpriteFrame, (err, spriteFrame: cc.SpriteFrame) => {
                    if (err) {
                        console.error("ZhenjiaPanel.setResultSprite: load spriteFrame error:", err);
                        return;
                    }

                    this.goodsSpriteFrame = spriteFrame;
                    const source = this.goodsSpriteFrame;
                    const rect = source.getRect();


                    for (let i = 0; i < 6; i++) {
                        var _color = this.getColor();
                        this.node.getChildByName("goods"+(i + 1)).getComponent(cc.Sprite).spriteFrame = this.goodsSpriteFrame;
                        this.node.getChildByName("goods"+(i + 1)).color = _color;
                        this.node.getChildByName("goods"+(i + 1)).width = rect.width;
                        this.node.getChildByName("goods"+(i + 1)).height = rect.height;
                    }
                });
            }


    getColor(){
        const colorStr = Math.random().toString(16).slice(2,8);
        var finalColor:cc.Color = new cc.Color();
        cc.Color.fromHEX(finalColor,colorStr);
        return finalColor;
    }
}
