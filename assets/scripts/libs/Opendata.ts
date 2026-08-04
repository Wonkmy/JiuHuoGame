const {ccclass, property} = cc._decorator;

@ccclass
export default class Opendata extends cc.Component {

    public static instance: Opendata = null!;

    private _openContext: any; // 子域对象

    getOpencontext(){
        return this._openContext;
    }
    protected onLoad(): void {
        Opendata.instance = this;
    }
    start() {
        if(cc.sys.platform === cc.sys.WECHAT_GAME) { //判断微信环境
            // @ts-ignore
            this._openContext = wx.getOpenDataContext(); // 调用微信接口获取子域句柄，使用时需要检查
        }
    }
    onDestroy(): void {
        this._openContext=null;
    }

    protected onDisable(): void {
        this._openContext=null;
    }
}
