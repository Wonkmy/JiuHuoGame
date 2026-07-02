export default class Singleton {
    // 实例
    private static _instance: Singleton;
    // 是否是通过getInstance实例化
    private static _instantiateByGetInstance: boolean = false;
    
    /**
     * 获取实例
     */
    public static getInstance<T extends Singleton>(this: (new () => T) | typeof Singleton): T {
        const _class = this as typeof Singleton;
        if (!_class._instance) {
            _class._instantiateByGetInstance = true;
            _class._instance = new _class();
            _class._instantiateByGetInstance = false;
        }
        return _class._instance as T;
    }
    
    /**
     * 构造函数
     * @protected
     */
    protected constructor() {
        if (!(this.constructor as typeof Singleton)._instantiateByGetInstance) {
            throw new Error("Singleton class can't be instantiated more than once.");
        }
    }
}