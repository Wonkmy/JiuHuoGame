import GameMain from "../GameMain";
import { BaseUI } from "../UIManager/BaseUI";
import MainPanel from "./MainPanel";

const {ccclass, property} = cc._decorator;

@ccclass
export default class HirePanel extends BaseUI {
    protected static className = "ResultPanel";

    override onShow(): void {

    }
}
