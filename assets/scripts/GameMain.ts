import {ExpertDef, ItemDef } from "./GameCodes/Datas/GameData";
import HomePanel from "./Panels/HomePanel";
import MainPanelRuntime from "./Panels/MainPanelRuntime";
import { FaynUtils } from "./Global/FaynUtils";
import TipPanel from "./Panels/TipPanel";
import { UIManager } from "./UIManager/UIManager";

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
        if(CC_DEBUG){
            cc.assetManager.loadBundle("jiuhuoArt",null!,(err,_bundle)=>{
                this.bundle = _bundle
                this.gameLoader();
            })
        }else{
            // cc.assetManager.loadBundle("https://wonkmycloudfile.oss-cn-beijing.aliyuncs.com/jiuhuoArt",null!,(err,_bundle)=>{
            //     this.bundle = _bundle
            //     this.gameLoader();
            // })
            const ossUrl = "https://wonkmycloudfile.oss-cn-beijing.aliyuncs.com/jiuhuoArt";
            cc.assetManager.loadBundle(ossUrl + "?t=" + Date.now(), null!, (err, bundle) => {
                if (err) {
                    console.error("OSS加载失败:", err);
                    // 如果这里报错，说明 OSS 路径或跨域还有问题
                    return;
                }
                console.log("成功从 OSS 加载 Bundle！");
                this.bundle = bundle;
                this.gameLoader();
            });
        }
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
}
