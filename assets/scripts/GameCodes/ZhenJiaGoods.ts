import { FaynUtils } from "../Global/FaynUtils";
import ZhenjiaPanel from "../Panels/ZhenjiaPanel";
import { UIManager } from "../UIManager/UIManager";
import { ItemInstance } from "./Datas/GameData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ZhenJiaGoods extends cc.Component {
    _material:cc.Material = null!;
    _sprite:cc.Sprite = null!;
    _isSelected: boolean = false;

    _itemInstance:ItemInstance = null!;
    ID:number  = 0;

    finalPrice:number = 0;

    protected onLoad(): void {
        this.ID = Number(this.node.name.slice(5,6))
        this._sprite = this.node.getChildByName("view").getComponent(cc.Sprite);
        this.node.getChildByName("view").on(cc.Node.EventType.TOUCH_END,this.onTapSelf,this)
    }

    setData(itemInstance:ItemInstance){
        this._itemInstance = itemInstance;
        this.finalPrice = Math.floor(this._itemInstance.buyPrice + this._itemInstance.buyPrice * (Math.random() * this.ID));
    }

    clearData(){
        this._itemInstance = null!;
        this._sprite.spriteFrame = null!;
        this._isSelected = false;
        ZhenjiaPanel.instance.hideAllGoodsSelectedIcon();
        ZhenjiaPanel.instance.showCost(0);
        UIManager.getInstance().closeUI(ZhenjiaPanel);
    }


    private onTapSelf(){
        FaynUtils.PlayMusic("bullet",false,1);
        ZhenjiaPanel.instance.hideAllGoodsSelectedIcon();
        ZhenjiaPanel.instance.refreshBoss_dialog();
        this._isSelected = true;
        ZhenjiaPanel.instance.curSelectedGoodsIndex = this.ID;
        this.node.getChildByName("num").active = true;

        ZhenjiaPanel.instance.showCost(this.finalPrice)
    }
}
