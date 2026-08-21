// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { ItemInstance } from "../GameCodes/Datas/GameData";
import { postMaiDian } from "../GameCodes/GameRules";
import TableEnt from "../GameCodes/TableEnt";
import GameMain from "../GameMain";
import { ConstValue } from "../Global/ConstValue";
import { BaseUI } from "../UIManager/BaseUI";
import ItemCellYJ from "../UIManager/ItemCellYJ";
import { UIManager } from "../UIManager/UIManager";
import BagPanel from "./BagPanel";
import DialogPanel from "./DialogPanel";
import EntrancePanel from "./EntrancePanel";
import MainPanel from "./MainPanel";
import TipPanel from "./TipPanel";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CangpinPanel extends BaseUI {
    public static instance:CangpinPanel = null!;
    protected static className = "CangpinPanel";

    @property({type:TableEnt})
    tables:TableEnt[] = []

    btn_left:cc.Node = null!;
    btn_right:cc.Node = null!;

    curCangpinguanIndex:number = 0;

    protected onLoad(): void {
        CangpinPanel.instance = this;
    }

    override onShow(): void {
        this.node.getChildByName("body").getChildByName("back").on(cc.Node.EventType.TOUCH_END,this.onCloseSelf,this)
        this.btn_left = this.node.getChildByName("body").getChildByName("btn_left");
        this.btn_right = this.node.getChildByName("body").getChildByName("btn_right");

        this.btn_left.on(cc.Node.EventType.TOUCH_END,this.onLastCangpinGuan,this);
        this.btn_right.on(cc.Node.EventType.TOUCH_END,this.onNextCangpinGuan,this);

        for (let i = 0; i < this.tables.length; i++) {
            const table = this.tables[i];
            table.ID = i;
            if(table){
                if(i <= ConstValue.unLockedTabelLimit){
                    table.init(this.curCangpinguanIndex,true,table.ID);
                    if(!GameMain.instance.mainRuntime.ctx.unLockedTableIndex.includes(table.ID)){
                        GameMain.instance.mainRuntime.ctx.unLockedTableIndex.push(table.ID)
                        cc.sys.localStorage.setItem("unlocked_table_list",JSON.stringify(GameMain.instance.mainRuntime.ctx.unLockedTableIndex))
                    }
                }else{
                    const isUnlocked = GameMain.instance.mainRuntime.ctx.unLockedTableIndex.includes(table.ID);
                    table.init(this.curCangpinguanIndex,isUnlocked,table.ID);
                }
            }
        }
        if(GameMain.instance.mainRuntime.ctx.inventoryItemInstance.length <=0){
            UIManager.getInstance().openUI(DialogPanel,1,(ui:DialogPanel)=>{
                ui.onShow();
                ui.setContent("你的背包里没有任何藏品\n去交易行购买一些吧",()=>{
                    UIManager.getInstance().openUI(EntrancePanel, 0, (ui: EntrancePanel) => {
                        ui.onShow();
                    })
                    UIManager.getInstance().closeUI(CangpinPanel);
                    UIManager.getInstance().closeUI(DialogPanel);
                },false)
            })
        }else{
            for (let i = 0; i < GameMain.instance.mainRuntime.ctx.inventoryItemInstance.length; i++) {
                const itemIns: ItemInstance = GameMain.instance.mainRuntime.ctx.inventoryItemInstance[i];
                if(itemIns.display){
                    // 在数组中查找是否存在 uid 匹配的 TableInfoData 对象
                    const found = GameMain.instance.mainRuntime.ctx.tableInfoDataDict.find(
                        tableInfo => tableInfo.itemData.uid === itemIns.uid
                    );

                    if(found){
                        this.tables[found.tableIndex].onDisplayGoods(found.itemData);
                    }
                }
            }
        }

        // 计算时间差
        let timerSpwan = cc.sys.localStorage.getItem("time")
        if (timerSpwan == '' || timerSpwan == null || timerSpwan == 'undefined' || timerSpwan === undefined) {
            console.log("无收益");
        } else {
            let d = JSON.parse(timerSpwan);
            let lastTime: number = Number(d);
            const currentTime = Date.now();
            const elapsedMs = currentTime - lastTime;
            let finalSeconds = elapsedMs / 1000;
            let finalMoney = 0;
            if(finalSeconds <= 15){

            }else if (finalSeconds > 15 && finalSeconds <= 60) {
                finalMoney = 1;// 给一个保底的金币
                for (let i = 0; i < this.tables.length; i++) {
                    const table = this.tables[i];
                    if (table.haveGoods) {
                        table.genMoneyEntity(finalMoney)
                    }
                }
            }else {
                let percent = finalSeconds - 60;
                // 限制 percent/100 最大为 2
                let multiplier = Math.min(percent / 100, 2);

                for (let i = 0; i < this.tables.length; i++) {
                    const table = this.tables[i];
                    if (table.haveGoods) {
                        finalMoney = table.curItemData.trueValue * multiplier;
                        table.genMoneyEntity(Math.round(finalMoney));
                    }
                }
            }
        }

        this.upgradeTotalMoney();

        cc.game.on("on_display_select",this.onDisplaySelect,this)

        postMaiDian("进入藏品馆")
    }

    setIndex(id:number){
        this.curCangpinguanIndex = id;
    }

    private onDisplaySelect(itemCellYj: ItemCellYJ){
        console.log("准备显示啦");

        if (!itemCellYj.itemIns.display) {
            this.tables[GameMain.instance.mainRuntime.ctx.curSelectedTableIndex].onDisplayGoods(itemCellYj.itemIns);
        }
        else {
            UIManager.getInstance().openUI(TipPanel, 2, (ui: TipPanel) => {
                ui.onShow();
                ui.showTip("当前物品已展出", false)
            })
        }

        GameMain.instance.mainRuntime.ctx.curSelectedTableIndex = -1;
        UIManager.getInstance().closeUI(BagPanel);
    }

    private onLastCangpinGuan(){
        UIManager.getInstance().openUI(TipPanel, 2, (ui: TipPanel) => {
            ui.onShow();
            ui.showTip("更多展厅装修中!", false)
        })
        // this.curCangpinguanIndex --;
        // UIManager.getInstance().openUI(CangpinPanel, 1, (ui: CangpinPanel) => {
        //     ui.setIndex(this.curCangpinguanIndex)
        //     ui.onShow();
        //     UIManager.getInstance().closeUI(CangpinPanel);
        // })

        // if(this.curCangpinguanIndex<0){
        //     this.curCangpinguanIndex = 0;
        // }
        // for (let i = 0; i < this.tables.length; i++) {
        //     const table = this.tables[i];
        //     table.setCurBelongCangpingguanIndex(this.curCangpinguanIndex)
        // }
        // this.node.getChildByName("body").getChildByName("cangpin_title_panel").getChildByName("txt").getComponent(cc.Label).string = `${this.curCangpinguanIndex+ 1}号展厅`
    }

    private onNextCangpinGuan(){
        UIManager.getInstance().openUI(TipPanel, 2, (ui: TipPanel) => {
            ui.onShow();
            ui.showTip("更多展厅装修中!", false)
        })
        // this.curCangpinguanIndex ++;
        // UIManager.getInstance().openUI(CangpinPanel, 1, (ui: CangpinPanel) => {
        //     ui.setIndex(this.curCangpinguanIndex)
        //     ui.onShow();
        //     UIManager.getInstance().closeUI(CangpinPanel);
        // })


        // for (let i = 0; i < this.tables.length; i++) {
        //     const table = this.tables[i];
        //     table.setCurBelongCangpingguanIndex(this.curCangpinguanIndex)
        // }
        // this.node.getChildByName("body").getChildByName("cangpin_title_panel").getChildByName("txt").getComponent(cc.Label).string = `${this.curCangpinguanIndex + 1}号展厅`
    }

    upgradeTotalMoney(){
        this.node.getChildByName("body").getChildByName("totalMoney").getChildByName("content").getComponent(cc.Label).string = "总预算: "+ String(GameMain.instance.mainRuntime.ctx.totalMoney);
    }

    private onCloseSelf(){
        let res = JSON.stringify(Date.now());
        cc.sys.localStorage.setItem("time",res)

        for (let i = 0; i < this.tables.length; i++) {
            const table = this.tables[i];
            table.disposeAllMoneys();
        }

        UIManager.getInstance().openUI(EntrancePanel, 0, (ui: EntrancePanel) => {
            ui.onShow();
        })

        UIManager.getInstance().closeUI(CangpinPanel);
    }
}
