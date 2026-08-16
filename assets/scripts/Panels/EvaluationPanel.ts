// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { postMaiDian } from "../GameCodes/GameRules";
import GameMain from "../GameMain";
import { BaseUI } from "../UIManager/BaseUI";
import { UIManager } from "../UIManager/UIManager";
import EntrancePanel from "./EntrancePanel";
import MainPanel from "./MainPanel";
import TipPanel from "./TipPanel";

const {ccclass, property} = cc._decorator;

@ccclass
export default class EvaluationPanel extends BaseUI {
    protected static className = "EvaluationPanel";

    btn_ok:cc.Node = null;
    btn_back:cc.Node = null;
    btn_close:cc.Node = null;
    nickName:cc.Label = null;
    content:cc.EditBox = null;

    override onShow(): void {
        this.btn_back = this.node.getChildByName("back");
        this.btn_close = this.node.getChildByName("close");
        this.btn_ok = this.node.getChildByName("bg").getChildByName("btn_ok");
        this.nickName = this.node.getChildByName("bg").getChildByName("nickName").getComponent(cc.Label);
        this.content = this.node.getChildByName("bg").getChildByName("input_content").getComponent(cc.EditBox);

        this.btn_ok.on(cc.Node.EventType.TOUCH_END, this.onConfirm, this)

        this.btn_back.on(cc.Node.EventType.TOUCH_END, () => {
            UIManager.getInstance().closeUI(EvaluationPanel);
        }, this)

        this.btn_close.on(cc.Node.EventType.TOUCH_END, () => {
            UIManager.getInstance().closeUI(EvaluationPanel);
        }, this)


        this.nickName.string = GameMain.instance.mainRuntime.ctx.nickName;

        postMaiDian("进入评价界面");
    }


    private onConfirm(){
        // 上传内容到服务器即可
        if(this.content.string!=""){
            this.confirmProxy(this.content.string);

            let guideKey = "JiuHuoGuide_openComment";
            if(cc.sys.localStorage.getItem(guideKey) === "1")return;
            cc.sys.localStorage.setItem(guideKey,"1");

            GameMain.instance.mainRuntime.ctx.addMoney(200);
            EntrancePanel.instance.upgradeTotalMoney();
        }
    }

    private confirmProxy(_content:string){
            const postData = {
                content: _content
            };

            if (cc.sys.platform === cc.sys.WECHAT_GAME){
                wx.request({
                    url: 'https://jianbao.dxstudio.site/api/player/'+GameMain.instance.mainRuntime.ctx.userid+"/comment",
                    data: postData,
                    header: {'content-type':'application/json'},
                    method: 'POST',
                    dataType: 'json',
                    responseType: 'text',
                    success: (result)=>{
                        console.log("评价成功");
                        UIManager.getInstance().openUI(TipPanel, 2, (ui: TipPanel) => {
                            ui.onShow();
                            ui.showTip("评价成功", false)
                        })
                    },
                    fail: (errMsg)=>{
                        console.error('request POST 请求失败',errMsg);
                    },
                    complete: ()=>{}
                });
            }else{
                fetch('https://jianbao.dxstudio.site/api/player/'+GameMain.instance.mainRuntime.ctx.userid+"/comment", {
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
                        console.log("评价成功");
                        UIManager.getInstance().openUI(TipPanel, 2, (ui: TipPanel) => {
                            ui.onShow();
                            ui.showTip("评价成功", false)
                        })
                    })
                    .catch((error) => {
                        console.error('POST 请求失败:', error);
                    });
            }
        }
}
