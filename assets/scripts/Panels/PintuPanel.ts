import { ItemInstance } from "../GameCodes/Datas/GameData";
import { postMaiDian } from "../GameCodes/GameRules";
import GameMain from "../GameMain";
import { BaseUI } from "../UIManager/BaseUI";
import { UIManager } from "../UIManager/UIManager";
import DialogPanel from "./DialogPanel";
const { ccclass, property } = cc._decorator;

@ccclass
export default class PintuPanel extends BaseUI {
    protected static className = "PintuPanel";

    @property({ type: cc.SpriteFrame, tooltip: "完整拼图图片，支持任意宽高，脚本会自动适配到 9 宫格" })
    puzzleSpriteFrame: cc.SpriteFrame = null!;

    @property({ type: [cc.Node], tooltip: "按从左到右、从上到下拖入 9 个拼图格子节点" })
    tileNodes: cc.Node[] = [];

    @property({type:cc.Node})
    closeBtn:cc.Node = null!;

    @property({ type: cc.Label, tooltip: "倒计时文本，可不赋值" })
    timeLabel: cc.Label = null!;

    @property({ type: cc.Label, tooltip: "结果提示文本，可不赋值" })
    resultLabel: cc.Label = null!;

    @property({ tooltip: "限制时间，单位秒" })
    timeLimit: number = 45;

    @property({ tooltip: "是否打开界面后自动开始" })
    autoStart: boolean = true;

    private pieceOrder: number[] = [];
    private selectedIndex: number = -1;
    private leftTime: number = 0;
    private playing: boolean = false;
    private readonly pieceSpriteName: string = "pintu_piece_sprite";

    itemInstance:ItemInstance = null!;

    override onShow(): void {
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            UIManager.getInstance().closeUI(PintuPanel);
        }, this)

        postMaiDian("进入拼图玩法")
    }

    setResultSprite(itenInstance: ItemInstance) {
        if (!itenInstance) {
            console.warn("PintuPanel.setResultSprite: itenInstance is null");
            return;
        }
        this.itemInstance = itenInstance;

        GameMain.instance.bundle.load("arts/items/"+itenInstance.image, cc.SpriteFrame, (err, spriteFrame: cc.SpriteFrame) => {
            if (err) {
                console.error("PintuPanel.setResultSprite: load spriteFrame error:", err);
                return;
            }

            this.puzzleSpriteFrame = spriteFrame;
            if (this.autoStart) {
                this.startGame();
            }
            const source = this.puzzleSpriteFrame;
            const rect = source.getRect();
            this.node.getChildByName("goods").getComponent(cc.Sprite).spriteFrame = spriteFrame;
            this.node.width = rect.width;
            this.node.height = rect.height;
        });
    }

    protected onLoad(): void {
        this.bindTileEvents();
    }

    onDestroy(): void {
        this.unschedule(this.updateTimer);

        for (let i = 0; i < this.tileNodes.length; i++) {
            if (this.tileNodes[i]) {
                this.tileNodes[i].off(cc.Node.EventType.TOUCH_END, this.onClickTile, this);
            }
        }
    }

    /**
     * 外部按钮也可以直接绑定这个方法，用于重新开始一局拼图。
     */
    public startGame() {
        if (!this.checkConfig()) {
            return;
        }

        this.playing = true;
        this.selectedIndex = -1;
        this.leftTime = Math.max(1, Math.floor(this.timeLimit));
        this.pieceOrder = this.createShuffledOrder();

        this.clearTileSelectedState();
        this.refreshAllTiles();
        this.setResultText("");
        this.refreshTimeLabel();

        this.unschedule(this.updateTimer);
        this.schedule(this.updateTimer, 1);
    }

    private bindTileEvents() {
        for (let i = 0; i < this.tileNodes.length; i++) {
            if (!this.tileNodes[i]) continue;

            this.tileNodes[i].off(cc.Node.EventType.TOUCH_END, this.onClickTile, this);
            this.tileNodes[i].on(cc.Node.EventType.TOUCH_END, this.onClickTile, this);
        }
    }

    private checkConfig(): boolean {
        if (!this.puzzleSpriteFrame) {
            console.warn("PintuPanel 缺少 puzzleSpriteFrame");
            return false;
        }

        if (!this.tileNodes || this.tileNodes.length < 9) {
            console.warn("PintuPanel 至少需要拖拽 9 个 tileNodes");
            return false;
        }

        if (this.tileNodes[0].width <= 0 || this.tileNodes[0].height <= 0) {
            console.warn("PintuPanel 的 tileNode 需要设置宽高");
            return false;
        }

        return true;
    }

    private createShuffledOrder(): number[] {
        const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8];

        // 简单打乱，避免开局就是正确答案。
        do {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        } while (this.isSolved(arr));

        return arr;
    }

    private createPieces() {
        const source = this.puzzleSpriteFrame;
        const rect = source.getRect();
        const tileW = this.tileNodes[0].width;
        const tileH = this.tileNodes[0].height;
        const boardW = tileW * 3;
        const boardH = tileH * 3;

        // 旧物图宽高不统一，这里按完整图片等比放进拼图区域，不拉伸、不要求资源是正方形。
        const scale = Math.min(boardW / rect.width, boardH / rect.height);
        const showW = rect.width * scale;
        const showH = rect.height * scale;

        for (let i = 0; i < 9; i++) {
            const node = this.tileNodes[i];
            if (!node) continue;

            node.setContentSize(tileW, tileH);

            let mask = node.getComponent(cc.Mask);
            if (!mask) {
                mask = node.addComponent(cc.Mask);
            }
            mask.type = cc.Mask.Type.RECT;

            const pieceIndex = this.pieceOrder[i];
            const col = pieceIndex % 3;
            const row = Math.floor(pieceIndex / 3);

            let pieceNode = node.getChildByName(this.pieceSpriteName);
            if (!pieceNode) {
                pieceNode = new cc.Node(this.pieceSpriteName);
                node.addChild(pieceNode);
            }

            let sprite = pieceNode.getComponent(cc.Sprite);
            if (!sprite) {
                sprite = pieceNode.addComponent(cc.Sprite);
            }

            sprite.spriteFrame = source;
            sprite.trim = false;
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            pieceNode.setContentSize(showW, showH);

            // pieceIndex 对应原图正确位置；通过移动完整图，让当前格子只显示其中一块。
            pieceNode.x = (1 - col) * tileW;
            pieceNode.y = (row - 1) * tileH;
            node.opacity = 255;
            node.scale = 1;
        }
    }

    private refreshAllTiles() {
        this.createPieces();
    }

    private onClickTile(event: cc.Event.EventTouch) {
        if (!this.playing) return;

        const node = event.currentTarget as cc.Node;
        const index = this.tileNodes.indexOf(node);
        if (index < 0) return;

        if (this.selectedIndex < 0) {
            this.selectedIndex = index;
            this.setTileSelected(index, true);
            return;
        }

        if (this.selectedIndex === index) {
            this.setTileSelected(index, false);
            this.selectedIndex = -1;
            return;
        }

        this.swapTile(this.selectedIndex, index);
        this.setTileSelected(this.selectedIndex, false);
        this.selectedIndex = -1;
        this.refreshAllTiles();

        if (this.isSolved(this.pieceOrder)) {
            this.gameSuccess();
        }
    }

    private swapTile(a: number, b: number) {
        const temp = this.pieceOrder[a];
        this.pieceOrder[a] = this.pieceOrder[b];
        this.pieceOrder[b] = temp;
    }

    private setTileSelected(index: number, selected: boolean) {
        const node = this.tileNodes[index];
        if (!node) return;

        node.stopAllActions();
        node.runAction(cc.scaleTo(0.08, selected ? 1.08 : 1));
        node.opacity = selected ? 210 : 255;
    }

    private clearTileSelectedState() {
        for (let i = 0; i < this.tileNodes.length; i++) {
            const node = this.tileNodes[i];
            if (!node) continue;

            node.stopAllActions();
            node.scale = 1;
            node.opacity = 255;
        }
    }

    private isSolved(order: number[]): boolean {
        for (let i = 0; i < 9; i++) {
            if (order[i] !== i) {
                return false;
            }
        }

        return true;
    }

    private updateTimer = () => {
        if (!this.playing) return;

        this.leftTime--;
        this.refreshTimeLabel();

        if (this.leftTime <= 0) {
            this.gameFail();
        }
    };

    private gameSuccess() {
        this.playing = false;
        this.unschedule(this.updateTimer);
        this.clearTileSelectedState();
        this.setResultText("复原成功");

        UIManager.getInstance().openUI(DialogPanel, 2, (ui: DialogPanel) => {
            ui.onShow();
            ui.setContent(`恭喜你获得${this.itemInstance.name}`, () => {
                postMaiDian("拼图玩法成功")
                this.itemInstance.isReward = true;
                GameMain.instance.mainRuntime.ctx.inventoryItemInstance.push(this.itemInstance);
                cc.sys.localStorage.setItem("bag_data",JSON.stringify(GameMain.instance.mainRuntime.ctx.inventoryItemInstance));
                UIManager.getInstance().closeUI(DialogPanel);
                UIManager.getInstance().closeUI(PintuPanel);
            },"确认", false)
        })
    }

    private gameFail() {
        this.playing = false;
        this.unschedule(this.updateTimer);
        this.clearTileSelectedState();
        this.setResultText("复原失败");

        UIManager.getInstance().openUI(DialogPanel, 2, (ui: DialogPanel) => {
            ui.onShow();
            ui.setContent(`复原失败`, () => {
                UIManager.getInstance().closeUI(DialogPanel);
                UIManager.getInstance().closeUI(PintuPanel);
            }, "确认",false)
        })
    }

    private refreshTimeLabel() {
        if (this.timeLabel) {
            this.timeLabel.string = String(this.leftTime) + "秒";
        }
    }

    private setResultText(text: string) {
        if (this.resultLabel) {
            this.resultLabel.string = text;
        }
    }
}
