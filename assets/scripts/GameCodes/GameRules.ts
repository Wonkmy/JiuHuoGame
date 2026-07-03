// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameMain from "../GameMain";
import { ConstValue } from "../Global/ConstValue";
import { AppraiseKind, ExpertDef, ITEM_DEFS, ItemDef, ItemInstance,TargetInfo } from "./Datas/GameData";

export default class GameContext{
    UID:number = 0;
    CurLevel:number=0;
    totalPoints:number = 0;

    curSelected:ItemInstance = null!;
    ownedExperts: ExpertDef[] = [];
    targetInfo:TargetInfo = null!;// 目标收益

    getUid():string{
        return `old_${this.UID++}`;
    }
}

export function createMarketItems(nextUid: () => string): ItemInstance[] {
    const pool = [...ITEM_DEFS].sort(() => Math.random() - 0.5).slice(0, 12);
    return pool.map(def => createItem(def, nextUid()));
}

export function createItem(def: ItemDef, uid: string): ItemInstance {
    const quality = 0.72 + Math.random() * 1.18 + def.rarity * 0.08;
    const fake = Math.random() < Math.max(0.06, 0.18 - def.rarity * 0.02);
    const trueValue = Math.max(35, Math.round(def.baseValue * quality * (fake ? 0.28 : 1)));
    const buyRate = 0.35 + Math.random() * 0.34;
    const buyPrice = Math.max(25, Math.round(def.baseValue * buyRate));
    return {
        ...def,
        uid,
        buyPrice,
        trueValue,
        estimate: Math.max(20, Math.round(trueValue * 0.45)),
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
        item.trueValue = Math.max(20, Math.round(item.trueValue * 0.82));
        return '后仿露馅';
    }

    // 鉴定时额外给一次简单涨跌，制造“再看一眼”的刺激感。
    if (kind === 'open' && roll < 0.22) {
        item.trueValue = Math.round(item.trueValue * 1.28);
        return '拆出老编号';
    }
    if (kind === 'wipe' && roll < 0.18) {
        item.trueValue = Math.round(item.trueValue * 1.16);
        return '擦出款识';
    }
    if (roll > 0.82) {
        item.trueValue = Math.max(20, Math.round(item.trueValue * 0.84));
        return '暗伤露出来了';
    }
    return kind === 'open' ? '细节更清楚了' : '灰尘擦开了';
}
export function getItemSellValue(item: ItemInstance, ownedExperts: ExpertDef[], finalSell: boolean): number {
    let value = item.trueValue;
    if (!finalSell) {
        const revealRates = [0.48, 0.68, 0.86, 1];
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
        const item:ItemInstance = GameMain.instance.mainRuntime.ctx.curSelected;
        if (!item) return "";
        const cost = getAppraiseCost(kind);
        if (GameMain.instance.mainRuntime.ctx.totalPoints < cost) return "";
        const oldEstimate = item.estimate;
        GameMain.instance.mainRuntime.ctx.totalPoints -= cost;

        if (kind === 'repair') {
            if (!item.repaired) {
                item.repaired = true;
                // 修复只做简单加值，避免把业务逻辑写成复杂算法。
                item.trueValue = Math.round(item.trueValue * (item.fake ? 0.95 : 1.22));
            }
        } else {
            item.reveal = Math.min(3, item.reveal + (kind === 'open' ? 2 : 1));// 揭示度，范围 0-3，越高估值越接近真实价值
        }

        const eventText = rollAppraiseEvent(item, kind);// 鉴赏结果
        item.estimate = getItemSellValue(item, GameMain.instance.mainRuntime.ctx.ownedExperts, false);// 当前估值，展示给玩家看的价格，会随揭示度和鉴定事件变化
        const diff = item.estimate - oldEstimate;
        return {
            eventText,diff
        }
    }
