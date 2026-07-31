export class ConstValue {
    public static readonly CONFIG_FILE_DIR = "config/";
    public static readonly PREFAB_UI_DIR = "prefab/ui/";
    public static readonly AUDIO_DIR = "audio/";
    public static readonly defaultMoney = 1000;
    public static readonly UNLOCK_TABLE_COST = 400;// 解锁藏品馆桌子花费
    public static readonly TotalPoints = 9;// 鉴赏时可以最多操作几次
    public static readonly unLockedTabelLimit = 1;// 默认情况下，一个藏品馆解锁到哪个索引下的桌子。例如：这里填写1，就是至少解锁2张桌子。因为索引是从0开始的
}
// /**
//  * 请求数据
//  */
// export class RequestData{
//     id:number;
//     type:string;

//     constructor(id:number,type:string){
//         this.id = id;
//         this.type = type;
//     }
// }

// /**
//  * 响应/预设数据
//  */
// export class ResponseData{
//     id:number;
//     type:string;
//     path:string;

//     constructor(id:number,type:string,path:string){
//         this.id=id;
//         this.type = type;
//         this.path = path;
//     }
// }
