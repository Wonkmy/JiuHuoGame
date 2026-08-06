import {ExpertDef, ItemDef } from "./GameCodes/Datas/GameData";
import HomePanel from "./Panels/HomePanel";
import MainPanelRuntime from "./Panels/MainPanelRuntime";
import { FaynUtils } from "./Global/FaynUtils";
import TipPanel from "./Panels/TipPanel";
import { UIManager } from "./UIManager/UIManager";
import WechatManager from "./Net/Login/WechatAuth";


declare const wx: any;
const {ccclass, property} = cc._decorator;

@ccclass
export default class GameMain extends cc.Component {
    public static instance:GameMain = null!;

    protected static className = "GameMain";

    @property({type: cc.JsonAsset})
    gameConfig: cc.JsonAsset = null!;
    ITEM_DEFS: ItemDef[] =[]
    EXPERT_DEFS: ExpertDef[] = []

    mainRuntime:MainPanelRuntime = null!;
    bundle:cc.AssetManager.Bundle = null!;
    private marketBgmStarted:boolean = false;

    protected onLoad(): void {
        cc.director.getCollisionManager().enabled=true;
        cc.director.getPhysicsManager().enabled = true;
        GameMain.instance = this;
        this.mainRuntime = new MainPanelRuntime();
        this.ITEM_DEFS = this.gameConfig.json["items"];
        this.EXPERT_DEFS = this.gameConfig.json["experts"];

        this.login()

        // if(CC_DEBUG){
        //     cc.assetManager.loadBundle("jiuhuoArt",null!,(err,_bundle)=>{
        //         this.bundle = _bundle
        //         this.gameLoader();
        //     })
        // }else{
        //     const ossUrl = "https://wonkmycloudfile.oss-cn-beijing.aliyuncs.com/jiuhuoArt";
        //     cc.assetManager.loadBundle(ossUrl + "?t=" + Date.now(), null!, (err, bundle) => {
        //         if (err) {
        //             console.error("OSS加载失败:", err);
        //             // 如果这里报错，说明 OSS 路径或跨域还有问题
        //             return;
        //         }
        //         console.log("成功从 OSS 加载 Bundle！");
        //         this.bundle = bundle;
        //         this.gameLoader();
        //     });
        // }
        cc.assetManager.loadBundle("jiuhuoArt",null!,(err,_bundle)=>{
                this.bundle = _bundle
                this.gameLoader();
            })
    }

    async login() {
        try {
            // 检查本地是否有用户信息
            const localOpenid = wx.getStorageSync('openid');

            if (localOpenid) {
                // 本地有缓存，直接获取最新分数
                const userData = await WechatManager.getUserScore(localOpenid);
                console.log('用户已登录，当前分数：', userData.score);
            } else {
                // 首次登录
                const userData = await WechatManager.loginAndGetScore();
                console.log('首次登录，初始分数：', userData.score);
                // 可选：获取用户头像昵称（需要用户点击授权）
                this.getUserProfile();
            }
        } catch (error) {
            console.error('登录失败：', error);
        }
    }

    // 游戏结束时更新分数
    async gameOver(finalScore: number) {
        try {
            const newScore = await WechatManager.updateScore(finalScore);
            console.log('分数已更新：', newScore);
        } catch (error) {
            console.error('更新分数失败：', error);
        }
    }

    async showRank() {
        try {
            const rankData = await WechatManager.getRank();
            return rankData;
        } catch (error) {
            console.error('获取排行榜失败：', error);
        }
    }

    // 获取用户信息（需要用户点击触发）
    getUserProfile() {
        wx.getUserProfile({
            desc: '用于完善个人资料',
            success: async (res:any) => {
                const { nickName, avatarUrl } = res.userInfo;
                await WechatManager.updateUserInfo(nickName, avatarUrl);
                console.log('用户信息已更新');
            },
            fail: (err:any) => {
                console.log('用户拒绝授权');
            }
        });
    }

    gameLoader(){
        UIManager.getInstance().openUI(HomePanel,0,(ui:HomePanel)=>{
            ui.onShow();
        })
    }

    showTip(content:string){
        UIManager.getInstance().openUI(TipPanel,0,(ui:TipPanel)=>{
            ui.onShow();
            ui.showTip(content,null);
        })
    }

    playMarketBgmOnce(){
        if(this.marketBgmStarted)return;
        this.marketBgmStarted = true;
        // BGM只在进入游戏后播放一次，循环铺底，音量低于点击和反馈音效。
        FaynUtils.PlayMusic("marketbgm",true,0.35);
    }

    public reportRanksingle(level: number) {
        if (cc.sys.platform != cc.sys.WECHAT_GAME) {
            return;
        }

        // @ts-ignore
        wx.setUserCloudStorage({ //调用微信接口上报关卡等级信息，用于好友圈排行
            KVDataList: [
                { key: 'rksingle', value: `${level}` }
            ],

            success: () => {
                console.log('最高收益上报成功：' + level);
            },

            fail: (err: any) => {
                console.error('上报失败：', err);
            }
        });
    }
}
