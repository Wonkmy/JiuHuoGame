// 物品大类，用于展示分类、专家加成、组合判定
export type ItemCategory =
    | 'porcelain' // 瓷器
    | 'painting' // 旧书画
    | 'cameraWatch' // 老相机、手表类
    | 'folkToy' // 民俗玩具
    | 'wood' // 木器家具
    | 'bronze'; // 铜器杂项

// 物品年代，用于展示信息和“同年代 / 连续年代”组合判定
export type ItemEra = '清末' | '民国' | '建国初' | '七八十年代' | '九十年代' | '当代旧物';

// 物品材质，用于展示信息、专家加成、“同材质”组合判定
export type ItemMaterial = '瓷' | '纸' | '金' | '木' | '布' | '杂';
export type AppraiseKind = 'wipe' | 'open' | 'repair';
// 物品基础配置，写死在配置表里，不会在单局中变化
export interface ItemDef {
    id: string; // 物品配置 ID，用于区分物品类型
    name: string; // 物品显示名称
    category: ItemCategory; // 物品大类
    era: ItemEra; // 物品年代
    material: ItemMaterial; // 物品材质
    baseValue: number; // 基础价值，用来随机生成真实价值和买入价
    rarity: number; // 稀有度，影响真实价值、假货概率、孤品爆价判定
    image: string; // 对应图片资源名
}

// 单局中实际生成出来的物品，会在游戏过程中变化
export interface ItemInstance extends ItemDef {
    uid: string; // 本局内唯一 ID，用于区分同一种配置生成出的不同物品
    buyPrice: number; // 买入价格，玩家购买该物品实际花费的钱
    trueValue: number; // 隐藏真实价值，玩家一开始不知道，鉴定和修复会改变它
    estimate: number; // 当前估值，展示给玩家看的价格，会随揭示度和鉴定事件变化
    reveal: number; // 揭示度，范围 0-3，越高估值越接近真实价值
    fake: boolean; // 是否是假货 / 后仿
    repaired: boolean; // 是否已经修复过，避免重复修复
    sold: boolean; // 是否已经卖出或上拍成交
}

// 专家效果类型
export type ExpertEffect =
    | 'repairBonus' // 修复过的物品卖价加成
    | 'fakeGuard' // 假货卖出时至少保本
    | 'categoryBonus' // 指定物品大类卖价加成
    | 'materialBonus' // 指定材质卖价加成
    | 'cheapBonus' // 低价买入物品卖价加成
    | 'comboBonus' // 上拍组合倍率加成
    | 'revealBonus' // 完全揭示物品卖价加成
    | 'auctionBonus'; // 上拍总价加成

// 专家牌配置
export interface ExpertDef {
    id: string; // 专家配置 ID
    name: string; // 专家姓名
    title: string; // 专家称号，卡牌主标题
    desc: string; // 专家效果描述，展示给玩家看
    effect: ExpertEffect; // 专家效果类型
    value: number; // 专家效果数值，比如 0.18 表示 +18%
    target?: ItemCategory | ItemMaterial; // 部分专家生效目标，比如瓷器、金属、纸等
    image: string; // 对应专家头像 / 卡面图片资源名
}

// 上拍组合结果
export interface ComboResult {
    names: string[]; // 触发的组合名称列表
    multiplier: number; // 上拍倍率
    bonus: number; // 固定加值
}

export interface TargetInfo{
    marketName:string
    target:number
}

// 每一轮目标收入
export const ROUND_TARGETS_INFO:TargetInfo[] = [
    {marketName:"捡漏1摊位", target:500},
    {marketName:"捡漏2摊位", target:800},
    {marketName:"捡漏3摊位", target:1500},
    {marketName:"捡漏4摊位", target:2500},
    {marketName:"捡漏5摊位", target:5000},
    {marketName:"捡漏6摊位", target:12000},
    {marketName:"捡漏7摊位", target:15000},
    {marketName:"捡漏8摊位", target:20000},
];

// 物品大类中文名，用于 UI 展示
export const CATEGORY_NAME: Record<ItemCategory, string> = {
    porcelain: '瓷器',
    painting: '旧书画',
    cameraWatch: '相机表',
    folkToy: '民俗玩具',
    wood: '木器家具',
    bronze: '铜器杂项',
};

// // 物品配置表
// export const ITEM_DEFS: ItemDef[] = [
//     { id: 'item_01', name: '青花旧碗', category: 'porcelain', era: '民国', material: '瓷', baseValue: 180, rarity: 1, image: 'item_01' },
//     { id: 'item_02', name: '开片瓷罐', category: 'porcelain', era: '清末', material: '瓷', baseValue: 420, rarity: 3, image: 'item_02' },
//     { id: 'item_03', name: '花鸟盖罐', category: 'porcelain', era: '民国', material: '瓷', baseValue: 360, rarity: 2, image: 'item_03' },
//     { id: 'item_04', name: '浅绛彩盘', category: 'porcelain', era: '建国初', material: '瓷', baseValue: 260, rarity: 2, image: 'item_04' },
//     { id: 'item_05', name: '粉彩小瓶', category: 'porcelain', era: '民国', material: '瓷', baseValue: 320, rarity: 2, image: 'item_05' },
//     { id: 'item_06', name: '青花茶叶罐', category: 'porcelain', era: '七八十年代', material: '瓷', baseValue: 210, rarity: 1, image: 'item_06' },
//     { id: 'item_07', name: '老圈椅', category: 'wood', era: '民国', material: '木', baseValue: 520, rarity: 3, image: 'item_07' },
//     { id: 'item_08', name: '榆木小炕桌', category: 'wood', era: '建国初', material: '木', baseValue: 280, rarity: 2, image: 'item_08' },
//     { id: 'item_09', name: '雕花小柜', category: 'wood', era: '民国', material: '木', baseValue: 460, rarity: 3, image: 'item_09' },
//     { id: 'item_10', name: '旧圆鼓凳', category: 'wood', era: '清末', material: '木', baseValue: 380, rarity: 3, image: 'item_10' },
//     { id: 'item_11', name: '三斗柜', category: 'wood', era: '建国初', material: '木', baseValue: 330, rarity: 2, image: 'item_11' },
//     { id: 'item_12', name: '多宝格架', category: 'wood', era: '七八十年代', material: '木', baseValue: 260, rarity: 2, image: 'item_12' },
//     { id: 'item_13', name: '铜香炉', category: 'bronze', era: '民国', material: '金', baseValue: 480, rarity: 4, image: 'item_13' },
//     { id: 'item_14', name: '仿古爵杯', category: 'bronze', era: '当代旧物', material: '金', baseValue: 160, rarity: 1, image: 'item_14' },
//     { id: 'item_15', name: '八卦铜镜', category: 'bronze', era: '民国', material: '金', baseValue: 300, rarity: 2, image: 'item_15' },
//     { id: 'item_16', name: '铜方鼎', category: 'bronze', era: '当代旧物', material: '金', baseValue: 220, rarity: 1, image: 'item_16' },
//     { id: 'item_17', name: '铜花觚', category: 'bronze', era: '民国', material: '金', baseValue: 350, rarity: 3, image: 'item_17' },
//     { id: 'item_18', name: '老铜壶', category: 'bronze', era: '建国初', material: '金', baseValue: 240, rarity: 2, image: 'item_18' },
//     { id: 'item_19', name: '旧画卷', category: 'painting', era: '民国', material: '纸', baseValue: 300, rarity: 3, image: 'item_19' },
//     { id: 'item_20', name: '线装残书', category: 'painting', era: '清末', material: '纸', baseValue: 360, rarity: 4, image: 'item_20' },
//     { id: 'item_21', name: '草木手抄本', category: 'painting', era: '民国', material: '纸', baseValue: 260, rarity: 2, image: 'item_21' },
//     { id: 'item_22', name: '旧砚台', category: 'painting', era: '建国初', material: '杂', baseValue: 240, rarity: 2, image: 'item_22' },
//     { id: 'item_23', name: '瓷笔筒', category: 'painting', era: '七八十年代', material: '瓷', baseValue: 190, rarity: 1, image: 'item_23' },
//     { id: 'item_24', name: '铜笔筒', category: 'painting', era: '民国', material: '金', baseValue: 310, rarity: 3, image: 'item_24' },
//     { id: 'item_25', name: '海鸥旁轴相机', category: 'cameraWatch', era: '七八十年代', material: '金', baseValue: 290, rarity: 2, image: 'item_25' },
//     { id: 'item_26', name: '黑皮单反相机', category: 'cameraWatch', era: '九十年代', material: '金', baseValue: 340, rarity: 2, image: 'item_26' },
//     { id: 'item_27', name: '双反老相机', category: 'cameraWatch', era: '民国', material: '金', baseValue: 760, rarity: 5, image: 'item_27' },
//     { id: 'item_28', name: '钢带机械表', category: 'cameraWatch', era: '九十年代', material: '金', baseValue: 260, rarity: 2, image: 'item_28' },
//     { id: 'item_29', name: '皮带老腕表', category: 'cameraWatch', era: '七八十年代', material: '金', baseValue: 420, rarity: 3, image: 'item_29' },
//     { id: 'item_30', name: '花瓷热水瓶', category: 'cameraWatch', era: '七八十年代', material: '杂', baseValue: 120, rarity: 1, image: 'item_30' },
//     { id: 'item_31', name: '布老虎', category: 'folkToy', era: '民国', material: '布', baseValue: 300, rarity: 3, image: 'item_31' },
//     { id: 'item_32', name: '瓷娃娃摆件', category: 'folkToy', era: '七八十年代', material: '瓷', baseValue: 180, rarity: 1, image: 'item_32' },
//     { id: 'item_33', name: '彩漆陀螺', category: 'folkToy', era: '建国初', material: '木', baseValue: 220, rarity: 2, image: 'item_33' },
//     { id: 'item_34', name: '纸风车', category: 'folkToy', era: '九十年代', material: '纸', baseValue: 90, rarity: 1, image: 'item_34' },
//     { id: 'item_35', name: '旧马灯', category: 'folkToy', era: '民国', material: '金', baseValue: 280, rarity: 2, image: 'item_35' },
//     { id: 'item_36', name: '竹鸟笼', category: 'folkToy', era: '建国初', material: '木', baseValue: 250, rarity: 2, image: 'item_36' },
//     { id: 'item_37', name: '斗彩小碟', category: 'porcelain', era: '清末', material: '瓷', baseValue: 520, rarity: 4, image: 'item_37' },
//     { id: 'item_38', name: '青釉盘口瓶', category: 'porcelain', era: '民国', material: '瓷', baseValue: 340, rarity: 2, image: 'item_38' },
//     { id: 'item_39', name: '白瓷观音像', category: 'porcelain', era: '建国初', material: '瓷', baseValue: 260, rarity: 2, image: 'item_39' },
//     { id: 'item_40', name: '酱釉酒坛', category: 'porcelain', era: '七八十年代', material: '瓷', baseValue: 150, rarity: 1, image: 'item_40' },
//     { id: 'item_41', name: '青花瓷枕', category: 'porcelain', era: '民国', material: '瓷', baseValue: 420, rarity: 3, image: 'item_41' },
//     { id: 'item_42', name: '粉彩茶盏', category: 'porcelain', era: '民国', material: '瓷', baseValue: 280, rarity: 2, image: 'item_42' },
//     { id: 'item_43', name: '哥釉水盂', category: 'porcelain', era: '清末', material: '瓷', baseValue: 560, rarity: 4, image: 'item_43' },
//     { id: 'item_44', name: '龙纹大盘', category: 'porcelain', era: '当代旧物', material: '瓷', baseValue: 210, rarity: 1, image: 'item_44' },
//     { id: 'item_45', name: '影青小盒', category: 'porcelain', era: '清末', material: '瓷', baseValue: 480, rarity: 4, image: 'item_45' },
//     { id: 'item_46', name: '瓷香插', category: 'porcelain', era: '建国初', material: '瓷', baseValue: 180, rarity: 1, image: 'item_46' },
//     { id: 'item_47', name: '陶胎执壶', category: 'porcelain', era: '民国', material: '瓷', baseValue: 300, rarity: 2, image: 'item_47' },
//     { id: 'item_48', name: '山水扇面', category: 'painting', era: '民国', material: '纸', baseValue: 330, rarity: 3, image: 'item_48' },
//     { id: 'item_49', name: '旧账本', category: 'painting', era: '建国初', material: '纸', baseValue: 170, rarity: 1, image: 'item_49' },
//     { id: 'item_50', name: '木版年画', category: 'painting', era: '民国', material: '纸', baseValue: 360, rarity: 3, image: 'item_50' },
//     { id: 'item_51', name: '拓片册页', category: 'painting', era: '清末', material: '纸', baseValue: 520, rarity: 4, image: 'item_51' },
//     { id: 'item_52', name: '药方手札', category: 'painting', era: '民国', material: '纸', baseValue: 290, rarity: 2, image: 'item_52' },
//     { id: 'item_53', name: '老地图卷', category: 'painting', era: '建国初', material: '纸', baseValue: 420, rarity: 3, image: 'item_53' },
//     { id: 'item_54', name: '朱批族谱', category: 'painting', era: '清末', material: '纸', baseValue: 620, rarity: 5, image: 'item_54' },
//     { id: 'item_55', name: '宣纸信札', category: 'painting', era: '民国', material: '纸', baseValue: 240, rarity: 2, image: 'item_55' },
//     { id: 'item_56', name: '石章套盒', category: 'painting', era: '民国', material: '杂', baseValue: 310, rarity: 3, image: 'item_56' },
//     { id: 'item_57', name: '旧报合订本', category: 'painting', era: '七八十年代', material: '纸', baseValue: 140, rarity: 1, image: 'item_57' },
//     { id: 'item_58', name: '竹简摆件', category: 'painting', era: '当代旧物', material: '木', baseValue: 120, rarity: 1, image: 'item_58' },
//     { id: 'item_59', name: '红旗胶片机', category: 'cameraWatch', era: '七八十年代', material: '金', baseValue: 320, rarity: 2, image: 'item_59' },
//     { id: 'item_60', name: '折叠皮腔相机', category: 'cameraWatch', era: '民国', material: '金', baseValue: 680, rarity: 4, image: 'item_60' },
//     { id: 'item_61', name: '老怀表', category: 'cameraWatch', era: '民国', material: '金', baseValue: 540, rarity: 4, image: 'item_61' },
//     { id: 'item_62', name: '上海牌腕表', category: 'cameraWatch', era: '七八十年代', material: '金', baseValue: 300, rarity: 2, image: 'item_62' },
//     { id: 'item_63', name: '电子表', category: 'cameraWatch', era: '九十年代', material: '金', baseValue: 130, rarity: 1, image: 'item_63' },
//     { id: 'item_64', name: '铁皮收音机', category: 'cameraWatch', era: '七八十年代', material: '金', baseValue: 240, rarity: 2, image: 'item_64' },
//     { id: 'item_65', name: '胶卷铁筒', category: 'cameraWatch', era: '九十年代', material: '金', baseValue: 90, rarity: 1, image: 'item_65' },
//     { id: 'item_66', name: '老测光表', category: 'cameraWatch', era: '七八十年代', material: '金', baseValue: 260, rarity: 2, image: 'item_66' },
//     { id: 'item_67', name: '暗房放大镜', category: 'cameraWatch', era: '建国初', material: '杂', baseValue: 220, rarity: 2, image: 'item_67' },
//     { id: 'item_68', name: '机械闹钟', category: 'cameraWatch', era: '建国初', material: '金', baseValue: 280, rarity: 2, image: 'item_68' },
//     { id: 'item_69', name: '双筒望远镜', category: 'cameraWatch', era: '民国', material: '金', baseValue: 480, rarity: 3, image: 'item_69' },
//     { id: 'item_70', name: '皮影人物', category: 'folkToy', era: '民国', material: '布', baseValue: 340, rarity: 3, image: 'item_70' },
//     { id: 'item_71', name: '泥叫叫', category: 'folkToy', era: '建国初', material: '杂', baseValue: 170, rarity: 1, image: 'item_71' },
//     { id: 'item_72', name: '木偶头', category: 'folkToy', era: '民国', material: '木', baseValue: 300, rarity: 3, image: 'item_72' },
//     { id: 'item_73', name: '拨浪鼓', category: 'folkToy', era: '七八十年代', material: '木', baseValue: 160, rarity: 1, image: 'item_73' },
//     { id: 'item_74', name: '兔儿爷', category: 'folkToy', era: '民国', material: '杂', baseValue: 380, rarity: 3, image: 'item_74' },
//     { id: 'item_75', name: '糖画模具', category: 'folkToy', era: '建国初', material: '金', baseValue: 220, rarity: 2, image: 'item_75' },
//     { id: 'item_76', name: '竹蜻蜓', category: 'folkToy', era: '九十年代', material: '木', baseValue: 80, rarity: 1, image: 'item_76' },
//     { id: 'item_77', name: '面塑寿星', category: 'folkToy', era: '七八十年代', material: '杂', baseValue: 150, rarity: 1, image: 'item_77' },
//     { id: 'item_78', name: '铁皮青蛙', category: 'folkToy', era: '九十年代', material: '金', baseValue: 210, rarity: 2, image: 'item_78' },
//     { id: 'item_79', name: '绣花荷包', category: 'folkToy', era: '民国', material: '布', baseValue: 260, rarity: 2, image: 'item_79' },
//     { id: 'item_80', name: '花灯骨架', category: 'folkToy', era: '建国初', material: '纸', baseValue: 190, rarity: 1, image: 'item_80' },
//     { id: 'item_81', name: '梳妆镜架', category: 'wood', era: '民国', material: '木', baseValue: 430, rarity: 3, image: 'item_81' },
//     { id: 'item_82', name: '红木小几', category: 'wood', era: '清末', material: '木', baseValue: 620, rarity: 4, image: 'item_82' },
//     { id: 'item_83', name: '旧算盘', category: 'wood', era: '民国', material: '木', baseValue: 260, rarity: 2, image: 'item_83' },
//     { id: 'item_84', name: '木雕窗花', category: 'wood', era: '清末', material: '木', baseValue: 540, rarity: 4, image: 'item_84' },
//     { id: 'item_85', name: '条案残件', category: 'wood', era: '民国', material: '木', baseValue: 330, rarity: 2, image: 'item_85' },
//     { id: 'item_86', name: '木食盒', category: 'wood', era: '建国初', material: '木', baseValue: 220, rarity: 2, image: 'item_86' },
//     { id: 'item_87', name: '朱漆盒', category: 'wood', era: '民国', material: '木', baseValue: 370, rarity: 3, image: 'item_87' },
//     { id: 'item_88', name: '药柜抽屉', category: 'wood', era: '建国初', material: '木', baseValue: 290, rarity: 2, image: 'item_88' },
//     { id: 'item_89', name: '木秤杆', category: 'wood', era: '七八十年代', material: '木', baseValue: 140, rarity: 1, image: 'item_89' },
//     { id: 'item_90', name: '榆木脚凳', category: 'wood', era: '民国', material: '木', baseValue: 310, rarity: 2, image: 'item_90' },
//     { id: 'item_91', name: '老铜锁', category: 'bronze', era: '清末', material: '金', baseValue: 360, rarity: 3, image: 'item_91' },
//     { id: 'item_92', name: '铜烛台', category: 'bronze', era: '民国', material: '金', baseValue: 300, rarity: 2, image: 'item_92' },
//     { id: 'item_93', name: '铜水烟袋', category: 'bronze', era: '民国', material: '金', baseValue: 420, rarity: 3, image: 'item_93' },
//     { id: 'item_94', name: '铜铃', category: 'bronze', era: '清末', material: '金', baseValue: 280, rarity: 3, image: 'item_94' },
//     { id: 'item_95', name: '锡酒壶', category: 'bronze', era: '建国初', material: '金', baseValue: 240, rarity: 2, image: 'item_95' },
//     { id: 'item_96', name: '铜托盘', category: 'bronze', era: '七八十年代', material: '金', baseValue: 190, rarity: 1, image: 'item_96' },
//     { id: 'item_97', name: '铜墨盒', category: 'bronze', era: '民国', material: '金', baseValue: 340, rarity: 3, image: 'item_97' },
//     { id: 'item_98', name: '铜手炉', category: 'bronze', era: '清末', material: '金', baseValue: 520, rarity: 4, image: 'item_98' },
//     { id: 'item_99', name: '铁皮饼干盒', category: 'bronze', era: '九十年代', material: '金', baseValue: 110, rarity: 1, image: 'item_99' },
//     { id: 'item_100', name: '铜兽镇纸', category: 'bronze', era: '民国', material: '金', baseValue: 460, rarity: 4, image: 'item_100' },
// ];

// // 专家牌配置表
// export const EXPERT_DEFS: ExpertDef[] = [
//     { id: 'expert_01', name: '沈师傅', title: '老修复师', desc: '修复过的物品额外 +25%', effect: 'repairBonus', value: 0.25, image: 'expert_01' },
//     { id: 'expert_02', name: '陶先生', title: '瓷器眼', desc: '瓷器卖价 +18%', effect: 'categoryBonus', target: 'porcelain', value: 0.18, image: 'expert_02' },
//     { id: 'expert_03', name: '许掌柜', title: '旧书店主', desc: '纸类物品卖价 +16%', effect: 'materialBonus', target: '纸', value: 0.16, image: 'expert_03' },
//     { id: 'expert_04', name: '罗馆员', title: '民俗馆员', desc: '民俗玩具卖价 +18%', effect: 'categoryBonus', target: 'folkToy', value: 0.18, image: 'expert_04' },
//     { id: 'expert_05', name: '韩经纪', title: '拍卖行纪', desc: '上拍总价 +12%', effect: 'auctionBonus', value: 0.12, image: 'expert_05' },
//     { id: 'expert_06', name: '小周', title: '直播摊主', desc: '完全揭示物品 +15%', effect: 'revealBonus', value: 0.15, image: 'expert_06' },
//     { id: 'expert_07', name: '秦探子', title: '假货猎人', desc: '看走眼时至少保本', effect: 'fakeGuard', value: 1, image: 'expert_07' },
//     { id: 'expert_08', name: '白姨', title: '瓷器补彩', desc: '修复过的瓷器再 +15%', effect: 'categoryBonus', target: 'porcelain', value: 0.15, image: 'expert_08' },
//     { id: 'expert_09', name: '严师傅', title: '钟表匠', desc: '相机表卖价 +20%', effect: 'categoryBonus', target: 'cameraWatch', value: 0.2, image: 'expert_09' },
//     { id: 'expert_10', name: '陆师傅', title: '相机修匠', desc: '金属物品卖价 +12%', effect: 'materialBonus', target: '金', value: 0.12, image: 'expert_10' },
//     { id: 'expert_11', name: '宋先生', title: '书画藏家', desc: '旧书画卖价 +20%', effect: 'categoryBonus', target: 'painting', value: 0.2, image: 'expert_11' },
//     { id: 'expert_12', name: '马老板', title: '铜器商', desc: '铜器杂项卖价 +20%', effect: 'categoryBonus', target: 'bronze', value: 0.2, image: 'expert_12' },
//     { id: 'expert_13', name: '冯木匠', title: '木器师傅', desc: '木器家具卖价 +18%', effect: 'categoryBonus', target: 'wood', value: 0.18, image: 'expert_13' },
//     { id: 'expert_14', name: '茶客老梁', title: '茶馆买手', desc: '低价买入物品 +18%', effect: 'cheapBonus', value: 0.18, image: 'expert_14' },
//     { id: 'expert_15', name: '丁伙计', title: '当铺伙计', desc: '组合倍率额外 +0.15', effect: 'comboBonus', value: 0.15, image: 'expert_15' },
//     { id: 'expert_16', name: '梅婶', title: '旧市摊主', desc: '杂项物品卖价 +14%', effect: 'materialBonus', target: '杂', value: 0.14, image: 'expert_16' },
//     { id: 'expert_17', name: '侯车长', title: '铁路藏友', desc: '金属物品卖价 +10%', effect: 'materialBonus', target: '金', value: 0.1, image: 'expert_17' },
//     { id: 'expert_18', name: '阿童', title: '玩具匠', desc: '民俗玩具修复 +20%', effect: 'repairBonus', value: 0.2, image: 'expert_18' },
//     { id: 'expert_19', name: '林馆员', title: '档案管理员', desc: '完全揭示物品 +10%', effect: 'revealBonus', value: 0.1, image: 'expert_19' },
//     { id: 'expert_20', name: '顾先生', title: '沉默买家', desc: '上拍总价 +10%', effect: 'auctionBonus', value: 0.1, image: 'expert_20' },
// ];
