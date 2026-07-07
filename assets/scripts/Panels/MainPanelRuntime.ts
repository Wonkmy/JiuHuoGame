import { ItemInstance,ROUND_TARGETS_INFO,MarketTrend, ExpertDef } from "../GameCodes/Datas/GameData";
import GameContext from "../GameCodes/GameRules";
import { ConstValue } from "../Global/ConstValue";
import ItemCell from "../UIManager/ItemCell";
import ItemCellYJ from "../UIManager/ItemCellYJ";
import MainPanel from "./MainPanel";
import GameMain from "../GameMain";
import ExpertBagCell from "../UIManager/ExpertBagCell";

export default class MainPanelRuntime{
    mainPanel:MainPanel = null!;
    ctx:GameContext = null!;

    currentMarketTrend:MarketTrend = null!;
    init(mp:MainPanel){
        this.mainPanel = mp;
        this.ctx = new GameContext();
        this.ctx.CurLevel = 0;
        this.ctx.totalPoints = ConstValue.TotalPoints;
        this.ctx.startRound();
        this.ctx.totalMoney = ConstValue.defaultMoney;
    };

    initItemInsCell(prefab: cc.Prefab,itemIns:ItemInstance,_parent:cc.Node){
        let newItemCell = cc.instantiate(prefab);
        newItemCell.parent = _parent;
        newItemCell.setPosition(cc.v2(0,0));
        let itemCellScript:ItemCell = newItemCell.getComponent(ItemCell);
        itemCellScript.init(itemIns);
    }
    initInventoryExpertCell(prefab: cc.Prefab,itemIns:ExpertDef,_parent:cc.Node,showCheckBtn:boolean){
        let newItemCell = cc.instantiate(prefab);
        newItemCell.parent = _parent;
        newItemCell.setPosition(cc.v2(0,0));
        let itemCellScript:ExpertBagCell = newItemCell.getComponent(ExpertBagCell);
        itemCellScript.init(itemIns);
    }
    initInventoryItemInsCell(prefab: cc.Prefab,itemIns:ItemInstance,_parent:cc.Node,showCheckBtn:boolean){
        let newItemCell = cc.instantiate(prefab);
        newItemCell.parent = _parent;
        newItemCell.setPosition(cc.v2(0,0));
        let itemCellScript:ItemCellYJ = newItemCell.getComponent(ItemCellYJ);
        itemCellScript.init(itemIns,showCheckBtn);
    }
    getMarketTrendText():string{
        if(!this.currentMarketTrend){
            return "";
        }
        return "本轮行情:" + this.currentMarketTrend.title + "\n" + this.currentMarketTrend.desc + "\n已计入当前估值";
    }

    createMarketTrend(){
        const trends:MarketTrend[] = [
            {title:"瓷器走热",desc:"瓷器类卖价提高 25%",multiplier:1.25,categories:["porcelain"]},
            {title:"书画冷门",desc:"旧书画卖价降低 15%",multiplier:0.85,categories:["painting"]},
            {title:"金属有人收",desc:"铜器和相机表卖价提高 20%",multiplier:1.2,categories:["bronze","cameraWatch"]},
            {title:"民俗玩具热",desc:"民俗玩具卖价提高 30%",multiplier:1.3,categories:["folkToy"]},
            {title:"木器回暖",desc:"木器家具卖价提高 22%",multiplier:1.22,categories:["wood"]},
            {title:"纸货吃香",desc:"纸质物品卖价提高 18%",multiplier:1.18,materials:["纸"]},
            {title:"老年份抢手",desc:"清末和民国旧物卖价提高 18%",multiplier:1.18,eras:["清末","民国"]},
            {title:"普通货压价",desc:"低稀有度物品卖价降低 12%",multiplier:0.88,maxRarity:1},
        ];
        this.currentMarketTrend = trends[Math.floor(Math.random() * trends.length)];
    }

    applyMarketTrend(itemIns:ItemInstance){
        if(!this.currentMarketTrend || !this.isMatchMarketTrend(itemIns,this.currentMarketTrend)){
            return;
        }
        itemIns.trueValue = Math.max(20,Math.round(itemIns.trueValue * this.currentMarketTrend.multiplier));
        itemIns.estimate = Math.max(20,Math.round(itemIns.estimate * this.currentMarketTrend.multiplier));
    }

    private isMatchMarketTrend(itemIns:ItemInstance,trend:MarketTrend):boolean{
        if(trend.categories && trend.categories.indexOf(itemIns.category) >= 0)return true;
        if(trend.materials && trend.materials.indexOf(itemIns.material) >= 0)return true;
        if(trend.eras && trend.eras.indexOf(itemIns.era) >= 0)return true;
        if(trend.maxRarity != null && itemIns.rarity <= trend.maxRarity)return true;
        return false;
    }

    dispose(){
        this.mainPanel = null!;
    }
}
