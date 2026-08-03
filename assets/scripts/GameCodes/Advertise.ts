const { ccclass, property } = cc._decorator;

@ccclass
export class Advertise extends cc.Component {
    public static instance:Advertise = null!;
    /**
     * 微信广告相关
     */
    chaPingAd:any;//插屏广告
    videoAd:any;//视频激励广告
    hengfuAd:any;//横幅广告
//
    videoId:string = "";
    chapingId:string = "";


    recommendPageManager:any;// 评价与推荐

    protected onLoad(): void {
        Advertise.instance = this;
    }

    hengfuID:string = "adunit-e746cca4ca42a588";
    hengfuID2:string = "adunit-328cf70362126733";
    async InitHengfu(){
        if (!(cc.sys.platform === cc.sys.WECHAT_GAME)) {
            return;
        }
        if (this.hengfuAd != null) return;

        try {
            // @ts-ignore
            const systemInfo = wx.getSystemInfoSync();
            // @ts-ignore
            this.hengfuAd = wx.createCustomAd({
                adUnitId: Math.random() < 0.5 ? this.hengfuID : this.hengfuID2, // 随机选择一个广告单元 ID
                style: {
                    left: 0,
                    top: systemInfo.windowHeight - 100, // 横幅广告高度为 100px，放在屏幕底部
                    width: 350
                }
            });

            // 拉取横幅广告异常处理
            this.hengfuAd.onError((err: any) => {
                // 审核期间这里会静默触发，但不会报红
                console.log('横幅广告拉取失败（可能未审核）', err);
                // 不影响游戏逻辑，静默处理
            });
        } catch (e) {
            console.log('横幅广告创建失败（广告ID未生效，正常现象）', e);
            this.hengfuAd = null; // 置空，防止后续调用
        }
    }

    async InitChapingAd() {
        if (!(cc.sys.platform === cc.sys.WECHAT_GAME)) {
            return;
        }
        if (this.chaPingAd != null) return;

        // 关键：用 try-catch 包裹创建过程
        try {
            // @ts-ignore
            this.chaPingAd = wx.createInterstitialAd({
                adUnitId: "adunit-067ad416fa7e18b4"
            });

            // 拉取插屏异常处理
            this.chaPingAd.onError((err: any) => {
                // 审核期间这里会静默触发，但不会报红
                console.log('插屏广告拉取失败（可能未审核）', err);
                // 不影响游戏逻辑，静默处理
            });

            this.chaPingAd.onLoad((res: any) => {
                console.log('插屏广告加载成功');
            });
        } catch (e) {
            // ✅ 审核期间的报错会被这里捕获，控制台不会出现红色报错
            console.log('插屏广告创建失败（广告ID未生效，正常现象）', e);
            this.chaPingAd = null; // 置空，防止后续调用
        }
    }

    async InitVideoAd() {
        if (!(cc.sys.platform === cc.sys.WECHAT_GAME)) {
            return;
        }
        if (this.videoAd != null) return;

        // 🔥 同样加 try-catch
        try {
            // @ts-ignore
            this.videoAd = wx.createRewardedVideoAd({
                adUnitId: "adunit-a2e85a0a989f845a"
            });

            this.videoAd.onError((err: any) => {
                console.log('视频广告拉取失败（可能未审核）', err);
            });

            this.videoAd.onLoad((res: any) => {
                console.log('视频广告加载成功');
            });
        } catch (e) {
            console.log('视频广告创建失败（广告ID未生效，正常现象）', e);
            this.videoAd = null; // 置空，防止后续调用
        }
    }

    /**
 *  游戏内提前加载推荐组件数据
 */
    async loadRecommend() {
        if (!(cc.sys.platform === cc.sys.WECHAT_GAME)) {
            return;
        }
        if (this.recommendPageManager != null) return;
            // @ts-ignore
        if (!wx.createPageManager) {
            throw '当前基础库版本暂不支持。';
        }
            // @ts-ignore
        this.recommendPageManager = wx.createPageManager();
        await this.recommendPageManager.load({
            openlink: 'TWFRCqV5WeM2AkMXhKwJ03MhfPOieJfAsvXKUbWvQFQtLyyA5etMPabBehga950uzfZcH3Vi3QeEh41xRGEVFw', // 推荐组件OPENLINK常量，直接复制即可，无需理解含义
        });
    }

    async showRecommend() {
        if (!this.recommendPageManager) {
            await this.loadRecommend();
        }
        return await this.recommendPageManager.show();
    }

    ShowHengfuAd(){
        if(this.hengfuAd){
            this.hengfuAd.show().catch((err:any) => {
                console.error(err)
            })
        }
    }

    HideHengfuAd(){
        if(this.hengfuAd){
            this.hengfuAd.hide().catch((err:any) => {
                console.error(err)
            })
        }
    }


    ShowChapingAd(){
        //播放插屏广告
        if(this.chaPingAd){
            this.chaPingAd.show().catch((err:any) => {
                console.error(err)
            })
        }
    }

    ShowVideoAd(callback: Function){
        // 用户触发广告后，显示激励视频广告
        if(!this.videoAd) return;
        this.videoAd.show()
        .catch(() => {
            // 失败重试
            this.videoAd.load()
            .then(() => this.videoAd.show())
            .catch((err:any) => {
                console.log('激励视频 广告显示失败，走分享流程')
                // this.shareObj.activeShare()
                // this.shareDone()
                callback(0)
            })
        })

        //监听广告关闭事件
        this.videoAd.onClose((res:any) => {
            console.log("监听关闭成功",res)
            if(!this.videoAd)return;
            this.videoAd.offClose();//需要清除回调，否则第N次广告会一次性给N个奖励
            //关闭
            if (res && res.isEnded || res === undefined) {
                //正常播放结束，需要下发奖励
                callback(1)
            } else {
                //播放退出，不下发奖励
                callback(2)
            }
        })
    }
}
