import { usqlite } from "./usqlite"

/**
 * 对 SQLite 的 ORM 的封装处理
 * @time 2021-12-16 16:30:00
 * @version 1.0.0
 * 
 * @by onemue
 */
let config = {}


/**
 * Model 对象内部public方法全部 return this;
 */
class Model{
  /**
   * 
   * @param {String} name 数据库表名
   * @param {Object} options 数据表列对象
   * @returns 
   */
  constructor(name, options){
    return this;
  }

  /**
   * 查询表数据
   * @param {String|Array} options 
   * - String  WHERE 内容
   * - Array 需要查询的列
   * @param {*} callback 
   * @returns 
   */
  find(options, callback){
    return this;
  }

  /**
	 * @description: 分页查询
	 * @param {Object} options :   { where:查询条件, number: 当前页数 , count : 每页数量 }
	 * @param {Function} callback :（err,results）=>{} 
   * @return
	 */
	limit(options, callback) {
    return this;
  }
  
  /**
	 * @description: 插入数据
	 * @param {Object|Array} options: 需要插入的单个或者多个数据
	 * @param {Function} callback :（err,results）=>{}
	 */
	insert(options, callback){
    return this;
  }

  /**
	 * @description: 更新数据
	 * @param {Object} options：可选参数 更新条件
	 * @param {Object} obj： 修改后的数据 
	 * @param {Function} callback :（err,results）=>{}
	 */
	update(options, obj, callback) {

  }

  /**
	 * @description: 删除数据
	 * @param {Object} options ：可选参数 删除条件
	 * @param {Function} callback :（err,results）=>{}
	 */
	delete(options, callback) {
    return this;
  }


  /**
	 * @description:  重命名或者新增列
	 * @param {Object} options 参数 数组为新增多列 对象为新增单列{aa} 字符串重命名
	 * @param {Function} callback :（err,results）=>{}
	 * @return: 
	 */
	alter(options, callback) {
    return this;
  }

  /**
	 * @description: 执行sql语句
	 * @param {String} sql : sql语句
	 * @param {Function} callback :（err,results）=>{}
	 */
	sql(sql, callback) {
    return this;
  }

  /**
	 * 判断是否存在
	 * @param {Function} callback 
	 */
	isExist(callback) {
    return this;
  }
  /**
   * 删除数据表 **不推荐**
   * @param {Function} callback 
   */
	drop(callback) {
    return this;
  }

  /**
   * 创建数据表 **不推荐**
   * @param {Function} callback 
   */
  create(callback) {
    return this;
  }

  // TODO 更新表结构
  // TODO 数据表备份?? 
  // TODO 多表联查
  // TODO 下班了其他的想不起来 回头再说
}


// 单例模式
class Usqlite{
  /**
   * 构造函数
   * @param {Object} options 数据库配置信息 *
   * {name: 'demo', path: '_doc/demo.db'}
   * - name 数据库名称*
   * - path 数据库路径
   * @param {Function} callback 
   */
  constructor(options, callback){
    // TODO 构造函数
  }
  /**
   * 链接数据库
   * @param {Object} options 数据库配置信息 *
   * {name: 'demo', path: '_doc/demo.db'}
   * - name 数据库名称*
   * - path 数据库路径
   * @param {Function} callback 
   */
  connect(options, callback){
    // TODO 链接数据库
  }
  /**
   * 断开数据库
   * @param {*} callback 
   */
  close(callback){
    // TODO 断开数据库
  }
  /**
   * 创建 Model 对象
   * @param {String} name 数据表名称 *
   * @param {String} options 参数配置 *
   * @returns 返回 Model 对象
   */
  model(name, options){
    // TODO 断开数据库
    return Model(name, options);
  }
}

export let usqlite = new Usqlite();