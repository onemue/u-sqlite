<h2>onemue-USQLite</h2>

> u-SQLite 交流群：643867519
> 如果觉的当前插件对你有帮助可以前往 [github](https://github.com/onemue/u-sqlite) 点 star!
### 技术亮点
1. 基于ORM技术，使用对象的方式来操作sqlite数据库，而无需编写任何sql语句
2. 支持数据库的常规操作增删改查，API极为简洁，且高效智能。
3. 支持条件查询 与 分页查询
4. 支持原生sql语句，如果我们的框架无法满足您的需求，我们也提供了特殊的API可以直接使用sql语句来操作
5. 支持链式语法
### 使用方法

#### 挂载方法
```js
// main.js
import { usqlite } from '@/uni_modules/onemue-USQLite/js_sdk/usqlite.js'
uni.$sql = usqlite;
```
#### 链接数据库
```js
//如果数据库存在则连接，不存在则会自动创建数据库
uni.$sql.connect({
    name: 'local',// 数据库名称
    path:'_doc/local.db', // 路径
});
```
#### 创建Model模型
```js
//3.创建Model(表格模型：负责增删改查)
//如果table表格存在则连接，不存在则自动创建
let studentModel = uni.$sql.model('student',{
    name:String,
    age:{
        type: Number,
        default: 18
    }
});
```
**约束**
> 使用对象时，以约束模式处理，此时对象`type`为类型。
> 使用一下内容，为约束。
> `default`需要设置默认值，如：`{default: 0}`。
> `check`需要设置条件，如：`{check:'age>18'}`。

- check CHECK 检查
- primaryKey PRIMARY KEY 主键
- unique UNIQUE 不重复
- default DEFAULT 默认值
- notNull NOT NULL 非空

> ~~如果没有主键，会自动添加主键`usql_id`。~~(已经移除)

#### 调用 API 执行操作
```js
//4.调用API：添加数据
studentModel.insert({name:'张三10',age:30},(err,results)=>{
    console.log(err);
    console.log(results);
    if(!err) console.log('增加成功');
});
```
### API 文档

#### 1.1 增加操作
```js
studentModel.insert({name:'张三10',age:30},(err,results)=>{
    console.log(err);
    console.log(results);
    if(!err) console.log('增加成功');
});
```
**批量增加**
```js
var arr = [];
for (var i = 1; i <= 10; i++) {
    arr.push({ name: '张三', age: 30 })
}

studentModel.insert(arr, (err, results) => {
    console.log(err);
    console.log(results);
    if (!err) console.log('增加成功');
});
```

#### 1.2-查询操作
**1-查询所有数据**
```js
//2.1 查询所有数据
studentModel.find((err,results)=>{
    console.log(results);
});
```

**2-查询数据库指定字段数据**
```js
//2.2 根据数据库字段查询部分数据
// ['name'] : 将要查询的字段放入数组中
studentModel.find(['name'],(err,results)=>{
    console.log(results);
});
```

**3-条件查询**
```js
//2.3 根据条件查询数据
// 'id=1' : 查询id为1的数据 (查询条件可以参考sql语句)
//例如 'age>10' : 查询age超过10的数据 
//例如 'name>"张三"' : 查询名字为张三的数据，注意字符串添加引号
studentModel.find('id>21',(err,results)=>{
    console.log(results);
});
```

**4-分页查询**
```js
//2.4 分页查询
//  第一个参数options对象有三个属性 {where:分页查询条件（可选）， number:页数 ， count：每页数量}
studentModel.limit({where:'age>28',number:1,count:10},(err,results)=>{
    console.log(results);
});
```
#### 1.3-多表查询
> Join 用于结合两个或多个数据库中表的记录。
> 有三种链接形式：
> 交叉连接 - CROSS JOIN 连接的两个表所有数据行的笛卡尔积
> 内连接 - INNER JOIN 只返回 左表在右表中有有匹配的行。
> 外连接 - OUTER JOIN 返回左表所有的行，即使在右表中没有匹配的行
```js
studentModel.join(	// 左表
	resultModel, 	// 右表
	{
		where: 'grade<60',	// 筛选条件
		type: 'inner',		// 链接模式
		predicate: {		// 谓语匹配词语
			left: 'id',
			right: 'id'
		}
	}, 
	function(e, r){
	
	})
```
#### 1.4-修改操作
**1-修改所有数据**
```js
//3.1 将数据库中所有的name字段值：修改为李四
studentModel.update({name:'李四'},(err,results)=>{
    console.log(results);
});
```

**2-条件修改**
```js
//3.2 将数据库中 id = 1 的数据，age修改为30
studentModel.update('id=1',{age:30},(err,results)=>{
    console.log(results);
});

//3.3 将数据库中所有 age < 20 的数据，name修改为王五
studentModel.update('age<20',{name:'王五'},(err,results)=>{
    console.log(results);
});
```

#### 1.5-删除操作
```js
//4.1 删除所有 age>30 的数据
studentModel.delete('age>20',(err,results)=>{
    console.log(results);
});

//4.2 清空表中所有数据
studentModel.delete((err,results)=>{
    console.log(results);
});
```

#### 1.6-执行自定义SQL语句
```js
studentModel.sql('insert into student(name,age) values("andy",20)',(err,results)=>{
    console.log(results);
});
```

#### 1.7-删除表格(慎用)
```js
studentModel.drop((err,results)=>{
    console.log(results);
});
```

#### 1.8-创建表格(慎用)
```js
studentModel.create((err,results)=>{
    console.log(results);
});
```

#### 1.9-数据库是否存在Model对应的数据表(慎用)
```js
studentModel.isExist((err,results)=>{
    console.log(results);
});
```

#### 1.10-链式语法支持
```js
studentModel.insert({name:'张三22',age:22},(err,results)=>{
    console.log(err);
    console.log(results);
})
.find('name="张三22"',(err,results)=>{
    console.log(err);
    console.log(results);
});
```

#### 1.11-表的相关操作 (慎用)
```js
// 8.1 重命名
studentModel.alter('student_bak',(err,results)=>{
    console.log(err);
    console.log(results);
})
// 8.2 新增单列
studentModel.alter({name:'id', option:Number},(err,results)=>{
    console.log(err);
    console.log(results);
})
// 8.3 新增多列
studentModel.alter([
	{name:'id', option:Number}, // option 可以使用约束模式
	{name:'xx', option:Number},
	{name:'xxx', option:Number}
],(err,results)=>{
    console.log(err);
    console.log(results);
})

```
### JS类型转存SQLite时如何处理
> 参考：
> [sqliet数据类型](https://www.runoob.com/sqlite/sqlite-data-types.html)
总结来说就是大部分都转化成了TEXT格式进行存储。
```js
if (option[key] == Number) {
	str += `'${key}' numeric,`;
} else if (option[key] == Date) {
	str += `'${key}' timestamp,`;
} else {
	str += `'${key}' varchar,`;
}
```
**Number**
usqlite 会将`Number`数据类型转换`numeric`,但是sqlite会根据数据是否可逆，转化为`INTEGER`(带符号的整数)或者`REAL`(8 字节的 IEEE 浮点数).
**其他内容**
usqlite 会将其他数据类型转化`varchar`，sqlite会将其转化为`TEXT`。
### Q&A
1. db 文件存放在什么位置？
> 答： 如果是`_doc`的话存放存放位置参考[H5+ Api - PRIVATE_DOC](https://www.html5plus.org/doc/zh_cn/io.html#plus.io.PRIVATE_DOC)。
> 如果是其他路径，请参考[H5+ Api - SQLite](https://www.html5plus.org/doc/zh_cn/sqlite.html#openDatabase)。

2. 后续更新其他api会不会不兼容当然版本？
> 答： 在后续版本中，始终会兼容当前版本。

3. 为什么兼容性这么差，只兼容APP版本吗？后续会不会兼容其他版本？
> 答： 由于**H5+ plus API**限制，当前版本只支持APP，后续版本会兼容其他内容，但是兼容其他版本就不能使用Sqlite，而是使用其他`Storage`或者其他内容进行兼容处理部分api将不支持，特别是自定sql的api。
> 并且这个这些功能会在后期在开发，可能要到年后或者什么时候，我近期开发Sqlite的App可视化插件。



