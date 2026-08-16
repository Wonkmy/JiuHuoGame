// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class RankCell extends cc.Component {
    init(id:number,playerdata:any){
        this.node.getChildByName("num").getComponent(cc.Label).string = String(id);
        this.node.getChildByName("nickname").getComponent(cc.Label).string = playerdata.nickName;
        this.node.getChildByName("totalmoney").getComponent(cc.Label).string = String(playerdata.totalmoney);
    }
}
