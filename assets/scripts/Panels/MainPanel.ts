import {CATEGORY_NAME, ItemCategory, ItemInstance } from "../GameCodes/Datas/GameData";
import { createMarketItems } from "../GameCodes/GameRules";
import GameContext from "../GameCodes/GameRules";
import GameMain from "../GameMain";
import { ConstValue } from "../Global/ConstValue";
import { FaynUtils } from "../Global/FaynUtils";
import { BaseUI } from "../UIManager/BaseUI";
import ItemCell from "../UIManager/ItemCell";
import { UIManager } from "../UIManager/UIManager";
import MainPanelRuntime from "./MainPanelRuntime";
import TipPanel from "./TipPanel";
import YiJiaPanel from "./YiJiaPanel";
import BagPanel from "./BagPanel";
import { Advertise } from "../GameCodes/Advertise";
import DialogPanel from "./DialogPanel";
import EntrancePanel from "./EntrancePanel";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MainPanel extends BaseUI {
    public static instance:MainPanel = null!;
    protected static className = "MainPanel";

    btn_YJ:cc.Node = null!;
    btn_ReRoll:cc.Node = null!;
    btn_addMoney:cc.Node = null!;
    btn_back:cc.Node = null!;

    marketItemContainer:cc.Node = null!;

    totalCostMoney:number = 0;

    @property({type:cc.Node})
    openBagPanel:cc.Node = null!;

    @property({type:cc.Node})
    openExpertBagPanel:cc.Node = null!;

    @property({type:cc.Node})
    openCangpinPanel:cc.Node = null!;

    @property({type:cc.Label})
    roundInfoLabel:cc.Label = null!;

    onLoad(): void {
        MainPanel.instance = this;
        GameMain.instance.mainRuntime.initAD();
    }

    override onShow(): void {
        this.btn_YJ = this.node.getChildByName("btn_YJ");
        this.btn_ReRoll = this.node.getChildByName("btn_ReRoll");
        this.btn_addMoney = this.node.getChildByName("addMoney");
        this.btn_back = this.node.getChildByName("back");
        this.marketItemContainer = this.node.getChildByName("ItemContainers").getChildByName("sview").getChildByName("view").getChildByName("content")
        GameMain.instance.mainRuntime.createMarketTrend();
        this.onCreateItems();

        this.btn_YJ.on(cc.Node.EventType.TOUCH_END,this.onYiJia ,this)
        this.btn_ReRoll.on(cc.Node.EventType.TOUCH_END,this.onReRoll ,this)
        this.btn_addMoney.on(cc.Node.EventType.TOUCH_END,this.onAddMoney,this)
        this.openCangpinPanel.on(cc.Node.EventType.TOUCH_END,this.onOpenCangpinPanel,this)
        this.btn_back.on(cc.Node.EventType.TOUCH_END,this.onBackLaojie,this)

        this.openBagPanel.on(cc.Node.EventType.TOUCH_END, () => {
            FaynUtils.PlayMusic("btnclick",false,1);
            UIManager.getInstance().openUI(BagPanel, 0, (ui: BagPanel) => {
                ui.onShow();
                ui.setInventoryData("bag")
            })
        }, this)

        this.openExpertBagPanel.on(cc.Node.EventType.TOUCH_END, () => {
            FaynUtils.PlayMusic("btnclick",false,1);
            UIManager.getInstance().openUI(BagPanel, 0, (ui: BagPanel) => {
                ui.onShow();
                ui.setInventoryData("expert")
            })
        }, this)

        this.showGuideTipOnce("main_buy","先买入几件旧货，买入价越低，试错空间越大。",2);

        this.node.getChildByName("share").on(cc.Node.EventType.TOUCH_END,this.onShareBtnClick,this);
        this.node.getChildByName("tuijian").on(cc.Node.EventType.TOUCH_END,this.onTuijianBtnClick,this);
    }
    public onShareBtnClick() {
        //@ts-ignore
        if (typeof wx === 'undefined') return;
        //@ts-ignore
        wx.shareAppMessage({
            title: '我刚在《摊上捡个宝》里捡到宝了！',
            imageUrl: 'https://mmocgame.qpic.cn/wechatgame/SUPteJsTQTnMic0ibpIp8QYnc6e3CR4KkHeYXuneYaVFK5ZvM7jmNZibuLzdNmfiaMaO/0',
            query: 'from=button',
        });
        this.addMoneyProcess(200);
    }

    onTuijianBtnClick(){
        //@ts-ignore
        if (typeof wx === 'undefined') return;
        Advertise.instance.showRecommend();
        setTimeout(()=>{
            this.addMoneyProcess(50);
        },1000)
    }

    onBackLaojie(){
        UIManager.getInstance().closeUI(MainPanel);
        UIManager.getInstance().openUI(EntrancePanel, 0, (ui: EntrancePanel) => {
            ui.onShow();
        })
    }

    onOpenCangpinPanel(){
        UIManager.getInstance().openUI(TipPanel, 1, (ui: TipPanel) => {
            ui.onShow();
            ui.showTip("藏馆还在布置,等展柜安好，再开门迎客", null,false,1.5)
        })
    }

    private onAddMoney(){
        UIManager.getInstance().openUI(DialogPanel,1,(ui:DialogPanel)=>{
            ui.onShow();
            ui.setContent("预算不够了?看段视频\n+500预算。",()=>{
                Advertise.instance.ShowVideoAd((res: number) => {
                    if (res == 1) {
                        UIManager.getInstance().closeUI(DialogPanel);
                        this.addMoneyProcess(500);
                    }
                    else if (res == 2) {
                        UIManager.getInstance().openUI(TipPanel, 0, (ui: TipPanel) => {
                            ui.onShow();
                            ui.showTip("视频播放失败", null)
                        })
                    }
                })
            })
        })
    }

    addMoneyProcess(n:number){
        GameMain.instance.mainRuntime.ctx.addMoney(n);
        this.upgradeTotalMoney();
        if (n > 0) {
            UIManager.getInstance().openUI(DialogPanel, 0, (ui: DialogPanel) => {
                ui.onShow();
                ui.setContent(`获得\n${n}\n预算`, () => {
                    UIManager.getInstance().closeUI(DialogPanel);
                }, false)
            })
        }else{
            UIManager.getInstance().openUI(TipPanel, 1, (ui: TipPanel) => {
                ui.onShow();
                ui.showTip(`花费/损失${n}预算`,null,false,1.2);
            })
        }
    }

    onCreateItems(){
        this.marketItemContainer.removeAllChildren();
        let nextuid = ()=>GameMain.instance.mainRuntime.ctx.getUid()
        let curLevel = GameMain.instance.mainRuntime.ctx.CurLevel;
        let excludeIds = GameMain.instance.mainRuntime.ctx.inventoryItemInstance.map(item => item.id);
        let allItemInstance = createMarketItems(nextuid,curLevel + 1, excludeIds)// 生成摊位上的老旧物品
        allItemInstance.forEach((itemIns)=>{
            GameMain.instance.mainRuntime.applyHiddenMarket(itemIns);
            GameMain.instance.mainRuntime.applyMarketTrend(itemIns);// 本轮行情只影响卖价预期，不影响买入价
        });
        this.upgradeTotalMoney();
        let marketName = String(GameMain.instance.mainRuntime.ctx.targetInfo.marketName);
        if(GameMain.instance.mainRuntime.ctx.hiddenMarketActive){
            marketName += "·熟客引荐";
        }
        this.node.getChildByName("targetName").getComponent(cc.Label).string = marketName;
        this.updateRoundInfo();
        let count:number = Math.round(allItemInstance.length / 3);
        this.marketItemContainer.height = count * 216.2 + (count + 1) * 30;
        for (let i = 0; i < allItemInstance.length; i++) {
            const itemIns:ItemInstance = allItemInstance[i];
            GameMain.instance.bundle.load("prefab/itemCell", cc.Prefab, (err, prefab: cc.Prefab) => {
                if (err) {
                    console.error("load itemCell prefab error:", err);
                    return;
                }
                GameMain.instance.mainRuntime.initItemInsCell(prefab,itemIns,this.marketItemContainer);
            })
        }
    }

    /**
     * 开始进入议价界面
     */
    private onYiJia(){
        FaynUtils.PlayMusic("btnclick",false,1);
        if (GameMain.instance.mainRuntime.ctx.inventoryItemInstance.length <= 0) {
            FaynUtils.PlayMusic("error",false,1);
            UIManager.getInstance().openUI(TipPanel, 0, (ui: TipPanel) => {
                ui.onShow();
                ui.showTip("请购买至少一件老物件", null)
            })
        } else {
            var displayItems = GameMain.instance.mainRuntime.ctx.inventoryItemInstance.filter(item => !item.display);
            if(displayItems.length <= 0){
                UIManager.getInstance().openUI(DialogPanel, 0, (ui: DialogPanel) => {
                    ui.onShow();
                    ui.setContent("你所有的货物都在展示中，无法进行鉴赏。", ()=>{
                        UIManager.getInstance().closeUI(DialogPanel);
                    },false)
                })
            }else{
                UIManager.getInstance().closeUI(MainPanel);
                UIManager.getInstance().openUI(YiJiaPanel, 0, (ui: YiJiaPanel) => {
                    ui.buyTotolPrice = this.totalCostMoney;
                    ui.onShow();
                })
            }
        }
    }

    /**
     * 重新刷新当前店铺物品，需要花费高额预算（后期看广告的盈利点）
     */
    private onReRoll(){
        FaynUtils.PlayMusic("btnclick",false,1);
        // if(GameMain.instance.mainRuntime.ctx.totalMoney >= ConstValue.REROLL_COST){
        //     GameMain.instance.mainRuntime.ctx.addMoney(-ConstValue.REROLL_COST);
        //     FaynUtils.PlayMusic("click",false,1);
        //     this.upgradeTotalMoney();
        //     this.onCreateItems();
        // }else{
        //     FaynUtils.PlayMusic("error",false,1);
        //     UIManager.getInstance().openUI(TipPanel,0,(ui:TipPanel)=>{
        //         ui.onShow();
        //         ui.showTip("预算不够了",null)
        //     })
        // }
        UIManager.getInstance().openUI(DialogPanel,1,(ui:DialogPanel)=>{
            ui.onShow();
            ui.setContent("观看一段视频刷新物品?",()=>{
                Advertise.instance.ShowVideoAd((res: number) => {
                    if (res == 1) {
                        UIManager.getInstance().closeUI(DialogPanel);
                        FaynUtils.PlayMusic("click", false, 1);
                        this.onCreateItems();
                    }
                    else if (res == 2) {
                        UIManager.getInstance().openUI(TipPanel, 0, (ui: TipPanel) => {
                            ui.onShow();
                            ui.showTip("视频播放失败", null)
                        })
                    }
                })
            })
        })
    }

    onBuyItemInstance(_itemIns:ItemInstance){
        if(GameMain.instance.mainRuntime.ctx.totalMoney >=  _itemIns.buyPrice){
            // GameMain.instance.mainRuntime.ctx.totalMoney -=  _itemIns.buyPrice;
            GameMain.instance.mainRuntime.ctx.addMoney(-_itemIns.buyPrice);
            this.totalCostMoney +=  _itemIns.buyPrice;
            FaynUtils.PlayMusic("buy",false,1);
            this.upgradeTotalMoney();
            UIManager.getInstance().openUI(TipPanel,0,(ui:TipPanel)=>{
                ui.onShow();
                ui.showTip(`成功购买 ${_itemIns.name}。价格: ${_itemIns.buyPrice}`,null)
            })
            this.showGuideTipOnce("after_buy","买够后点击鉴赏，看看这些货到底值不值钱。",1.4);
            GameMain.instance.mainRuntime.ctx.inventoryItemInstance.push(_itemIns);
            cc.sys.localStorage.setItem("bag_data",JSON.stringify(GameMain.instance.mainRuntime.ctx.inventoryItemInstance))
            return true;
        }else{
            FaynUtils.PlayMusic("error",false,1);
            UIManager.getInstance().openUI(TipPanel,0,(ui:TipPanel)=>{
                ui.onShow();
                ui.showTip("预算不够了",null)
            })
        }
        return false;
    }

    upgradeTotalMoney(){
        this.node.getChildByName("totalMoney").getChildByName("content").getComponent(cc.Label).string = "总预算: "+ String(GameMain.instance.mainRuntime.ctx.totalMoney);
    }

    private updateRoundInfo(){
        if(!this.roundInfoLabel)return;
        let target = GameMain.instance.mainRuntime.ctx.targetInfo.target;
        // 买货界面只显示决策摘要，完整说明保留在鉴赏界面。
        this.roundInfoLabel.string = "目标｜" + String(target) +
            "\n行情｜" + this.getShortMarketTrendText() +
            "\n委托｜" + this.getShortRoundTaskText();
    }

    private getShortMarketTrendText():string{
        let trend = GameMain.instance.mainRuntime.currentMarketTrend;
        if(!trend)return "暂无";
        let rate = Math.round((trend.multiplier - 1) * 100);
        let rateText = rate > 0 ? "+" + String(rate) + "%" : String(rate) + "%";
        let targetText = trend.title;
        if(trend.categories && trend.categories.length > 0){
            targetText = trend.categories.map((category)=>{
                return CATEGORY_NAME[category as ItemCategory] || category;
            }).join("/");
        }else if(trend.materials && trend.materials.length > 0){
            targetText = trend.materials.join("/");
        }else if(trend.eras && trend.eras.length > 0){
            targetText = trend.eras.join("/");
        }else if(trend.maxRarity != null){
            targetText = "普通货";
        }
        return targetText + " " + rateText;
    }

    private getShortRoundTaskText():string{
        let task = GameMain.instance.mainRuntime.ctx.roundTask;
        if(!task)return "暂无";
        let rewardText = " +" + String(task.reward);
        if(task.kind === "sellCategory" && task.category){
            return "卖1件" + CATEGORY_NAME[task.category] + rewardText;
        }
        if(task.kind === "sellEra" && task.era){
            return "卖1件" + task.era + "旧物" + rewardText;
        }
        if(task.kind === "repairSell"){
            return "卖1件修复旧物" + rewardText;
        }
        if(task.kind === "fullRevealSell"){
            return "卖1件看透旧物" + rewardText;
        }
        return task.desc + rewardText;
    }

    private showGuideTipOnce(key:string,txt:string,delayTime:number = 0){
        let guideKey = "JiuHuoGuide_" + key;
        if(cc.sys.localStorage.getItem(guideKey) === "1")return;
        cc.sys.localStorage.setItem(guideKey,"1");
        // 新手提示只出现一次，避免后续重复打断玩家。
        this.scheduleOnce(()=>{
            UIManager.getInstance().openUI(TipPanel, 0, (ui: TipPanel) => {
                ui.onShow();
                ui.showTip(txt, null)
            })
        },delayTime);
    }

    // onDestroy(): void {
    //     this.node.getChildByName("share").off(cc.Node.EventType.TOUCH_END,this.onShareBtnClick,this)
    // }
}


export interface BuffData{
    id: number;
    name: string;
    buffType: number;
    buffKind: number;
    des: string;
    effects: string;
    bDuration: number;
    isOverlay: number;
}
