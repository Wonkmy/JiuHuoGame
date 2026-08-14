import { postMaiDian } from "../GameCodes/GameRules";
import GameMain from "../GameMain";
import { BaseUI } from "../UIManager/BaseUI";
import { UIManager } from "../UIManager/UIManager";
import EntrancePanel from "./EntrancePanel";
import TipPanel from "./TipPanel";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ProfilePanel extends BaseUI {
    protected static className = "ProfilePanel";

    input_nickName:cc.EditBox = null;

    btn_ok:cc.Node = null;
    btn_back:cc.Node = null;
    btn_close:cc.Node = null;

    override onShow(): void {
        this.input_nickName = this.node.getChildByName("bg").getChildByName("input_nickName").getComponent(cc.EditBox);
        this.btn_back = this.node.getChildByName("back");
        this.btn_close = this.node.getChildByName("close");
        this.btn_ok = this.node.getChildByName("bg").getChildByName("btn_ok");

        this.btn_ok.on(cc.Node.EventType.TOUCH_END,this.onConfirm ,this)

        this.btn_back.on(cc.Node.EventType.TOUCH_END, () => {
            UIManager.getInstance().closeUI(ProfilePanel);
        }, this)

        this.btn_close.on(cc.Node.EventType.TOUCH_END, () => {
            UIManager.getInstance().closeUI(ProfilePanel);
        }, this)

        this.input_nickName.string = GameMain.instance.mainRuntime.ctx.nickName;

        postMaiDian("进入用户信息界面")
    }

    private onConfirm(){
        this.confirmProxy(this.input_nickName.string)
    }

    private confirmProxy(newnickName:string){
        const postData = {
            nickName: newnickName
        };

        if (cc.sys.platform === cc.sys.WECHAT_GAME){
            wx.request({
                url: 'https://jianbao.dxstudio.site/api/player/'+GameMain.instance.mainRuntime.ctx.userid+"/nickName",
                data: postData,
                header: {'content-type':'application/json'},
                method: 'POST',
                dataType: 'json',
                responseType: 'text',
                success: (result)=>{
                    console.log("更新昵称成功");
                    GameMain.instance.mainRuntime.ctx.nickName = newnickName
                    this.input_nickName.string = GameMain.instance.mainRuntime.ctx.nickName;
                    EntrancePanel.instance.refreshNickNameAndMoney();
                    UIManager.getInstance().openUI(TipPanel, 2, (ui: TipPanel) => {
                        ui.onShow();
                        ui.showTip("更新昵称成功", false)
                    })
                },
                fail: (errMsg)=>{
                    console.error('request POST 请求失败',errMsg);
                },
                complete: ()=>{}
            });
        }else{
            fetch('https://jianbao.dxstudio.site/api/player/'+GameMain.instance.mainRuntime.ctx.userid+"/nickName", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // 告诉服务器发送的是JSON
                },
                body: JSON.stringify(postData), // 将JS对象转为JSON字符串
            })
                .then((response: Response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json(); // 或 response.text()
                })
                .then((data) => {
                    console.log("更新昵称成功");
                    GameMain.instance.mainRuntime.ctx.nickName = newnickName
                    this.input_nickName.string = GameMain.instance.mainRuntime.ctx.nickName;
                    EntrancePanel.instance.refreshNickNameAndMoney();
                    UIManager.getInstance().openUI(TipPanel, 2, (ui: TipPanel) => {
                        ui.onShow();
                        ui.showTip("更新昵称成功", false)
                    })
                })
                .catch((error) => {
                    console.error('POST 请求失败:', error);
                });
        }
    }
}
