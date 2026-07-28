const { ccclass } = cc._decorator;

@ccclass()
export class ShareManager extends cc.Component {
    start() {
        // 1. 检查是否在微信小游戏环境
        //@ts-ignore
        if (typeof wx === 'undefined') {
            return;
        }

        // 2. 显示分享按钮 (必须)
        //@ts-ignore
        wx.showShareMenu({
            menus: ['shareAppMessage', 'shareTimeline'] // 分别对应转发给朋友和分享到朋友圈
        });

        // 3. 监听“转发给朋友”事件
        //@ts-ignore
        wx.onShareAppMessage(() => {
            return {
                title: '快来玩《摊上捡个宝》！', // 分享标题
                // imageUrl: 'xxx', // 分享图片，不传则默认使用小游戏logo
                query: 'from=share' // 自定义参数，用于追踪来源
            };
        });

        // 4. 监听“分享到朋友圈”事件
        //@ts-ignore
        wx.onShareTimeline(() => {
            return {
                title: '在旧货摊里捡宝贝，超治愈！'
                // query: 'from=timeline'
            };
        });
    }
}
