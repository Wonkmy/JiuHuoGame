import Utils from "../Global/Utils";

export default class ConfigData {
    /**测试时修改这个token */
    // public static token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyMyIsImV4cCI6MTcyNjkwODM4OCwiaWF0IjoxNzI2MzAzNTg4fQ.JUAsNdoZ5CE6TIPrPrbP92SUKO6pfDz-U2SlBD3fTKM";
    /**发布token */
    public static token = null;
    /**测试活动Id */
    // public static activityId = 791;
    /**发布活动Id */
    public static activityId = null;
    /**userId */
    public static userId = 0;

    /**userKey */
    public static userKey = "1";
    //http://192.168.10.41:8080/api-promotion/rest/restaurantGame/gameIndex
    /**功能请求Url */
    public static resWebUrl = "https://m.kefeichangduo.top/api-promotion/rest/";//发布时取消注释
    // public static resWebUrl = "http://192.168.10.24:8080/api-promotion/rest/";//测试链接

    /**图片Url*/
    public static imgWebUrl = "https://pic.kefeichangduo.top/";
    // public static imgWebUrl = "https://pic.kefeichangduo.top/";

    public static init() {
        let param = Utils.GetCCGame("params");
        if (param) {
            param = JSON.parse(param);
            ConfigData.token = param.token;
            ConfigData.activityId = param.id;
        }
    }
}
