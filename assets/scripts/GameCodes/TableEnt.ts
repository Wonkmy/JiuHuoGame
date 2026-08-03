import GameMain from "../GameMain";
import { ConstValue } from "../Global/ConstValue";
import { FaynUtils } from "../Global/FaynUtils";
import BagPanel from "../Panels/BagPanel";
import CangpinPanel from "../Panels/CangpinPanel";
import DialogPanel from "../Panels/DialogPanel";
import MainPanel from "../Panels/MainPanel";
import TipPanel from "../Panels/TipPanel";
import { UIManager } from "../UIManager/UIManager";
import { ItemInstance } from "./Datas/GameData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TableEnt extends cc.Component {
    putBtn:cc.Node = null!; // 放置按钮，打开背包选择一个展示
    unlockBtn:cc.Node = null!; // 解锁按钮，需要解锁才能使用
    goodsView:cc.Sprite = null!;// 展示的货物Node

    @property()
    isUnlock:boolean = false;// 是否已解锁?

    ID:number = -1;
    curItemData:ItemInstance = null!;

    haveGoods:boolean = false;

    allMoneyChildNodes:cc.Node[] =[]

    init(unlock:boolean,id:number): void {
        this.ID = id;
        this.isUnlock = unlock;
        this.putBtn = this.node.getChildByName("put");
        this.unlockBtn = this.node.getChildByName("lock");
        this.goodsView = this.node.getChildByName("view").getComponent(cc.Sprite);
        if(this.isUnlock){// 已经解锁
            this.unlockBtn.active = false;
        }else{
            this.putBtn.active = false;
        }
        this.putBtn.on(cc.Node.EventType.TOUCH_END,this.onPut,this)
        this.unlockBtn.on(cc.Node.EventType.TOUCH_END,this.onUnlockTable,this);
    }

    private onPut(){
        // 放置背包中的货物进行展览
        if (this.isUnlock == true) {
            if (this.haveGoods == false) {
                UIManager.getInstance().openUI(BagPanel, 1, (ui: BagPanel) => {
                    ui.onShow();
                    ui.setInventoryData("bag", true)
                    GameMain.instance.mainRuntime.ctx.curSelectedTableIndex = this.ID;
                })
            }
        }
    }

    disposeAllMoneys(){
        this.allMoneyChildNodes.forEach(money => {
            money.destroy()
        });

        this.allMoneyChildNodes = [];
    }

    genMoneyEntity(money:number){
        // 98  15
        GameMain.instance.bundle.load("prefab/money", cc.Prefab, (err, prefab: cc.Prefab) => {
            if (err) {
                console.error("load item spriteFrame error:", err);
                return;
            }
            let newMoneyNode: cc.Node = cc.instantiate(prefab);
            this.node.addChild(newMoneyNode);
            this.allMoneyChildNodes.push(newMoneyNode);
            newMoneyNode.scale = money > 10 ? 1.5:1.2
            newMoneyNode.setPosition(98, 15);
            newMoneyNode.on(cc.Node.EventType.TOUCH_END,()=>{
                console.log("点击钱币");
                GameMain.instance.mainRuntime.ctx.addMoney(money);
                CangpinPanel.instance.upgradeTotalMoney();
                UIManager.getInstance().openUI(TipPanel, 1, (ui: TipPanel) => {
                    ui.onShow();
                    ui.showTip(`获得展览收益\n+${money}`, null,false,1.5);
                })
                newMoneyNode.destroy()
            },this)
            cc.tween(newMoneyNode)
                .repeatForever(
                    cc.tween().to(0.28,{scale:1.65})
                    .to(0.3,{scale:1.2})
                )
                .start()
        })
    }

    private onUnlockTable() {
        if(this.isUnlock == false){
            // 解锁当前桌子
            UIManager.getInstance().openUI(DialogPanel, 1, (ui: DialogPanel) => {
                ui.onShow();
                ui.setContent(`是否花费${ConstValue.UNLOCK_TABLE_COST}预算\n解锁此展桌?`, this.unlockProcess, false)
            })
        }
    }

    onDisplayGoods(itemData:ItemInstance){
        if(this.isUnlock == true){
            GameMain.instance.bundle.load("arts/items/" + itemData.image, cc.SpriteFrame, (err, spriteFrame: cc.SpriteFrame) => {
                if (err) {
                    console.error("load item spriteFrame error:", err);
                    return;
                }
                this.goodsView.spriteFrame = spriteFrame;
            })
            this.unlockBtn.active = false;
            this.putBtn.active = false;
            itemData.display = true;
            this.haveGoods = true;
            this.curItemData = itemData;
            const found = GameMain.instance.mainRuntime.ctx.tableInfoDataDict.find(
                tableInfo => tableInfo.itemData.uid === itemData.uid
            );
            if(!found){
                GameMain.instance.mainRuntime.ctx.tableInfoDataDict.push(
                    {
                        tableIndex:this.ID,
                        itemData:itemData
                    }
                )
                cc.sys.localStorage.setItem("tableInfoDataDict",JSON.stringify(GameMain.instance.mainRuntime.ctx.tableInfoDataDict))

                let ii = GameMain.instance.mainRuntime.ctx.inventoryItemInstance.indexOf(itemData)
                GameMain.instance.mainRuntime.ctx.inventoryItemInstance[ii].display = true;
                cc.sys.localStorage.setItem("bag_data",JSON.stringify(GameMain.instance.mainRuntime.ctx.inventoryItemInstance))
            }
        }
    }

    private unlockProcess() {
        if (GameMain.instance.mainRuntime.ctx.totalMoney >= ConstValue.UNLOCK_TABLE_COST) {
            GameMain.instance.mainRuntime.ctx.addMoney(-ConstValue.UNLOCK_TABLE_COST);
            CangpinPanel.instance.upgradeTotalMoney();
            UIManager.getInstance().closeUI(DialogPanel);
            UIManager.getInstance().openUI(TipPanel, 1, (ui: TipPanel) => {
                ui.onShow();
                ui.showTip("已解锁当前桌子", null)
            })
            this.isUnlock = true;
            this.unlockBtn.active = !this.isUnlock;
            this.putBtn.active = this.isUnlock;
            GameMain.instance.mainRuntime.ctx.unLockedTableIndex.push(this.ID)
            cc.sys.localStorage.setItem("unlocked_table_list", JSON.stringify(GameMain.instance.mainRuntime.ctx.unLockedTableIndex))
        }
        else {
            FaynUtils.PlayMusic("error", false, 1);
            UIManager.getInstance().openUI(TipPanel, 1, (ui: TipPanel) => {
                ui.onShow();
                ui.showTip("预算不够了\n`邀请鉴宝`可获得预算", null)
                UIManager.getInstance().closeUI(DialogPanel);
            })
        }
    }
}
