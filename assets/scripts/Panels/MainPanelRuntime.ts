import { ItemInstance } from "../GameCodes/Datas/GameData";
import GameContext from "../GameCodes/GameRules";
import { ConstValue } from "../Global/ConstValue";
import ItemCell from "../UIManager/ItemCell";
import ItemCellYJ from "../UIManager/ItemCellYJ";
import MainPanel from "./MainPanel";

export default class MainPanelRuntime{
    mainPanel:MainPanel = null!;
    ctx:GameContext = null!;
    inventoryItemInstance:ItemInstance[]=[]
    init(mp:MainPanel){
        this.mainPanel = mp;
        this.ctx = new GameContext();
        this.ctx.totalPoints = ConstValue.TotalPoints;
    }

    initItemInsCell(prefab: cc.Prefab,itemIns:ItemInstance,showBuyBtn:boolean,_parent:cc.Node){
        let newItemCell = cc.instantiate(prefab);
        newItemCell.parent = _parent;
        newItemCell.setPosition(cc.v2(0,0));
        let itemCellScript:ItemCell = newItemCell.getComponent(ItemCell);
        itemCellScript.init(itemIns,showBuyBtn);
    }

    initInventoryItemInsCell(prefab: cc.Prefab,itemIns:ItemInstance,_parent:cc.Node){
        let newItemCell = cc.instantiate(prefab);
        newItemCell.parent = _parent;
        newItemCell.setPosition(cc.v2(0,0));
        let itemCellScript:ItemCellYJ = newItemCell.getComponent(ItemCellYJ);
        itemCellScript.init(itemIns);
    }

    dispose(){
        this.mainPanel = null!;
    }
}
