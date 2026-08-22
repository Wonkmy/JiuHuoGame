// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { Advertise } from "../GameCodes/Advertise";
import { ItemInstance } from "../GameCodes/Datas/GameData";
import { postMaiDian } from "../GameCodes/GameRules";
import ZhenJiaGoods from "../GameCodes/ZhenJiaGoods";
import GameMain from "../GameMain";
import { BaseUI } from "../UIManager/BaseUI";
import { UIManager } from "../UIManager/UIManager";
import DialogPanel from "./DialogPanel";
import TipPanel from "./TipPanel";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ZhenjiaPanel extends BaseUI {
    protected static className = "ZhenjiaPanel";

    static instance:ZhenjiaPanel=null!;

    @property({type:cc.Node})
    closeBtn:cc.Node = null!;

    goodsSpriteFrame: cc.SpriteFrame = null!;
    itemInstance:ItemInstance = null!;

    curSelectedGoodsIndex:number = -1;

    bossVoice = [
        "~~~不要犹豫了，迅速拿下吧",
        "~~~犹犹豫豫的，果断一点",
        "~~~眼光真不错，这可是真货啊"
    ]

    protected onLoad(): void {
        ZhenjiaPanel.instance = this;
    }

    override onShow(): void {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            UIManager.getInstance().closeUI(ZhenjiaPanel);
        }, this)

        let r = Math.random();
        if (r < 0.5) {
            Advertise.instance.ShowChapingAd();
        }

        this.hideAllGoodsSelectedIcon();
        this.upgradeTotalMoney();
        this.node.getChildByName("btn_buy").on(cc.Node.EventType.TOUCH_END,this.onBuy ,this)
        postMaiDian("真假鉴定界面")
    }

    refreshBoss_dialog(){
        let index = Math.floor(Math.random() * this.bossVoice.length);
        let str = this.bossVoice[index];
        cc.tween(this.node.getChildByName("boss_dialog"))
            .to(0.12,{scale:1.2})
            .to(0.12,{scale:1.0})
            .to(0.12,{scale:1.2})
            .to(0.12,{scale:1.0})
            .start()
        this.node.getChildByName("boss_dialog").getComponent(cc.Label).string = str;
    }

    onBuy(){
        if(this.curSelectedGoodsIndex <= -1){
            UIManager.getInstance().openUI(TipPanel, 2, (ui: TipPanel) => {
                ui.onShow();
                ui.showTip("先选择一个货物吧", false)
            })
            return;
        }
        let price = this.node.getChildByName("goods" + this.curSelectedGoodsIndex).getComponent(ZhenJiaGoods).finalPrice;
        let _itemIns = this.node.getChildByName("goods" + this.curSelectedGoodsIndex).getComponent(ZhenJiaGoods)._itemInstance;
        if(GameMain.instance.mainRuntime.ctx.totalMoney >=  price){
            GameMain.instance.mainRuntime.ctx.addMoney(-price);
            this.upgradeTotalMoney();
            _itemIns.buyPrice = price;
            GameMain.instance.mainRuntime.ctx.inventoryItemInstance.push(_itemIns);
            cc.sys.localStorage.setItem("bag_data",JSON.stringify(GameMain.instance.mainRuntime.ctx.inventoryItemInstance));
            postMaiDian("入手鉴定物品")
            UIManager.getInstance().openUI(DialogPanel, 2, (ui: DialogPanel) => {
                ui.onShow();
                ui.setContent(`太棒了，你入手了${_itemIns.name}`, () => {
                    UIManager.getInstance().closeUI(DialogPanel);
                    this.node.getChildByName("goods" + this.curSelectedGoodsIndex).getComponent(ZhenJiaGoods).clearData();
                }, "确认",false)
            })
        }else{
            UIManager.getInstance().openUI(DialogPanel, 2, (ui: DialogPanel) => {
                ui.onShow();
                ui.setContent(`预算不够了，是否观看视频后直接拿下？`, () => {
                    UIManager.getInstance().closeUI(DialogPanel);
                    Advertise.instance.ShowVideoAd((res:number)=>{
                        if (res === 1) {
                            GameMain.instance.mainRuntime.ctx.inventoryItemInstance.push(_itemIns);
                            cc.sys.localStorage.setItem("bag_data", JSON.stringify(GameMain.instance.mainRuntime.ctx.inventoryItemInstance));
                            UIManager.getInstance().openUI(DialogPanel, 2, (ui: DialogPanel) => {
                                ui.onShow();
                                ui.setContent(`太棒了，你入手了${_itemIns.name}`, () => {
                                    UIManager.getInstance().closeUI(DialogPanel);
                                    this.node.getChildByName("goods" + this.curSelectedGoodsIndex).getComponent(ZhenJiaGoods).clearData();
                                }, "确认",false)
                            })
                        }
                    })
                }, true)
            })
        }
    }

    hideAllGoodsSelectedIcon() {
        for (let i = 0; i < 6; i++) {
            this.node.getChildByName("goods" + (i + 1)).getChildByName("num").active = false;
            this.node.getChildByName("goods" + (i + 1)).getComponent(ZhenJiaGoods)._isSelected = false;
        }
    }

    showCost(num:number){
        this.node.getChildByName("btn_buy").getChildByName("cost").getComponent(cc.Label).string = String(num);
    }

    setGoods(itenInstance: ItemInstance) {
        if (!itenInstance) {
            console.warn("ZhenjiaPanel.setResultSprite: itenInstance is null");
            return;
        }
        this.itemInstance = itenInstance;

        GameMain.instance.bundle.load("arts/items/" + itenInstance.image, cc.SpriteFrame, (err, spriteFrame: cc.SpriteFrame) => {
            if (err) {
                console.error("ZhenjiaPanel.setResultSprite: load spriteFrame error:", err);
                return;
            }

            this.goodsSpriteFrame = spriteFrame;
            const source = this.goodsSpriteFrame;
            const rect = source.getRect();


            for (let i = 0; i < 6; i++) {
                var _color = this.getColor();
                this.node.getChildByName("goods" + (i + 1)).getChildByName("view").getComponent(cc.Sprite).spriteFrame = this.goodsSpriteFrame;
                this.node.getChildByName("goods" + (i + 1)).getChildByName("view").color = _color;
                this.node.getChildByName("goods" + (i + 1)).getChildByName("view").width = rect.width;
                this.node.getChildByName("goods" + (i + 1)).getChildByName("view").height = rect.height;
                this.node.getChildByName("goods" + (i + 1)).getComponent(ZhenJiaGoods).setData(itenInstance);
            }
        });
    }

    upgradeTotalMoney(){
        this.node.getChildByName("totalMoney").getChildByName("content").getComponent(cc.Label).string = "总预算: "+ String(GameMain.instance.mainRuntime.ctx.totalMoney);
    }


    getColor(){
        const colorStr = Math.random().toString(16).slice(2,8);
        var finalColor:cc.Color = new cc.Color();
        cc.Color.fromHEX(finalColor,colorStr);
        return finalColor;
    }
}
