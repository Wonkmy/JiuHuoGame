import { ItemDef, ItemInstance } from "../GameCodes/Datas/GameData";
import GameMain from "../GameMain";
import MainPanel from "../Panels/MainPanel";


const {ccclass, property} = cc._decorator;

@ccclass
export default class ItemCell extends cc.Component {
    btn_Buy:cc.Node = null!;
    itemIns:ItemInstance = null!;
    isBuyed:boolean = false;
    init(_itemIns:ItemInstance){
        this.btn_Buy = this.node.getChildByName("buy_price").getChildByName("btn_Buy");
        this.itemIns = _itemIns;
        GameMain.instance.bundle.load("arts/items/"+ this.itemIns.image,cc.SpriteFrame,(err,spriteFrame:cc.SpriteFrame)=>{
            if(err){
                console.error("load item spriteFrame error:",err);
                return;
            }
            let sprite:cc.Sprite = this.node.getChildByName("view").getComponent(cc.Sprite);
            sprite.spriteFrame = spriteFrame;
        })
        this.node.getChildByName("buy_price").getChildByName("buyPrice").getComponent(cc.Label).string = String(_itemIns.buyPrice);
        this.node.getChildByName("material").getChildByName("txt").getComponent(cc.Label).string = String(_itemIns.material);
        this.node.getChildByName("era").getChildByName("txt").getComponent(cc.Label).string = String(_itemIns.era);
        this.btn_Buy.on(cc.Node.EventType.TOUCH_END,this.onBuy,this);
    }

    onBuy(){
        if(this.isBuyed){
            return;
        }
        let success = MainPanel.instance.onBuyItemInstance(this.itemIns)
        if(success){
            this.isBuyed = true;
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
