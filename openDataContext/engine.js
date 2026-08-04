// 微信开放数据域排行榜绘制器。
// 这里不再使用复杂布局引擎，只负责把好友云数据画到 sharedCanvas 上。

const env = GameGlobal.wx || GameGlobal.tt || GameGlobal.swan;
const sharedCanvas = env.getSharedCanvas();
const ctx = sharedCanvas.getContext('2d');

let viewPort = {
    x: 0,
    y: 0,
    width: sharedCanvas.width || 1000,
    height: sharedCanvas.height || 1200,
};

let lastRankData = [];
let lastStyle = null;
let lastPage = 1;
const imageCache = {};

function setViewPort(data) {
    viewPort = {
        x: Number(data.x || 0),
        y: Number(data.y || 0),
        width: Number(data.width || sharedCanvas.width || 1000),
        height: Number(data.height || sharedCanvas.height || 1200),
    };
}

function clear() {
    ctx.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height);
}

function getCanvasSize() {
    return {
        width: sharedCanvas.width || viewPort.width || 1000,
        height: sharedCanvas.height || viewPort.height || 1200,
    };
}

function loadImage(src, callback) {
    if (!src) {
        callback(null);
        return;
    }

    if (imageCache[src]) {
        callback(imageCache[src]);
        return;
    }

    const img = env.createImage();
    img.onload = function () {
        imageCache[src] = img;
        callback(img);
    };
    img.onerror = function () {
        callback(null);
    };
    img.src = src;
}

function drawRoundRect(x, y, w, h, r, fillStyle, strokeStyle) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();

    if (fillStyle) {
        ctx.fillStyle = fillStyle;
        ctx.fill();
    }
    if (strokeStyle) {
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function drawCircleImage(img, x, y, size) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, x, y, size, size);
    ctx.restore();
}

function drawAvatar(item, x, y, size) {
    ctx.fillStyle = '#5a3a24';
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    loadImage(item.avatarUrl, function (img) {
        if (!img) return;
        drawCircleImage(img, x, y, size);
    });
}

function drawCrown(index, x, y, size) {
    const crownList = [
        'openDataContext/Leaderboard_GoldCrown.png',
        'openDataContext/Leaderboard_SilverCrown.png',
        'openDataContext/Leaderboard_BronzeCrown.png',
    ];
    const src = crownList[index];

    loadImage(src, function (img) {
        if (img) {
            ctx.drawImage(img, x, y, size, size);
            return;
        }

        // 图片加载失败时用数字兜底，避免排行榜空出一块。
        ctx.fillStyle = index === 0 ? '#f0c15a' : index === 1 ? '#c9d2d1' : '#b87945';
        ctx.font = 'bold 34px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(index + 1), x + size / 2, y + size / 2);
    });
}

function textEllipsis(text, maxWidth) {
    text = String(text || '神秘摊友');
    if (ctx.measureText(text).width <= maxWidth) return text;

    let out = text;
    while (out.length > 0 && ctx.measureText(out + '...').width > maxWidth) {
        out = out.slice(0, -1);
    }
    return out ? out + '...' : '...';
}

function parseScore(item, key) {
    const list = item.KVDataList || [];
    for (let i = 0; i < list.length; i++) {
        if (list[i].key === key) {
            return Number(list[i].value || 0);
        }
    }
    return 0;
}

function normalizeRankData(rawData, key) {
    const list = rawData || [];
    return list.map(function (item) {
        return {
            nickname: item.nickname || '神秘摊友',
            avatarUrl: item.avatarUrl || '',
            score: parseScore(item, key),
        };
    }).sort(function (a, b) {
        return b.score - a.score;
    });
}

function drawEmpty(style) {
    const size = getCanvasSize();
    clear();

    ctx.fillStyle = style.emptyColor;
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('暂无好友排行', size.width / 2, size.height / 2 - 20);

    ctx.font = '24px Arial';
    ctx.fillText('先完成一局，再来看看排名', size.width / 2, size.height / 2 + 28);
}

function drawPageInfo(page, totalPage, style) {
    const size = getCanvasSize();

    ctx.fillStyle = style.subColor;
    ctx.font = '22px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('第 ' + page + ' / ' + totalPage + ' 页', size.width / 2, size.height - 28);
}

function drawLeaderboard(rankData, style, page) {
    const size = getCanvasSize();
    const width = size.width;
    const height = size.height;
    const paddingX = style.paddingX;
    const itemH = style.itemHeight;
    const gap = style.itemGap;
    const startY = style.startY;
    const pageSize = style.pageSize || 5;
    const totalPage = Math.max(1, Math.ceil((rankData || []).length / pageSize));
    page = Math.max(1, Math.min(Number(page || 1), totalPage));
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, (rankData || []).length);

    lastRankData = rankData;
    lastStyle = style;
    lastPage = page;
    clear();

    if (!rankData || rankData.length === 0) {
        drawEmpty(style);
        return;
    }

    for (let i = startIndex; i < endIndex; i++) {
        const item = rankData[i];
        const pageIndex = i - startIndex;
        const y = startY + pageIndex * (itemH + gap);
        const x = paddingX;
        const w = width - paddingX * 2;

        if (y > height) break;

        const bg = i < 3 ? style.topItemBg : style.itemBg;
        const stroke = i < 3 ? style.topItemStroke : style.itemStroke;
        drawRoundRect(x, y, w, itemH, style.itemRadius, bg, stroke);

        if (i < 3) {
            drawCrown(i, x + 18, y + 22, 66);
        } else {
            ctx.fillStyle = style.rankNumColor;
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(i + 1), x + 50, y + itemH / 2);
        }

        const avatarX = x + 104;
        const avatarY = y + 22;
        drawAvatar(item, avatarX, avatarY, 66);

        ctx.fillStyle = style.nameColor;
        ctx.font = '28px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const name = textEllipsis(item.nickname, w * 0.38);
        ctx.fillText(name, avatarX + 84, y + 42);

        ctx.fillStyle = style.subColor;
        ctx.font = '22px Arial';
        ctx.fillText(i === 0 ? '本周摊王' : '好友排行', avatarX + 84, y + 78);

        ctx.fillStyle = style.scoreColor;
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(String(item.score), x + w - 30, y + 42);

        ctx.fillStyle = style.subColor;
        ctx.font = '22px Arial';
        ctx.fillText('最高收益', x + w - 30, y + 78);
    }

    drawPageInfo(page, totalPage, style);
}

function redraw() {
    if (lastStyle) {
        drawLeaderboard(lastRankData, lastStyle, lastPage);
    }
}

module.exports = {
    clear,
    redraw,
    setViewPort,
    normalizeRankData,
    drawLeaderboard,
};
