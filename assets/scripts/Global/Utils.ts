// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { IDictionary } from "../Interface/IDictionary";
import ConfigData from "../Net/ConfigData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Utils extends cc.Component {
    // 获取一个随机且唯一的元素
    static getRandomY(originalArray): number {
        let yOffset: number[] = []
        yOffset = [...originalArray];
        if (yOffset.length === 0) {
            yOffset = [...originalArray]; // 重新填充数组
        }
        const randomIndex = this.myrandom(0, yOffset.length);
        const targetY = yOffset[randomIndex];
        yOffset.splice(randomIndex, 1); // 移除已取出的元素
        return targetY;
    }
    static myrandom(lower, upper) {
        return Math.floor(Math.random() * (upper - lower)) + lower;
    }

    static generateRandomArray(maxLength, maxZeros) {
        // 设置默认的最小长度和最小0的数量
        const minLength = maxLength;
        const minZeros = maxZeros;

        // 生成随机长度的数组
        let length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
        let rList = new Array(length).fill(1);

        // 随机生成0的数量，确保在minZeros和maxZeros之间
        let zeroCount = Math.floor(Math.random() * (maxZeros - minZeros + 1)) + minZeros;

        // 确保第一个和最后一个元素不为0，所以从第二个到倒数第二个元素中随机设置 zeroCount 个位置为0
        let zeroIndices = new Set();
        while (zeroIndices.size < zeroCount) {
            let zeroIndex = Math.floor(Math.random() * (length - 2)) + 1; // 从索引1到索引length-2之间随机
            if (!zeroIndices.has(zeroIndex) && !zeroIndices.has(zeroIndex - 1) && !zeroIndices.has(zeroIndex + 1)) {
                zeroIndices.add(zeroIndex);
                rList[zeroIndex] = 0;
            }
        }

        return rList;
    }

    static getRandomElementsWithCoordinates(arr, count) {
        // 将二维数组展开为一维数组，并记录每个元素的原始坐标
        const flatArrayWithCoords = [];
        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr[i].length; j++) {
                flatArrayWithCoords.push({ value: arr[i][j], coords: [i, j] });
            }
        }

        // 随机打乱一维数组
        for (let i = flatArrayWithCoords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [flatArrayWithCoords[i], flatArrayWithCoords[j]] = [flatArrayWithCoords[j], flatArrayWithCoords[i]];
        }

        // 从打乱的一维数组中选择指定数量的元素
        return flatArrayWithCoords.slice(0, count);
    }

    static reshapeTo2DArray(arr, width) {
        const reshapedArray = [];
        for (let i = 0; i < arr.length; i += width) {
            reshapedArray.push(arr.slice(i, i + width));
        }
        return reshapedArray;
    }

    static getRandomPositionsAndUpdateArray(arr, count) {
        const rows = arr.length;
        const cols = arr[0].length;
        const totalCells = rows * cols;

        if (count > totalCells) {
            throw new Error("Count exceeds the total number of elements in the array.");
        }

        // 创建一个包含所有位置的数组
        const positions = [];
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                positions.push([i, j]);
            }
        }

        // 随机打乱位置数组
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        // 选择前 count 个位置并将对应位置的值设为 1
        for (let k = 0; k < count; k++) {
            const [x, y] = positions[k];
            arr[x][y] = 1;
        }

        return arr;
    }

    static rotateNodeTowardsTarget(node, targetPos) {
        // 获取节点的当前位置
        let nodePos = node.getPosition();

        // 计算节点当前位置与目标点之间的向量
        let direction = targetPos.sub(nodePos);

        // 计算向量的角度（弧度）
        let angle = Math.atan2(direction.y, direction.x);

        // 将弧度转换为度数
        let degree = cc.misc.radiansToDegrees(angle);

        // 设置节点的旋转角度（旋转角度是顺时针方向的
        node.angle = 90 + degree -180;
    }
// 去重方法
    static removeDuplicates(array: number[]): number[] {
        return array.filter((item, index) => array.indexOf(item) === index);
    }

    static getElementCountAndType(array: number[]) {

        let count = {};


        array.forEach(element => {
            if (count[element]) {
                count[element]++;
            } else {
                count[element] = 1;
            }
        });


        let result = Object.keys(count).map(key => {
            return { element: Number(key), count: count[key] };
        });

        return result;
    }


    static calculateDamage(attackPower, defense, offset, critMultiplier, isCrit) {
        // 生成0.9到1.2之间的随机因子
        let randomFactor = Math.random() * 0.3 + 0.9;

        // 计算暴击系数（如果触发暴击则使用critMultiplier，否则为0）
        let critFactor = isCrit ? critMultiplier : 0;

        // 计算最终伤害值
        let finalDamage = (attackPower - defense) * (1 + offset + critFactor) * randomFactor;

        return finalDamage;
    }
    private static LoadText(url: string, action: ActionNet, data?: IDictionary<string, any>, method: string = "GET"): void {
        let isreturn = false;

        setTimeout(() => {
            if (!isreturn) {
                //reject(new Error("网络连接已超时"));
                action.RunError([new Error("网络连接已超时")]);
                isreturn = true;
            }
        }, 7000);
        let datastr = null;
        if (data) {
            datastr = data.ToUrl();
        }
        let client = new XMLHttpRequest();;// cc.loader.getXMLHttpRequest()
        if (method === "GET") {
            if (datastr) {
                client.open(method, url + "?" + datastr, true);
            } else {
                client.open(method, url, true);
            }
            client.setRequestHeader("token", ConfigData.token); // 这里替换为你的 token
        } else if (method === "POST") {
            // 替换特殊符号"+"
            let reg = /\+/g;
            let _url = url.replace(reg, "%2B");
            console.log("send http post", _url);
            client.open(method, _url, true);
            client.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        }
        //client.timeout = 5000;       //5秒后超时
        client.responseType = "text";

        client.onreadystatechange = (ev: Event) => {
            if (client.readyState < 4) return;
            if (isreturn) {
                return;
            }
            if (client.readyState === 4 && (client.status >= 200 && client.status <= 500)) {
                isreturn = true;
                action.RunOK([client.response]);
                client.abort();
                client = null;
            } else {
                isreturn = true;

                if ("" === client.statusText) {
                    action.RunError([new Error("网络请求出错")]);
                } else {
                    action.RunError([new Error(client.statusText)]);
                }
            }
        };

        client.onerror = (ev: Event) => {
            if (isreturn) {
                return;
            }
            isreturn = true;
            client.abort();
            client = null;
            action.RunError([new Error("网络请求出错")]);
        }

        let log = `发送http请求 请求方式:${method} 请求地址:${url}`;
        if (datastr) {
            client.send(datastr);
            log += `?${datastr}`
        } else {
            client.send();
        }
        // console.log(log);
    }
    public static requestWeb(reqSt: HttpReqSt): void {
        let url = reqSt.url + "?";
        let param = reqSt.param;
        let act = reqSt.act;
        console.log("ready quest id:" + reqSt.id);

        // let signStr =Utils.getSign(param, REQUEST_KEY);
        this.LoadText(url + Utils.getSign(param), new ActionNet(this, (res) => {
            // let result = JSON.parse(decodeRes(res));
            let data = JSON.parse(res);
            let result: WebRequestResult = new WebRequestResult();
            result.id = reqSt.id;
            result.code = data["code"];
            result.data = data["data"];
            result.msg = data["message"];

            if (200 == result["code"]) {
                // Global.Instance.UiManager.ShowTip("请求成功!");
                result.result = "success";
            } else {
                result.result = "fail";
            }
            // console.log("request res: ", JSON.stringify(data));
            if (act) {
                // 请求成功
                act.Run([result]);
            }
        }, (err: Error) => {
            // 请求出错/网络异常
            let result: WebRequestResult = new WebRequestResult();
            result.id = reqSt.id;
            result.code = 0;
            result.data = err;
            result.result = "fail";
            result.msg = "网络连接异常";
            // console.log("请求异常: ", err);

            if (act) {
                // 请求失败
                act.Run([result]);
            }
        }));
    }

    public static GetCCGame(key: string): any {
        return window["ccgame"] ? window["ccgame"][key] || null : null;
    }
    public static deepArrayCopy(array: any) {

        let objtype = typeof array;
        switch (objtype) {
            case "string":
            case "number":
            case "undefined":
            case "boolean":
                return array;
        }

        let newArr = [];
        for (let index = 0; index < array.length; index++) {
            newArr[index] = Utils.deepArrayCopy(array[index])
        }
        return newArr;
    }
    public static getSign(obj: any, key: string = "1"): string {
        if (!key) {
          return "";
        }

        var signStr = "";
        var paramStr = "";

        if (!obj) {
          // signStr = MD5(signStr + "&key=" + key);
          signStr = "sign=" + signStr;
        } else {
          if ("object" != typeof obj) return "";
          var keys = Object.keys(obj);
          keys = keys.sort();

          for (let idx = 0; idx < keys.length; idx++) {
            let element = obj[keys[idx]];

            if ("object" == typeof element) {
              element = JSON.stringify(element);
            }

            // signStr += keys[idx] + "=" + element;
            paramStr += keys[idx] + "=" + element;

            if (idx != keys.length - 1) {
              // signStr += "&";
              paramStr += "&";
            }
          }

          // paramStr += "&" + "key={gwBGmuptzUoyCzzhBsImdISpUt7PoDot}";
          // signStr = MD5(signStr + "&key=" + key);
          // signStr = "sign=" + signStr + "&" + paramStr;
          signStr = paramStr;
        }

        // console.log("--- paramStr: ", signStr);
        return signStr;
    }
    public static navigateToUni(url) {
        console.log("跳转到小程序");
        window["navigateToUni"](url);
    }
    public static loadImgUrl(url: string, sprite: cc.Sprite) {
        if (!url) return;
        cc.assetManager.loadRemote(url, (err, texture: cc.Texture2D) => {
            if (!err) {
                let spriteFrame = new cc.SpriteFrame(texture);
                sprite.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            }
        });
    }
    public static isJsonStr(str) {
        // 如果 str 不是字符串类型，直接返回 false。
        if (typeof str !== 'string') {
          return false
        }

        // 替换字符串中的转义字符和非标准 JSON 格式。
        str = str.replace(/\\(?:["\\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
          .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\\-]?\d+)?/g, ']')
          .replace(/(?:^|:|,)(?:\s*\[)+/g, '')

        // 使用正则表达式检查字符串是否符合 JSON 格式。
        return (/^[\],:{}\s]*$/.test(str))
      }
}
export enum PropType {
    addTimer = 0,
    crossLevel = 1,
    cleaner = 2
  }
export class HttpReqSt {
    public id: string = "";
    public url: string = "";
    public param: any = null;
    public act: Action = null;

    constructor(id: string, url: string, param: any, act: Action) {
        this.url = url;
        this.param = param;
        this.act = act;
        this.id = id;
    }
}
export class Action {
    public static ResultFilter(obj: any): boolean {
        if (!cc.isValid(obj)) {
            return false;
        }
        if (obj.status === "success") {
            return true;
        }
        return false;

    }

    public Fun: Function;
    public Obj: any;
    public Args: any[];

    public constructor(obj: any, fun: Function, args?: any[]) {
        this.Obj = obj;
        this.Args = args;
        this.Fun = fun;
    }
    public Run(args: any[]): any {
        if (!this.Fun) return;
        if (typeof this.Fun !== "function") return;
        if (this.Obj) {
            return this.Fun.apply(this.Obj, args);
        } else {
            return this.Fun(args);
        }
    }
    public RunArgs(): any {
        if (!this.Fun) return;
        if (typeof this.Fun !== "function") return;
        if (this.Obj) {
            return this.Fun.apply(this.Obj, this.Args);
        } else {
            return this.Fun(this.Args);
        }
    }
}
export class WebRequestResult{
    /**
     * 请求唯一标识
     */
    public id: string = "";

    /**
     * 请求的结果
     * value: "success","fail"
     */
    public result: string = "";

    /**
     * 返回的代码
     */
    public code: number = -1;

    /**
     * 返回的提示文字
     */
    public msg: string = "";

    /**
     * 返回的数据
     */
    public data: any = null;
}
export class ActionNet {
    public constructor(thisObject: any, okAction: Function, errorAction: Function = null) {
        this.thisObject = thisObject;
        this.okAction = okAction;
        this.errorAction = errorAction;

    }
    /**
     * 方法
     */
    public okAction: Function;

    public errorAction: Function;

    public progressAction: Function;
    /**
     * 作用域
     */
    public thisObject: any;
    /**
     * 参数 数组格式
     * 例如方法是function(a:number,b:string)   则argArray格式为[1,"string"];
     */
    public argArray: any;

    public Run(argArray: any = null): boolean {

        if (this.Filter(argArray)) {
            this.RunOK([argArray]);
            return true;
        } else {
            this.RunError([argArray]);
            return false;
        }
    }



    /**
     * 传入参数的委托
     * @param argArray
     * @returns {}
     */
    public RunOK(argArray: any = null) {
        if (this.okAction) {
            this.okAction.apply(this.thisObject, argArray);
        }
    }

    public RunError(argArray: any = null) {
        if (this.errorAction) {
            this.errorAction.apply(this.thisObject, argArray);
        }
    }

    public RunProgress(argArray: any = null) {
        if (this.thisObject && this.progressAction) {
            this.progressAction.apply(this.thisObject, argArray);
        }
    }


    private reqFail(obj) {
        if (this.errorAction) {
            return;
        } else {
        }
    }
    private Filter(obj) {
        if (obj) {
            return true;
        }

        // // web请求
        // if (obj.code || "string" == typeof obj) {
        //     return true;
        // }

        // if (obj.status === "showtip") {
        //     Global.Instance.UiManager.ShowTip(obj.msg);
        //     return false;
        // }
        // if (obj.status === "showbox") {
        //     Global.Instance.UiManager.ShowMsgBox(obj.msg);
        //     return false;
        // }
        // if (obj.status === "restart") {
        //     Global.Instance.UiManager.ShowMsgBox(obj.msg, this, () => {
        //         cc.game.restart();
        //     });
        //     return false;
        // }
        // if (obj.status === "fail") {
        //     this.reqFail(obj);
        //     return false;
        // }
        // return false;
    }
}

