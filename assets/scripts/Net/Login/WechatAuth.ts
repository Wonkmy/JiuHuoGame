declare const wx: any

// Cocos Creator 脚本 - WechatManager.ts
export default class WechatManager {
    private static readonly BASE_URL = 'http://127.0.0.1:3000/users/api';

    // 1. 登录并获取分数
    public static async loginAndGetScore(): Promise<{ openid: string; score: number }> {
        return new Promise((resolve, reject) => {
            wx.login({
                success: (loginRes:any) => {
                    // 调用微信登录接口获取 code
                    wx.request({
                        url: `${WechatManager.BASE_URL}/login`,
                        method: 'POST',
                        header: {
                            'Content-Type': 'application/json',
                        },
                        data: {
                            code: loginRes.code
                        },
                        success: (res: any) => {
                            if (res.statusCode === 200 && res.data.success) {
                                // 保存 openid 到本地
                                wx.setStorageSync('openid', res.data.data.openid);
                                wx.setStorageSync('userInfo', JSON.stringify(res.data.data));

                                resolve({
                                    openid: res.data.data.openid,
                                    score: res.data.data.score
                                });
                            } else {
                                reject(new Error(res.data.message || '登录失败'));
                            }
                        },
                        fail: (err:any) => {
                            reject(new Error(`请求失败: ${err.errMsg}`));
                        }
                    });
                },
                fail: (err:any) => {
                    reject(new Error(`wx.login 失败: ${err.errMsg}`));
                }
            });
        });
    }

    // 2. 更新分数
    public static async updateScore(score: number): Promise<number> {
        const openid = wx.getStorageSync('openid');

        if (!openid) {
            throw new Error('请先登录');
        }

        return new Promise((resolve, reject) => {
            wx.request({
                url: `${this.BASE_URL}/update-score`,
                method: 'POST',
                header: {
                    'Content-Type': 'application/json',
                },
                data: {
                    openid: openid,
                    score: score
                },
                success: (res: any) => {
                    if (res.statusCode === 200 && res.data.success) {
                        resolve(res.data.data.score);
                    } else {
                        reject(new Error(res.data.message || '更新分数失败'));
                    }
                },
                fail: (err:any) => {
                    reject(new Error(`请求失败: ${err.errMsg}`));
                }
            });
        });
    }

    // 3. 获取排行榜
    public static async getRank(): Promise<Array<{ openid: string; score: number; nickname?: string; avatar_url?: string }>> {
        return new Promise((resolve, reject) => {
            wx.request({
                url: `${this.BASE_URL}/rank`,
                method: 'GET',
                success: (res: any) => {
                    if (res.statusCode === 200 && res.data.success) {
                        resolve(res.data.data);
                    } else {
                        reject(new Error(res.data.message || '获取排行榜失败'));
                    }
                },
                fail: (err:any) => {
                    reject(new Error(`请求失败: ${err.errMsg}`));
                }
            });
        });
    }

    // 4. 获取指定用户分数
    public static async getUserScore(openid: string): Promise<{ openid: string; score: number }> {
        return new Promise((resolve, reject) => {
            wx.request({
                url: `${this.BASE_URL}/user-score/${openid}`,
                method: 'GET',
                success: (res: any) => {
                    if (res.statusCode === 200 && res.data.success) {
                        resolve(res.data.data);
                    } else {
                        reject(new Error(res.data.message || '获取用户分数失败'));
                    }
                },
                fail: (err:any) => {
                    reject(new Error(`请求失败: ${err.errMsg}`));
                }
            });
        });
    }

    // 5. 更新用户信息（昵称、头像等）
    public static async updateUserInfo(nickname: string, avatarUrl: string): Promise<void> {
        const openid = wx.getStorageSync('openid');

        if (!openid) {
            throw new Error('请先登录');
        }

        return new Promise((resolve, reject) => {
            wx.request({
                url: `${this.BASE_URL}/update-userinfo`,
                method: 'POST',
                header: {
                    'Content-Type': 'application/json',
                },
                data: {
                    openid: openid,
                    nickname: nickname,
                    avatarUrl: avatarUrl
                },
                success: (res: any) => {
                    if (res.statusCode === 200 && res.data.success) {
                        resolve();
                    } else {
                        reject(new Error(res.data.message || '更新用户信息失败'));
                    }
                },
                fail: (err:any) => {
                    reject(new Error(`请求失败: ${err.errMsg}`));
                }
            });
        });
    }
}
