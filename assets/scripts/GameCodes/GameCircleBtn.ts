import TipPanel from "../Panels/TipPanel";
import { UIManager } from "../UIManager/UIManager";

// 文件：GameCircleBtn.ts (或其他你喜欢的名字)
const { ccclass, property } = cc._decorator;

@ccclass()
export class GameCircleBtn extends cc.Component {

    // 在 Cocos 编辑器的属性面板里，可以方便地填入从微信后台获取的 openlink
    openLink: string = "-SSEykJvFV3pORt5kTNpS_sCxxvuwXeLaNNfx0k6oenyPEhJwD99ACXGZDS5SsyNuQdZC1lspj6alsSpV7svUXXjlpl240DF0urfQngLTMOkktIDkT6o52YU1su22ljj5fzir85GCKkb5ow0fz583qc603Wel1hx0FLLmirM4wfbbwjA4h0ugw51ojkTqX5VQJ0RHBdbGQee-vQunil5cqKyO3nu84yyAZUGFOsIWACj86boXfgiJBS1si2l4EL1OYeeTBsRS6J29PHgLX_To8Ynxo3oEkXmJZRJ0laMX4ZlL2JWw-pnq1z992FJJNTt5axHzCevCLJ1QhOXgvBNrA";

    protected start(): void {
        this.node.on(cc.Node.EventType.TOUCH_END,this.onBtnOpenGameCircle ,this)
    }

    // 这个方法需要绑定到按钮的点击事件上
    public onBtnOpenGameCircle() {
        // 1. 安全检查：确保代码运行在微信小游戏环境中
        //@ts-ignore
        if (typeof wx === 'undefined') {
            console.warn('非微信小游戏环境，无法使用该功能');
            return;
        }

        // 2. 创建 PageManager 实例
        //@ts-ignore
        const pageManager = wx.createPageManager();

        // 3. 加载并显示游戏圈页面
        pageManager.load({
            openlink: this.openLink,
        }).then((res:any) => {
            console.log('游戏圈加载成功', res);
            // 加载成功后显示
            pageManager.show();
        }).catch((err:any) => {
            console.error('游戏圈加载失败', err);
            UIManager.getInstance().openUI(TipPanel, 0, (ui: TipPanel) => {
                ui.onShow();
                ui.showTip(`宝圈加载失败:${err}`, null)
            })
        });
    }

    protected onDestroy(): void {
        this.node.off(cc.Node.EventType.TOUCH_END,this.onBtnOpenGameCircle ,this)
    }
}
