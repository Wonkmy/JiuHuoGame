import { UIManager } from "../UIManager/UIManager";
import { BaseUI } from "../UIManager/BaseUI";
import { FaynUtils } from "../Global/FaynUtils";
const {ccclass, property} = cc._decorator;

@ccclass
export default class DialogPanel extends BaseUI {
    private static _instance: DialogPanel = null!;

    @property({type:cc.Label})
    contentLabel:cc.Label = null!;

    @property({type:cc.Node})
    yes_btnNode:cc.Node = null!;

    @property({type:cc.Node})
    close:cc.Node = null!;

    @property({type:cc.Node})
    adNode:cc.Node = null!;

    yesAction:any=null;
	public static get Instance() {

		return this._instance;
	}

    protected static className = "DialogPanel";

    onShow(): void {
        this.yes_btnNode.on(cc.Node.EventType.TOUCH_END,()=>{
            FaynUtils.PlayMusic("btnclick")
            this.yesAction();
        },this)
        this.close.on(cc.Node.EventType.TOUCH_END,()=>{
            FaynUtils.PlayMusic("btnclick")
            UIManager.getInstance().closeUI(DialogPanel);
        },this)
    }
    setContent(content:string,yesAction:any,btnTxt:string = "确认",showAD:boolean = true)
    {
        if(this.adNode){
            this.adNode.active = showAD;
        }
        this.yesAction=yesAction;
        this.yes_btnNode.getChildByName("txt").getComponent(cc.Label).string = btnTxt;
        this.contentLabel.string = content;
    }
}
