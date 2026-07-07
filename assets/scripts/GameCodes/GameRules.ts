// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameMain from "../GameMain";
import { ConstValue } from "../Global/ConstValue";
import { AppraiseKind, ExpertDef, ItemDef, ItemInstance,TargetInfo, ROUND_TARGETS_INFO, RoundTaskInfo, ItemCategory, CATEGORY_NAME } from "./Datas/GameData";

export default class GameContext{
    UID:number = 0;
    CurLevel:number=0;
    totalPoints:number = 0;

    curSelected:ItemInstance = null!;
    /**
     * 玩家拥有的鉴定专家列表
     */
    ownedExperts: ExpertDef[] = [];
    /**
     * 玩家背包
     */
    inventoryItemInstance:ItemInstance[]=[]
    targetInfo:TargetInfo = null!;// 目标收益
    roundTask:RoundTaskInfo = null!;// 本轮委托/挑战
    taskRewardClaimed:boolean = false;

    getUid():string{
        return `old_${this.UID++}`;
    }

    resetGame(){
        this.CurLevel = 0;
        this.totalPoints = ConstValue.TotalPoints;
        this.ownedExperts = [];
        this.inventoryItemInstance = [];
        this.curSelected = null!;
        this.targetInfo = null!;
        this.roundTask = null!;
        this.taskRewardClaimed = false;
    }

    startRound(){
        this.inventoryItemInstance = [];
        this.curSelected = null!;
        this.targetInfo = ROUND_TARGETS_INFO[this.CurLevel]// 获得当前的目标收益
        this.roundTask = createRoundTask(this.CurLevel);
        this.taskRewardClaimed = false;
    };
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

export function getRoundTaskText():string{
    const task = GameMain.instance.mainRuntime.ctx.roundTask;
    if(!task){
        return "";
    }
    return task.title + "\n" + task.desc + "\n进度:" + task.progress + "/" + task.needCount + "  奖励:" + task.reward;
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

export function createMarketItems(nextUid: () => string,round: number = 1,excludeIds: string[] = []): ItemInstance[] {
    const defs = pickMarketDefsByRound(round, 12,excludeIds);
    return defs.map(def => createItem(def, nextUid()));
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
    };
}
export function getAppraiseCost(kind: AppraiseKind): number {
    return kind === 'wipe' ? 1 : kind === 'open' ? 2 : 3;
}
export function rollAppraiseEvent(item: ItemInstance, kind: AppraiseKind): string {
    if (kind === 'repair') {
        return item.fake ? '修完仍有破绽' : '修复见光，品相回升';
    }

    const roll = Math.random();
    if (item.fake && item.reveal >= 3) {
        item.trueValue = Math.max(20, Math.round(item.trueValue * 0.55));
        return '后仿露馅';
    }

    // 鉴定时额外给一次简单涨跌，制造“再看一眼”的刺激感。
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
