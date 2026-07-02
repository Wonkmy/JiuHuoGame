0,"tilegrass_01"
1,"tilegrass_02"
2,"tiledirt_01"
3,"tiledirt_02"
4,"tree_01"
5,"tree_02"
6,"tree_03"
7,"tree_04"
8,"tile"
9,"rabbit"
10,"pig"

## 如何创建一个动物实体？
注意：这些操作都要在GameMain.instance.getAeestsById(getAeestsById(assId:number,callBack))函数的回调函数中执行
### 先获取动物精灵资源
let tex: cc.Texture2D = spass as cc.Texture2D;
let sp: cc.SpriteFrame = new cc.SpriteFrame(tex)
sp.name = "rabbit";
### 创建一支动物节点
let newAnimal: cc.Node = new cc.Node("animal");
newAnimal.setParent(this.node);
newAnimal.setPosition(this._calculorPos(x, y, newAnimal));
newAnimal.addComponent(cc.Sprite);
### 为动物节点添加实体类
let rabbitEntity: RabbitEntity = newAnimal.addComponent(RabbitEntity);
rabbitEntity.id = id;
### 创建一条基因数据
let rabbitGene: AnimalGene = new AnimalGene(cc.Color.BLACK, Gender.Male);
### 创建一个动物实体数据
let newrabbit_data = new RabbitData("小黑", 1, sp, rabbitGene);
rabbitEntity.entitydata = newrabbit_data;// 赋值数据
### (可选) 为该实体赋予--跳跃--行为
let jumpBehavior: JumpBehaviors = new JumpBehaviors();// 创建一个新的跳跃行为类
jumpBehavior.setHandle(0.5, new cc.Vec2(rabbitEntity.node.x + 50, rabbitEntity.node.y), 50, 1);// 设置跳跃行为的参数
jumpBehavior.defineBehavior();// 定义跳跃行为
### 将动物生成并开始生活
rabbitEntity.spwan().livelihood();
### 实际执行'跳跃'行为(finished可以为空，如果想连续执行跳跃行为，可以在finished回调中再次调用doBehavior)
rabbitEntity.doBehavior(jumpBehavior, finished);
