import { ItemInstance,ROUND_TARGETS_INFO } from "../GameCodes/Datas/GameData";
import GameContext from "../GameCodes/GameRules";
import { ConstValue } from "../Global/ConstValue";
import ItemCell from "../UIManager/ItemCell";
import ItemCellYJ from "../UIManager/ItemCellYJ";
import MainPanel from "./MainPanel";
import GameMain from "../GameMain";

export default class MainPanelRuntime{
    mainPanel:MainPanel = null!;
    ctx:GameContext = null!;
    init(mp:MainPanel){
        this.mainPanel = mp;
        this.ctx = new GameContext();
        this.ctx.CurLevel = 0;
        this.ctx.totalPoints = ConstValue.TotalPoints;
        this.ctx.startRound();
    };

    initItemInsCell(prefab: cc.Prefab,itemIns:ItemInstance,_parent:cc.Node){
        let newItemCell = cc.instantiate(prefab);
        newItemCell.parent = _parent;
        newItemCell.setPosition(cc.v2(0,0));
        let itemCellScript:ItemCell = newItemCell.getComponent(ItemCell);
        itemCellScript.init(itemIns);
    }

    initInventoryItemInsCell(prefab: cc.Prefab,itemIns:ItemInstance,_parent:cc.Node,showCheckBtn:boolean,){
        let newItemCell = cc.instantiate(prefab);
        newItemCell.parent = _parent;
        newItemCell.setPosition(cc.v2(0,0));
        let itemCellScript:ItemCellYJ = newItemCell.getComponent(ItemCellYJ);
        itemCellScript.init(itemIns,showCheckBtn);
    }

    dispose(){
        this.mainPanel = null!;
    }
}
