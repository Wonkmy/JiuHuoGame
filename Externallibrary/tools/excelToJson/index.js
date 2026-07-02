const Xlsx = require("node-xlsx");
const Fs = require("fs");
const Path = require("path");
const { dir } = require("console");

const config = `${__dirname}` + "/config.json";
// 读取配置文件
let configData = Fs.readFileSync(config, "utf-8");
let configJson = JSON.parse(configData);
console.log("configJson:", configJson);

let parseSheet = function (xlsxStr, sheetStr, jsonStr, flagJsonFormat) {
    let dirPath = `${__dirname}/xlsx`;
    Fs.readdir(dirPath, function (err, files) {
        for (let m = 0; m < files.length; m++) {
            let file = files[m];
            // let path = `${__dirname}/xlsx/${file}`;
            let path = `${dirPath}/${file}`;
            let extname = Path.extname(path);
            let basename = Path.basename(path, extname);
            // 判断file是否为同名xlsxStr文件夹

            if (basename != xlsxStr) continue;
            else {
                try {
                    let stats = Fs.statSync(path);
                    if (stats.isDirectory()) {
                        console.log("有个同名文件夹");
                        continue;
                    } else {
                    }
                } catch (err) {
                    console.error(err);
                }

                // 表格解析
                let sheetList = Xlsx.parse(path);

                // 对表格进行处理
                for (let n = 0; n < sheetList.length; n++) {
                    let sheet = sheetList[n];

                    if (sheet.name == sheetStr) {
                        let sheetArr = [];
                        if (!flagJsonFormat) {
                            sheetArr = toArrFormat(sheet);
                        } else {
                            sheetArr = toJsonFormat(sheet);
                        }

                        // 生成json文件
                        let json = JSON.stringify(sheetArr);
                        Fs.writeFile(`${__dirname}/json/${jsonStr}.json`, json, "utf-8", function (err) {
                            if (!err) {
                                for (let m = 0; m < configJson.length; m++) {
                                    let item = configJson[m];
                                    if (item.xlsx == xlsxStr && item.sheet == sheetStr && item.json == jsonStr) {
                                        item[item.xlsx + "_" + item.sheet + "_" + item.json] = true;
                                        break;
                                    }
                                }
                                console.log(xlsxStr + "_" + sheetStr + "_" + jsonStr, "生成json文件成功");
                            }
                        });
                        break;
                    }
                }
                break;
            }
        }
    });
};

// 把数组格式数据换成json格式输出
let toJsonFormat = function (sheet) {
    let data = sheet.data; //二维数组格式
    let sheetArr = [];
    // 第一行是中文 备注 不管
    // 第二行是 字段名 带#的不要 ,加入noNNeedCols，首字母是星的得去掉星号
    // 第三行是字段类型，后面空的时候 默认 string填""  number填0
    // 输出json格式，带字段
    let keys = data[1];
    let noNeedCols = [];

    for (let i = 0; i < keys.length; i++) {
        if (keys[i].substr(0, 1) == "#") {
            noNeedCols.push(i);
        } else {
            // 去掉星号
            if (keys[i].substr(0, 1) == "*") {
                keys[i] = keys[i].substr(1);
            }
        }
    }

    // 第三行是字段类型，后面空的时候 默认 string填""  number填0
    let units = data[2];

    for (let i = 3; i < data.length; i++) {
        let obj = {};
        let rowIndex = i;
        let rowData = data[i];

        //   第一列不能是空的，但可以为0   ,有的表最后几行看不见但解析出有空的值
        if (!rowData[0] && rowData[0] != 0) {
            console.log(sheet.name + "第" + rowIndex + "行是空的");
            continue;
        }

        for (let j = 0; j < units.length; j++) {
            let colData = rowData[j];
            let colIndex = j;
            if (!colData) {
                if (units[j] == "number") colData = 0;
                else colData = "";
            } else {
                if (units[j] == "number") {
                    if (isNaN(Number(colData))) {
                        console.log(sheet.name + "第" + rowIndex + "行" + units[j] + "类型错误");
                        // 如果是number类型的但是实际是字符串，那么就是字符串，不管
                    } else {
                        colData = Number(colData);
                    }
                } else colData = "" + colData;
            }
            // 其他的都要
            if (noNeedCols.indexOf(colIndex) == -1) {
                obj[keys[colIndex]] = colData;
            }
        }
        if (Object.keys(obj).length > 0) sheetArr.push(obj);
    }

    return sheetArr;
};

//把数组格式数据转为数组格式输出
let toArrFormat = function (sheet) {
    let data = sheet.data; //二维数组格式
    let sheetArr = [];
    // 第一行是中文 备注 不管
    // 第二行是 字段名 带#的不要 ,加入noNNeedCols
    // 第三行是字段类型，后面空的时候 默认 string填""  number填0
    // 输出数组格式，不带字段
    let keys = data[1];
    let noNeedCols = [];
    let rowArr0 = [];
    for (let i = 0; i < keys.length; i++) {
        if (keys[i].substr(0, 1) == "#") {
            noNeedCols.push(i);
        } else {
            // 去掉星号
            if (keys[i].substr(0, 1) == "*") {
                keys[i] = keys[i].substr(1);
            }
            rowArr0.push(keys[i]);
        }
    }
    // 把第2行字段名的加入
    sheetArr.push(rowArr0);
    // 第三行是字段类型，后面空的时候 默认 string填""  number填0
    let units = data[2];

    for (let i = 3; i < data.length; i++) {
        let rowArr = [];
        let rowIndex = i;
        let rowData = data[i];

        //   第一列不能是空的，但可以为0   ,有的表最后几行看不见但解析出有空的值
        if (!rowData[0] && rowData[0] != 0) {
            console.log(sheet.name + "第" + rowIndex + "行是空的");
            continue;
        }

        for (let j = 0; j < units.length; j++) {
            let colData = rowData[j];
            let colIndex = j;
            if (!colData) {
                if (units[j] == "number") colData = 0;
                else colData = "";
            } else {
                if (units[j] == "number") {
                    if (isNaN(Number(colData))) {
                        console.log(sheet.name + "第" + rowIndex + "行" + units[j] + "类型错误");
                        // 如果是number类型的但是实际是字符串，那么就是字符串，不管
                    } else {
                        // 如果是小数 ，且小数点后面有超过10个连续的0，那么把连续的0及后面的去掉
                        if (colData % 1 != 0) {
                            colData = colData.toString();
                            let arr = colData.split(".");
                            let str = arr[1];
                            let reg = /0{10,}/;
                            let result = reg.exec(str);
                            if (result) {
                                let index = result.index;
                                colData = colData.substr(0, index + 10);
                            }
                        }
                        colData = Number(colData);
                    }
                } else colData = "" + colData;
            }
            // 其他的都要
            if (noNeedCols.indexOf(colIndex) == -1) {
                rowArr.push(colData);
            }
        }
        if (rowArr.length > 0) sheetArr.push(rowArr);
    }
    return sheetArr;
};

let checkOver = function () {
    for (let m = 0; m < configJson.length; m++) {
        let item = configJson[m];
        if (item.xlsx && item[item.xlsx + "_" + item.sheet + "_" + item.json] == false) {
            console.log(item[item.xlsx + "_" + item.sheet + "_" + item.json]);
            console.log(item.xlsx + "_" + item.sheet + "_" + item.json);
            return false;
        }
    }
    return true;
};

// 把json文件合并成一个json文件
let mergeJson = function () {
    let json = {};
    for (let m = 0; m < configJson.length; m++) {
        let item = configJson[m];
        if (item.xlsx) {
            let jsonStr = item.json;
            let jsonData = Fs.readFileSync(`${__dirname}/json/${jsonStr}.json`, "utf-8");
            json[jsonStr] = JSON.parse(jsonData);
        }
    }
    let jsonStr = JSON.stringify(json);

    Fs.writeFile(`${__dirname}/GameCfg.json`, jsonStr, "utf-8", function (err) {
        if (!err) {
            console.log("生成GameCfg.json文件成功");
            copyGameCfg();
        }
    });
};

// 把`${__dirname}/GameCfg.json`文件覆盖config目录的GameCfg.json文件
let copyGameCfg = function () {
    let jsonData = Fs.readFileSync(`${__dirname}/GameCfg.json`, "utf-8");
    let targetPath = `${__dirname}/../../../assets/datas/GameCfg.json`;
    Fs.writeFile(targetPath, jsonData, "utf-8", function (err) {
        if (!err) {
            console.log("覆盖GameCfg.json文件成功");
        } else {
            console.log(err);
        }
    });
};

// 每隔0.5s检查一次是否全部解析完毕
let timer = setInterval(() => {
    if (checkOver()) {
        console.log("任务完成，执行合并");
        clearInterval(timer);
        mergeJson();
    }
}, 500);

// 合并json文件

// 扫描文件中的汉字，然后把汉字提取出来，放到一个json文件中
let checkChinese = function () {
    // 源文件
    let oriFile = `${__dirname}/GameCfg.json`;
    let jsonData = Fs.readFileSync(oriFile, "utf-8");
    let json = JSON.parse(jsonData);
    let keys = Object.keys(json);

    let ori1File = `${__dirname}/Chinese0.json`;
    // 先从这个文件读取默认的chinese
    let ori1Data = Fs.readFileSync(ori1File, "utf-8");
    let ori1Json = JSON.parse(ori1Data);
    let chinese = ori1Json.chinese;
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let arr = json[key];
        for (let j = 0; j < arr.length; j++) {
            let obj = arr[j];
            let objKeys = Object.keys(obj);
            for (let k = 0; k < objKeys.length; k++) {
                let objKey = objKeys[k];
                let objValue = obj[objKey];
                if (typeof objValue == "string") {
                    if (objValue.match(/[\u4e00-\u9fa5]/g)) {
                        chinese += objValue;
                    }
                }
            }
        }
    }
    // 放置的目标文件
    let tarFile = `${__dirname}/Chinese.json`;
    let chineseStr = JSON.stringify({ chinese });
    Fs.writeFile(tarFile, chineseStr, "utf-8", function (err) {
        if (!err) {
            console.log("生成Chinese.json文件成功");
        }
    });
};

async function main() {
    for (let m = 0; m < configJson.length; m++) {
        let item = configJson[m];
        if (item.xlsx) {
            item[item.xlsx + "_" + item.sheet + "_" + item.json] = false;
            parseSheet(item.xlsx, item.sheet, item.json, item.jsonFormat);
        }
    }
}

main();
