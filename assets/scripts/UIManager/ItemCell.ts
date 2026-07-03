import { ItemDef, ItemInstance } from "../GameCodes/Datas/GameData";
import MainPanel from "../Panels/MainPanel";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ItemCell extends cc.Component {
    btn_Buy:cc.Node = null!;
    itemIns:ItemInstance = null!;
    init(_itemIns:ItemInstance,showBuyBtn:boolean){
        this.btn_Buy = this.node.getChildByName("buy_price").getChildByName("btn_Buy");
        this.itemIns = _itemIns;
        cc.resources.load("arts/items/"+ this.itemIns.image,cc.SpriteFrame,(err,spriteFrame:cc.SpriteFrame)=>{
            if(err){
                console.error("load item spriteFrame error:",err);
                return;
            }
            let sprite:cc.Sprite = this.node.getChildByName("view").getComponent(cc.Sprite);
            sprite.spriteFrame = spriteFrame;
        })
        this.node.getChildByName("buy_price").getChildByName("buyPrice").getComponent(cc.Label).string = "购买价:￥" + String(_itemIns.buyPrice);
        this.node.getChildByName("item_name").getComponent(cc.Label).string = String("古董物品") + _itemIns.uid;
        this.btn_Buy.on(cc.Node.EventType.TOUCH_END,this.onBuy,this)
    }

    onBuy(){
        let success = MainPanel.instance.onBuyItemInstance(this.itemIns)
        if(success){
            this.btn_Buy.color = cc.Color.GRAY;
            this.btn_Buy.off(cc.Node.EventType.TOUCH_START,this.onBuy,this)
        }
    }

    protected onDisable(): void {
        this.btn_Buy.off(cc.Node.EventType.TOUCH_START,this.onBuy,this)
    }

    protected onDestroy(): void {
        this.btn_Buy.off(cc.Node.EventType.TOUCH_START,this.onBuy,this)
    }
}
