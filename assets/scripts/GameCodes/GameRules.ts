// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameMain from "../GameMain";
import { ConstValue } from "../Global/ConstValue";
import EntrancePanel from "../Panels/EntrancePanel";
import MainPanel from "../Panels/MainPanel";
import { UIManager } from "../UIManager/UIManager";
import { AppraiseKind, ExpertDef, ItemDef, ItemInstance,TargetInfo, ROUND_TARGETS_INFO, RoundTaskInfo, ItemCategory, CATEGORY_NAME } from "./Datas/GameData";

export default class GameContext{
    UID:number = 0;
    CurLevel:number=0;
    totalPoints:number = 0;
    totalMoney:number = 0;// 总收入
    nickName:string = "";// 昵称
    userid:number = -1;// 玩家id
    curSelected:ItemInstance = null!;
    curDisplaySelected:ItemInstance = null!;// 当前选中的要展示的物品
    curSelectedTableIndex:number = -1;// 当前选中的桌子id
    curCangpingguanIndex:number = 0;// 当前展馆编号
    /**
     * 玩家拥有的鉴定专家列表
     */
    ownedExperts: ExpertDef[] = [];
    /**
     * 玩家背包
     */
    inventoryItemInstance:ItemInstance[]=[]

    /**
     * 玩家已解锁的桌子的索引
     */
    unLockedTableIndex:number[]=[]

    tableInfoDataDict:TableInfoData[]=[];// 保存的桌子信息列表。记录当前桌子id以及放置展览的物品数据信息

    targetInfo:TargetInfo = null!;// 目标收益
    roundTask:RoundTaskInfo = null!;// 本轮委托/挑战
    taskRewardClaimed:boolean = false;
    roundResultClaimed:boolean = false;
    hiddenMarketNextRound:boolean = false;
    hiddenMarketActive:boolean = false;
    budgetPenaltyNextRound:number = 0;
    activityLevel:number = 0;// 活跃度，每进行一次“出手”就+1
    activityLimit:number = 5;// 如果次数等于5的倍数，则领取一次奖励

    currentLocation:string = "";// 当前选择的地点

    getUid():string{
        return `old_${this.UID++}`;
    }
    addActivityLevel(v:number){
        this.activityLevel+=v;
        cc.sys.localStorage.setItem("activityLevel",this.activityLevel);
    }
    // /api/player/:id/money
    addMoney(v:number){
        // 本地记录一次金币
        this.totalMoney += v;
        cc.sys.localStorage.setItem("game_money",this.totalMoney);
        GameMain.instance.reportRankTotal(this.totalMoney);
        // 往服务器上传一份金币
        let u = cc.sys.localStorage.getItem("userid");
        if(u == '' || u == null || u == 'undefined' || u === undefined){

        } else {
            let uid = parseInt(u)
            const postData = {
                totalmoney: this.totalMoney
            };

            if (cc.sys.platform === cc.sys.WECHAT_GAME) {
                wx.request({
                    url: 'https://jianbao.dxstudio.site/api/player/' + uid + "/money",
                    data: postData,
                    header: { 'content-type': 'application/json' },
                    method: 'POST',
                    dataType: 'json',
                    responseType: 'text',
                    success: (result) => {
                        console.log('更新金币成功!:', result);
                    },
                    fail: () => {
                        console.error('POST 更新金币失败:', error);
                    },
                    complete: () => { }
                });
            } else {
                fetch('https://jianbao.dxstudio.site/api/player/' + uid + "/money", {
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
                        console.log('更新金币成功!:', data);
                    })
                    .catch((error) => {
                        console.error('POST 请求失败:', error);
                    });
            }
        }
    }

    resetGame(){
        this.CurLevel = 0;
        this.totalPoints = ConstValue.TotalPoints;
        this.ownedExperts = [];// 顾问团列表重置
        this.inventoryItemInstance = [];// 背包重置
        this.unLockedTableIndex = [];// 已解锁的展厅桌子索引重置
        this.tableInfoDataDict = [];// 保存的桌子信息列表重置
        this.curSelected = null!;
        this.targetInfo = null!;
        this.roundTask = null!;
        this.taskRewardClaimed = false;
        this.roundResultClaimed = false;
        this.hiddenMarketNextRound = false;
        this.hiddenMarketActive = false;
        this.budgetPenaltyNextRound = 0;
        this.curSelectedTableIndex = -1;
        this.curCangpingguanIndex = 0;
        this.activityLevel = 0;
    }

    startRound(){
        this.curSelected = null!;
        this.totalPoints = ConstValue.TotalPoints;
        this.hiddenMarketActive = this.hiddenMarketNextRound;
        this.hiddenMarketNextRound = false;
        if(this.budgetPenaltyNextRound > 0){
            // 失败惩罚延迟到下一轮开始扣除，避免结算界面数值反复变化。
            // this.totalMoney = Math.max(0,this.totalMoney - this.budgetPenaltyNextRound);
            // cc.sys.localStorage.setItem("game_money",this.totalMoney);
            this.addMoney(-this.budgetPenaltyNextRound)
            this.budgetPenaltyNextRound = 0;
        }
        setTimeout(() => {
            let u = cc.sys.localStorage.getItem("userid");
            if(u == '' || u == null || u == 'undefined' || u === undefined){
                console.log("本地没有数据");
                this.postProxy((uid)=>{
                    this.mylogin(uid)
                })
            }else{
                this.mylogin(u)
            }


            this.targetInfo = ROUND_TARGETS_INFO[this.CurLevel]// 获得当前的目标收益
            this.roundTask = createRoundTask(this.CurLevel);
            this.taskRewardClaimed = false;
            this.roundResultClaimed = false;
            this.curSelectedTableIndex = -1;
            let m = cc.sys.localStorage.getItem("bag_data");
            if(m == '' || m == null || m == 'undefined' || m === undefined){
                this.inventoryItemInstance = [];
            }else{
                this.inventoryItemInstance = JSON.parse(m);
            }

            let tableInfoData = cc.sys.localStorage.getItem("tableInfoDataDict");
            if(tableInfoData == '' || tableInfoData == null || tableInfoData == 'undefined' || tableInfoData === undefined){
                this.tableInfoDataDict = [];
            }else{
                this.tableInfoDataDict = JSON.parse(tableInfoData);
            }

            let unlocked_table_list = cc.sys.localStorage.getItem("unlocked_table_list");
            if(unlocked_table_list == '' || unlocked_table_list == null || unlocked_table_list == 'undefined' || unlocked_table_list === undefined){
                this.unLockedTableIndex = [];
            }else{
                this.unLockedTableIndex = JSON.parse(unlocked_table_list);
            }

            let locationData = cc.sys.localStorage.getItem("location");
            if(locationData == '' || locationData == null || locationData == 'undefined' || locationData === undefined){
                this.currentLocation = "oldStreet";
                cc.sys.localStorage.setItem("location", "oldStreet");
            }else{
                this.currentLocation = locationData;
            }

            //
            let activityLevelValue = cc.sys.localStorage.getItem("activityLevel");
            if(activityLevelValue == '' || activityLevelValue == null || activityLevelValue == 'undefined' || activityLevelValue === undefined){
                this.activityLevel = 0;
            }else{
                this.activityLevel = activityLevelValue;
            }
        }, 200);
    };

    mylogin(u){
        let uid = parseInt(u)
            if (cc.sys.platform === cc.sys.WECHAT_GAME) {
                wx.request({
                    url: 'https://jianbao.dxstudio.site/api/player/'+uid,
                    data: {},
                    header: {'content-type':'application/json'},
                    method: 'GET',
                    dataType: 'json',
                    responseType: 'text',
                    success: (result) => {
                        console.log('GET 请求成功:parseInt', result);
                        let tm = parseInt(result.data.data.totalmoney);
                        this.totalMoney = tm;
                        this.nickName = result.data.data.nickName;
                        this.userid = uid;
                        cc.sys.localStorage.setItem("game_money", this.totalMoney);
                        GameMain.instance.reportRankTotal(this.totalMoney);
                        if (UIManager.getInstance().getUI(EntrancePanel)) {
                            var e = UIManager.getInstance().getUI(EntrancePanel)
                            if (e != null) {
                                EntrancePanel.instance.refreshNickNameAndMoney();
                            }
                        }
                    },
                    fail: (errMsg)=>{
                        console.error('request GET 请求失败',errMsg);
                    },
                    complete: ()=>{}
                });
            }else{
                fetch('https://jianbao.dxstudio.site/api/player/'+uid, {
                    method: 'GET',
                })
                .then((response: Response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    // 根据返回数据类型选择解析方式
                    return response.json(); // 或 response.text() 获取纯文本
                })
                .then((data) => {
                    console.log('GET 请求成功:parseInt', data);
                    let tm = parseInt(data.data.totalmoney);
                    this.totalMoney = tm;
                    this.nickName = data.data.nickName;
                    this.userid = uid;
                    cc.sys.localStorage.setItem("game_money",this.totalMoney);
                    GameMain.instance.reportRankTotal(this.totalMoney);
                    if(UIManager.getInstance().getUI(EntrancePanel)){
                        var e = UIManager.getInstance().getUI(EntrancePanel)
                        if(e!=null){
                            EntrancePanel.instance.refreshNickNameAndMoney();
                        }
                    }
                })
                .catch((error) => {
                    console.error('GET 请求失败:', error);
                });
            }
    }

    postProxy(callback:function) {
        const _str = Math.random().toString(16).slice(2,5);
        const postData = {
            nickName: 'player'+ _str,
            totalmoney: 0
        };

        if (cc.sys.platform === cc.sys.WECHAT_GAME){
            wx.request({
                url: 'https://jianbao.dxstudio.site/api/player/create',
                data: postData,
                header: {'content-type':'application/json'},
                method: 'POST',
                dataType: 'json',
                responseType: 'text',
                success: (result)=>{
                    console.log('request POST 请求成功啦',result);
                    cc.sys.localStorage.setItem("userid", result.data.data.id);
                    this.nickName = 'player'+ _str
                    this.userid = result.data.data.id;
                    if(callback){
                        callback(this.userid)
                    }
                },
                fail: (errMsg)=>{
                    console.error('request POST 请求失败',errMsg);
                },
                complete: ()=>{}
            });
        }else{
            fetch('https://jianbao.dxstudio.site/api/player/create', {
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
                    console.log('POST 请求成功:', data);
                    cc.sys.localStorage.setItem("userid", data.data.id);
                    this.nickName = 'player'+ _str
                    this.userid = data.data.id;
                    if(callback){
                        callback(this.userid)
                    }
                })
                .catch((error) => {
                    console.error('POST 请求失败:', error);
                });
        }

    }
}

export function createRoundTask(round:number):RoundTaskInfo{
    const reward = 150 + Math.min(round,5) * 50;
    const categoryTasks:{category:ItemCategory,title:string}[] = [
        {category:'porcelain',title:'老客收瓷器'},
        {category:'painting',title:'藏家找书画'},
        {category:'cameraWatch',title:'玩家收老相机'},
        {category:'folkToy',title:'民俗货有人要'},
        {category:'wood',title:'木器客来访'},
        {category:'bronze',title:'铜器老板点货'},
    ];
    const categoryTask = categoryTasks[Math.floor(Math.random() * categoryTasks.length)];
    const eraTask = Math.random() > 0.5 ? '清末' : '民国';
    const tasks:RoundTaskInfo[] = [
        {
            title:categoryTask.title,
            desc:"卖出 1 件" + CATEGORY_NAME[categoryTask.category],
            reward,
            kind:'sellCategory',
            category:categoryTask.category,
            needCount:1,
            progress:0,
        },
        {
            title:"年份收藏",
            desc:"卖出 1 件" + eraTask + "旧物",
            reward,
            kind:'sellEra',
            era:eraTask,
            needCount:1,
            progress:0,
        },
        {
            title:"修复挑战",
            desc:"卖出 1 件修复过的物品",
            reward:reward + 50,
            kind:'repairSell',
            needCount:1,
            progress:0,
        },
        {
            title:"看透再卖",
            desc:"卖出 1 件完全揭示的物品",
            reward:reward + 30,
            kind:'fullRevealSell',
            needCount:1,
            progress:0,
        },
    ];
    return tasks[Math.floor(Math.random() * tasks.length)];
}
export class TableInfoData{
    tableIndex:number = 0;
    itemData:ItemInstance = null!;
}

export function getRoundTaskText():string{
    const task = GameMain.instance.mainRuntime.ctx.roundTask;
    if(!task){
        return "";
    }
    return task.title + "\n" + task.desc + "\n进度:" + task.progress + "/" + task.needCount + "  奖励:" + task.reward + "未获得";
}

export function recordRoundTaskProgress(item:ItemInstance){
    const task = GameMain.instance.mainRuntime.ctx.roundTask;
    if(!task || task.progress >= task.needCount){
        return;
    }
    let isMatched = false;
    if(task.kind === 'sellCategory' && task.category === item.category)isMatched = true;
    if(task.kind === 'sellEra' && task.era === item.era)isMatched = true;
    if(task.kind === 'repairSell' && item.repaired)isMatched = true;
    if(task.kind === 'fullRevealSell' && item.reveal >= 3)isMatched = true;

    if(isMatched){
        task.progress = Math.min(task.needCount,task.progress + 1);
    }
}

export function isRoundTaskFinished():boolean{
    const task = GameMain.instance.mainRuntime.ctx.roundTask;
    return !!task && task.progress >= task.needCount;
}

export function getRoundTaskReward():number{
    const task = GameMain.instance.mainRuntime.ctx.roundTask;
    return task ? task.reward : 0;
}

export function pickExperts(count: number, ownedExperts: ExpertDef[]): ExpertDef[] {
    const owned = new Set(ownedExperts.map(expert => expert.id));
    return GameMain.instance.EXPERT_DEFS
        .filter(expert => !owned.has(expert.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, count);
}


export function postMaiDian(_scene: string) {
    if(CC_DEBUG){
        console.log("开发模式，不走埋点");
        return;
    }
    const postData = {
        scene: _scene
    };
    let u = cc.sys.localStorage.getItem("userid");
    if (u == '' || u == null || u == 'undefined' || u === undefined) {

    } else {
        let uid = parseInt(u);

        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.request({
                url: 'https://jianbao.dxstudio.site/api/player/' + uid + "/track",
                data: postData,
                header: {'content-type':'application/json'},
                method: 'POST',
                dataType: 'json',
                responseType: 'text',
                success: (result)=>{
                    console.log('POST 请求成功:', result);
                },
                fail: (errMsg)=>{
                    console.error('POST MaiDian 请求失败:', errMsg);
                },
                complete: ()=>{}
            });
        }
        else {
            fetch('https://jianbao.dxstudio.site/api/player/' + uid + "/track", {
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
                    console.log('POST 请求成功:', data);
                })
                .catch((error) => {
                    console.error('POST 请求失败:', error);
                });
        }
    }
}
// 通过查看rarity的值是否超过某个阈值，然后从库中直接给一个对应的ItemInstance
export function createItemByRarityValue(rarityValue:number,excludeIds:string[] = []):ItemInstance{
    const targetRarity = getTargetRarityByValue(rarityValue);
    const excluded = new Set(excludeIds);

    let pool = GameMain.instance.ITEM_DEFS.filter(item => {
        return !excluded.has(item.id) && item.rarity === targetRarity;
    });

    if(pool.length <= 0){
        // 没有完全匹配的稀有度时，向下找一档，避免小游戏奖励为空。
        pool = GameMain.instance.ITEM_DEFS.filter(item => {
            return !excluded.has(item.id) && item.rarity <= targetRarity;
        });
    }

    if(pool.length <= 0){
        pool = GameMain.instance.ITEM_DEFS.filter(item => !excluded.has(item.id));
    }

    const def = pool[Math.floor(Math.random() * pool.length)];
    return createItem(def,GameMain.instance.mainRuntime.ctx.getUid());
}

function getTargetRarityByValue(rarityValue:number):number{
    const value = Math.max(1,Math.floor(Number(rarityValue) || 1));

    // 直接传 1-5 时，按物品配置里的 rarity 使用。
    if(value <= 5){
        return value;
    }

    // 传入 0-100 这类小游戏评分时，按阈值换算成物品稀有度。
    if(value >= 90)return 5;
    if(value >= 75)return 4;
    if(value >= 55)return 3;
    if(value >= 30)return 2;
    return 1;
}

export function createMarketItems(nextUid: () => string,round: number = 1,excludeIds: string[] = []): ItemInstance[] {
    const defs = pickMarketDefsByRound(round, 12,excludeIds);
    return defs.map(def => createItem(def, nextUid()));
}

export function createMarketItemsByLocation(location:string,nextUid:() => string,excludeIds:string[] = []):ItemInstance[]{
    const defs = pickMarketDefsByLocation(location,8,4,excludeIds);
    return defs.map(def => createItem(def,nextUid()));
}

function pickMarketDefsByLocation(location:string,locationCount:number,commonCount:number,excludeIds:string[] = []):ItemDef[]{
    const excluded = new Set(excludeIds);
    const selected = new Set<string>();
    const categories = getLocationCategories(location);
    const allDefs = GameMain.instance.ITEM_DEFS.filter(item => !excluded.has(item.id));
    const locationPool = allDefs.filter(item => categories.indexOf(item.category) >= 0);
    const result:ItemDef[] = [];

    // 先抽地点特色货，让玩家能明显感知“这个摊位货源不一样”。
    result.push(...pickRandomDefs(locationPool,locationCount,selected));
    result.push(...pickRandomDefs(allDefs,commonCount,selected));

    // 极端情况下某些池子不够，继续从通用库补满 12 个。
    if(result.length < locationCount + commonCount){
        result.push(...pickRandomDefs(allDefs,locationCount + commonCount - result.length,selected));
    }

    return result;
}

export function getLocationCategoriesName(location:string){
    if(location === "海边旧市" || location === "seaside"){
        return "老相机/手表类"+"铜器和杂项类"+"民俗玩具类";
    }else
    if(location === "旧宅门口" || location === "oldHouse"){
        return "瓷器类"+"木器类"+"旧书画";
    }else
    if(location === "厂区仓摊" || location === "factory"){
        return "铜器和杂项类"+"老相机/手表类"+"木器类";
    }else
    if(location === "老街杂摊" || location === "oldStreet"){
        return "比较齐全的";
    }else{
        return "";
    }
}

function getLocationCategories(location:string):ItemCategory[]{
    if(location === "海边旧市" || location === "seaside"){
        return ["cameraWatch","bronze","folkToy"];
    }
    if(location === "旧宅门口" || location === "oldHouse"){
        return ["porcelain","wood","painting"];
    }
    if(location === "厂区仓摊" || location === "factory"){
        return ["bronze","cameraWatch","wood"];
    }
    if(location === "老街杂摊" || location === "oldStreet"){
        return ["porcelain","painting","cameraWatch","folkToy","wood","bronze"];
    }
}

function pickRandomDefs(pool:ItemDef[],count:number,selected:Set<string>):ItemDef[]{
    const candidates = pool.filter(item => !selected.has(item.id)).sort(() => Math.random() - 0.5);
    const result = candidates.slice(0,count);
    result.forEach(item => selected.add(item.id));
    return result;
}

function pickMarketDefsByRound(round: number, count: number, excludeIds: string[] = []): ItemDef[] {
    const excluded = new Set(excludeIds);

    const low = GameMain.instance.ITEM_DEFS.filter(i => !excluded.has(i.id) &&i.baseValue <= 180);
    const midLow = GameMain.instance.ITEM_DEFS.filter(i => !excluded.has(i.id) &&i.baseValue > 180 && i.baseValue <= 300);
    const mid = GameMain.instance.ITEM_DEFS.filter(i => !excluded.has(i.id) &&i.baseValue > 300 && i.baseValue <= 450);
    const high = GameMain.instance.ITEM_DEFS.filter(i => !excluded.has(i.id) &&i.baseValue > 450 && i.baseValue <= 620);
    const rare = GameMain.instance.ITEM_DEFS.filter(i => !excluded.has(i.id) &&i.baseValue > 620);

    const weightsByRound = [
        [35, 35, 20, 8, 2],
        [25, 35, 25, 12, 3],
        [18, 30, 32, 15, 5],
        [10, 24, 34, 24, 8],
        [8, 18, 32, 28, 14],
        [5, 12, 28, 36, 19],
        [3, 8, 22, 40, 27],
    ];

    const weights = weightsByRound[Math.min(round - 1, weightsByRound.length - 1)];
    const pools = [low, midLow, mid, high, rare];
    const result: ItemDef[] = [];

    while (result.length < count) {
        const pool = pickPoolByWeight(pools, weights);
        const item = pool[Math.floor(Math.random() * pool.length)];

        if (item && !result.includes(item)) {
            result.push(item);
        }
    }

    return result;
}

function pickPoolByWeight<T>(pools: T[][], weights: number[]): T[] {
    const valid = pools.map((pool, index) => ({ pool, weight: weights[index] || 0 }))
        .filter(item => item.pool.length > 0 && item.weight > 0);

    if (valid.length === 0) {
        return pools.find(pool => pool.length > 0) || [];
    }

    const total = valid.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * total;

    for (const item of valid) {
        roll -= item.weight;

        if (roll <= 0) {
            return item.pool;
        }
    }

    return valid[valid.length - 1].pool;
}

export function createItem(def: ItemDef, uid: string): ItemInstance {
    const quality = 0.72 + Math.random() * 1.18 + def.rarity * 0.08;
    const fake = Math.random() < Math.max(0.1, 0.24 - def.rarity * 0.025);
    const trueValue = Math.max(35, Math.round(def.baseValue * quality * (fake ? 0.28 : 1)));
    const buyRate = 0.48 + Math.random() * 0.42;
    const buyPrice = Math.max(25, Math.round(def.baseValue * buyRate));
    return {
        ...def,
        uid,
        buyPrice,
        trueValue,
        estimate: Math.max(20, Math.round(trueValue * 0.38)),
        reveal: 0,
        fake,
        repaired: false,
        sold: false,
        display:false,
        displayCangpingguanIndex:0
    };
}
export function getAppraiseCost(kind: AppraiseKind): number {
    return kind === 'wipe' ? 1 : kind === 'open' ? 2 : 3;
}
export function rollAppraiseEvent(item: ItemInstance, kind: AppraiseKind): string {
    const roll = Math.random();
    if (kind === 'repair') {
        if (!item.fake && roll < 0.12) {
            item.trueValue = Math.round(item.trueValue * 1.45);
            return '修复后品相大涨';
        }
        return item.fake ? '修完仍有破绽' : '修复见光，品相回升';
    }

    if (item.fake && item.reveal >= 3) {
        item.trueValue = Math.max(20, Math.round(item.trueValue * 0.55));
        return '后仿露馅';
    }

    // 鉴定时额外给一次简单涨跌，制造“再看一眼”的刺激感。
    if (kind === 'open' && roll < 0.06) {
        item.trueValue = Math.round(item.trueValue * 2.25);
        return '夹层发现旧票据';
    }
    if (kind === 'wipe' && roll < 0.06) {
        item.trueValue = Math.round(item.trueValue * 1.9);
        return '底款露出';
    }
    if (kind === 'open' && roll < 0.18) {
        item.trueValue = Math.round(item.trueValue * 1.65);
        return '拆出老编号';
    }
    if (kind === 'wipe' && roll < 0.16) {
        item.trueValue = Math.round(item.trueValue * 1.32);
        return '擦出款识';
    }
    if (roll > 0.74) {
        item.trueValue = Math.max(20, Math.round(item.trueValue * 0.68));
        return '暗伤露出来了';
    }
    return kind === 'open' ? '细节更清楚了' : '灰尘擦开了';
}
export function getItemSellValue(item: ItemInstance, ownedExperts: ExpertDef[], finalSell: boolean): number {
    let value = item.trueValue;
    if (!finalSell) {
        const revealRates = [0.4, 0.68, 0.92, 1.08];
        value = Math.round(item.trueValue * revealRates[item.reveal]);
    }

    for (const expert of ownedExperts) {
        if (expert.effect === 'repairBonus' && item.repaired) value *= 1 + expert.value;
        if (expert.effect === 'categoryBonus' && expert.target === item.category) value *= 1 + expert.value;
        if (expert.effect === 'materialBonus' && expert.target === item.material) value *= 1 + expert.value;
        if (expert.effect === 'cheapBonus' && item.buyPrice < item.baseValue * 0.5) value *= 1 + expert.value;
        if (expert.effect === 'revealBonus' && item.reveal >= 3) value *= 1 + expert.value;
        if (expert.effect === 'fakeGuard' && item.fake && finalSell) value = Math.max(value, item.buyPrice);
    }
    return Math.max(10, Math.round(value));
}

export function playAppraiseFeedback(kind: AppraiseKind, eventText: string, diff: number, danger: boolean): void {
        const color = danger || diff < 0 ? new cc.Color(230, 92, 72) : diff > 0 ? new cc.Color(245, 202, 103) : new cc.Color(218, 207, 185);
        const sign = diff > 0 ? '+' : '';
        const action = kind === 'wipe' ? '擦拭' : kind === 'open' ? '拆看' : '修复';
        if (danger || diff < 0) {
            flash(new cc.Color(130, 25, 20, 125), 0.26);
            shakeRoot(12);
            floatText(danger ? '砸了！' : '掉价！', 0, 190, color, 48);
            floatText(`${action}：${eventText}`, 0, 130, color, 32);
            floatText(`估值 ${sign}${diff}`, 0, 78, color, 40);
            return;
        }
        flash(new cc.Color(170, 96, 34, 80), 0.22);
        if (diff > 120) shakeRoot(7);
        if (diff >= 160) floatText('大涨！', 0, 190, new cc.Color(255, 226, 135), 50);
        floatText(`${action}：${eventText}`, 0, 130, color, 32);
        floatText(`估值 ${sign}${diff}`, 0, 78, color, 40);
        burst(0, 96, new cc.Color(238, 190, 92), diff >= 160 ? 26 : kind === 'open' ? 18 : 12);
    }
   export function flash(color:cc.Color, duration: number): void {
        // const node = this.ui.addPanel(0, 0, 720, 1280, color);
        // const opacity = node.addComponent(UIOpacity);
        // opacity.opacity = color.a;
        // tween(opacity)
        //     .to(duration, { opacity: 0 }, { easing: 'quadOut' })
        //     .call(() => node.destroy())
        //     .start();
    }

   export function shakeRoot(strength: number): void {
        // cc.tween(this.root)
        //     .to(0.025, { position: new cc.Vec3(strength, 0, 0) })
        //     .to(0.025, { position: new cc.Vec3(-strength, 0, 0) })
        //     .to(0.025, { position: new cc.Vec3(strength * 0.5, 0, 0) })
        //     .to(0.035, { position: new cc.Vec3(0, 0, 0) })
        //     .start();
    }

   export function  floatText(text: string, x: number, y: number, color: cc.Color, size: number): void {
        // const node = this.ui.addText(text, x, y, size, color, 620);
        // const opacity = node.addComponent(UIOpacity);
        // opacity.opacity = 255;
        // node.setScale(new cc.Vec3(0.88, 0.88, 1));
        // cc.tween(node)
        //     .to(0.16, { scale: new cc.Vec3(1.08, 1.08, 1) }, { easing: 'backOut' })
        //     .to(1.12, { position: new cc.Vec3(x, y + 108, 0), scale: new cc.Vec3(1, 1, 1) }, { easing: 'quadOut' })
        //     .call(() => node.destroy())
        //     .start();
        // cc.tween(opacity)
        //     .delay(0.78)
        //     .to(0.5, { opacity: 0 }, { easing: 'quadOut' })
        //     .start();
    }

   export function  burst(x: number, y: number, color: cc.Color, count: number): void {
        // for (let i = 0; i < count; i++) {
        //     const node = this.ui.addNode('spark', x, y, 18, 18);
        //     const g = node.addComponent(Graphics);
        //     const size = 3 + Math.random() * 4;
        //     g.fillColor = color;
        //     g.circle(0, 0, size);
        //     g.fill();
        //     const opacity = node.addComponent(UIOpacity);
        //     opacity.opacity = 230;
        //     const angle = Math.random() * Math.PI * 2;
        //     const dist = 55 + Math.random() * 70;
        //     const target = new cc.Vec3(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, 0);
        //     cc.tween(node)
        //         .to(0.38 + Math.random() * 0.16, { position: target, scale: new cc.Vec3(0.25, 0.25, 1) }, { easing: 'quadOut' })
        //         .call(() => node.destroy())
        //         .start();
        //     cc.tween(opacity).to(0.42, { opacity: 0 }, { easing: 'quadOut' }).start();
        // }
    }

export function appraise(kind: AppraiseKind) {
    const item: ItemInstance = GameMain.instance.mainRuntime.ctx.curSelected;
    if (!item) return {
        AppraiseResult: {
            eventText: "",
            diff: 0,
        }
    };
    const cost = getAppraiseCost(kind);
    if (GameMain.instance.mainRuntime.ctx.totalPoints < cost) return {
        AppraiseResult: {
            eventText: "",
            diff: 0,
        }
    };
    const oldEstimate = item.estimate;
    GameMain.instance.mainRuntime.ctx.totalPoints -= cost;

    if (kind === 'repair') {
        if (!item.repaired) {
            item.repaired = true;
            // 修复收益和假货惩罚拉开，避免每次操作都只是小幅上涨。
            item.trueValue = Math.round(item.trueValue * (item.fake ? 0.65 : 1.48));
        }
    } else {
        item.reveal = Math.min(3, item.reveal + (kind === 'open' ? 2 : 1));// 揭示度，范围 0-3，越高估值越接近真实价值
    }

    const eventText = rollAppraiseEvent(item, kind);// 鉴赏结果
    item.estimate = getItemSellValue(item, GameMain.instance.mainRuntime.ctx.ownedExperts, false);// 当前估值，展示给玩家看的价格，会随揭示度和鉴定事件变化
    const diff = item.estimate - oldEstimate;
    return {
        AppraiseResult: {
            eventText,
            diff,
        }
    }
}

export interface AppraiseResult {
    eventText: string;
    diff: number;
}
