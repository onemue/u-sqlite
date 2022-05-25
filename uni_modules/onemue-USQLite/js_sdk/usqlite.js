/**
 * 对 SQLite 的 ORM 的封装处理
 * @time 2021-12-30 11:00:00
 * @version 2.0.0
 * 
 * @by onemue
 */

 let config = {
	deBug: true,
	isConnect: false
}
class Response {
	constructor(code, msg, data) {
		this.code = code;
		this.msg = msg;
		this.data = data;
	}
	toString() {
		return JSON.stringify(this);
	}
}

class Utils {
	static modelSql(name, options) {
		let sql;
		let sqlArr = [];
		let primaryKeyArr = [];
		Utils.log('options:' + options);
		for (const key in options) {
			if (Object.hasOwnProperty.call(options, key)) {
				const option = options[key];
				sqlArr.push(Utils.restrain(key, option));
				if (option.primaryKey == true) {
					primaryKeyArr.push(key.toString());
					Utils.log(`${key} is primary key${primaryKeyArr.length}`);
				}
			}
		}
		
		Utils.log(primaryKeyArr.length);
		if (primaryKeyArr.length>1) {
			
			sql = `CREATE TABLE '${name}' (${sqlArr.join(', ').replaceAll(' PRIMARY KEY','')}, PRIMARY KEY (${primaryKeyArr.join()}))`;
		}
		else{
			sql = `CREATE TABLE '${name}' (${sqlArr.join(', ')})`;
		}
		Utils.log(`modelSql :${sql}`);
		return sql;
	}

	static restrain(key, options) {

		let restrainArray = [];
		restrainArray.push(`'${key}'`);

		// 如果是 String 拦截处理
		if (options.constructor != Object) {
			restrainArray.push(Utils.toType(options));
			return restrainArray.join(' ');
		}

		restrainArray.push(Utils.toType(options.type));
		
		// 主键
		if (options.primaryKey == true) {
			if(options.autoIncrement != true){
				restrainArray.push('PRIMARY KEY');
			}
		}
		
		// 自增
		if (Utils.isNumber(options.type)&&options.autoIncrement == true) {
			restrainArray.pop();
			restrainArray.push('INTEGER');
			restrainArray.push('PRIMARY KEY');
			restrainArray.push('AUTOINCREMENT');
		}
		
		// 非空
		if (options.notNull == true) {
			restrainArray.push('NOT NULL');
		}

		// 默认值
		if (options.default) {
			restrainArray.push(`DEFAULT ${options.default}`);
		}

		// 是否是不同的值
		if (options.unique == true) {
			restrainArray.push('UNIQUE');
		}


		// 检查
		if (options.check) {
			restrainArray.push(`CHECK(${THIS_VALUE.check})`);
		}

		return restrainArray.join(' ');
	}

	static toType(jsType) {
		let sqliteType = '';
		if (Utils.isNumber(jsType)) {
			sqliteType = 'numeric';
		} else if (Utils.isDate(jsType)) {
			sqliteType = 'timestamp';
		} else {
			sqliteType = 'varchar';
		}
		return sqliteType;
	}
	
	static log() {
		if (config.deBug) {
			console.log.apply(null, arguments);
		}
	}
	
	static warn() {
		if (config.deBug) {
			console.warn.apply(null, arguments);
		}
	}
	
	static error() {
		console.error.apply(null, arguments);
	}
	
	static isArray(value){ return Object.prototype.toString.call(value) === '[object Array]'}
	static isObject(value){ return Object.prototype.toString.call(value) === '[object Object]'}
	static isString(value){ return Object.prototype.toString.call(value) === '[object String]'}
	static isFunction(value){ return (value === Function || Object.prototype.toString.call(value) === '[object Function]')}
	static isNumber(value){ return (value === Number || Object.prototype.toString.call(value) === '[object Number]')}
	static isNaN(value){ return (Object.prototype.toString.call(value) === '[object Number]' && isNaN(value))}
	static isBoolean(value){ return Object.prototype.toString.call(value) === '[object Boolean]'}
	static isUndefined(value){ return Object.prototype.toString.call(value) === '[object Undefined]'}
	static isModel(value){ return Object.prototype.toString.call(value) === '[object Model]'}
	static isDate(value){ return (value === Date||Object.prototype.toString.call(value) === '[object Date]')}
}


/**
 * Model 对象内部public方法全部 return this;
 */
class Model {
	/**
	 * @constructor
	 * @param {String} name 数据库表名
	 * @param {} options 数据表列对象
	 * @returns 
	 */
	constructor(name, options) {
		let self = this;
		self.name = name;
		self.options = options;

		if (config.isConnect) {
			self.repair();
		} else {
			if(!config.name||!config.path){
				console.error('"config.name" or "config.path" is empty');
			}
			usqlite.connect(config);
		}
	}

	/**
	 * @description 查询表数据
	 * @param {String|Array} options 
	 * - String  WHERE 内容
	 * - Array 需要查询的列
	 * @param {Function} callback 
	 * @returns 
	 */
	find(options, callback) {
		let sql = '';
		let self = this;
		self.repair();
		if(!(Utils.isString(options)||Utils.isArray(options)||Utils.isFunction(options))) {
			Utils.error('The first parameter of Model.find should be "Array", "String" or "Function" (when there is only one parameter).')
		}
		if(!callback&&!(Utils.isFunction(options))) {
			Utils.error('The second parameter of Model.find should be "Function".')
		}
		if (!callback&&Utils.isFunction(options)) {
			sql = `SELECT * FROM '${this.name}'`; // 查找全部
			callback = options;
		} else if (Utils.isArray(options)) {
			sql = `SELECT ${options.join()} FROM '${this.name}'`; // 查找制定列
		} else if (Utils.isString(options)) {
			sql = `SELECT * FROM '${this.name}' WHERE ${options}`; // 制定条件查询
		}

		Utils.log(`find: ${sql}`);

		plus.sqlite.selectSql({
			name: config.name,
			sql: sql,
			success(e) {
				callback(null, e);
			},
			fail(e) {
				callback(e);
			}
		});

		return self;
	}

	/**
	 * @description 分页查询
	 * @param {Object} options :   { where:查询条件, number: 当前页数 , count : 每页数量 }
	 * @param {Function} callback :（err,results）=>{} 
	 * @return
	 */
	limit(options, callback) {
		let sql = '';
		let self = this;
		self.repair();
		if(!Utils.isObject(options)){
			Utils.error('The first parameter of Model.limit should be "Object".')
		}
		if(!Utils.isFunction(callback)){
			Utils.error('The second parameter of Model.limit should be "Function".')
		}
		
		if (!options.where) {
			// 不存在 where
			sql =
				`SELECT * FROM '${this.name}' LIMIT ${options.count} OFFSET ${(options.number - 1) * options.count}`
		} else {
			// 存在 where
			sql =
				`SELECT * FROM '${this.name}' WHERE ${options.where} LIMIT ${options.count} OFFSET ${(options.number - 1) * options.count}`;
		};

		Utils.log(`limit: ${sql}`);

		plus.sqlite.selectSql({
			name: config.name,
			sql: sql,
			success(e) {
				callback(null, e);
			},
			fail(e) {
				callback(e);
			}
		});
		return this;
	}

	/**
	 * @description 插入数据
	 * @param {Object|Array} options: 需要插入的单个或者多个数据
	 * @param {Function} callback :（err,results）=>{}
	 */
	insert(options, callback) {
		let self = this;
		self.repair();

		if(!(Utils.isObject(options)||Utils.isArray(options))){
			Utils.error('The first parameter of Model.insert should be "Object" or "Array".')
		}
		if(!Utils.isFunction(callback)){
			Utils.error('The second parameter of Model.insert should be "Function".')
		}
		
		if (config.isConnect) {
			if (Utils.isArray(options)) {
				self.bulkInsert(options).then(function (params) {
					callback(null, params);
				}).catch(function (err) {
					callback(err);
				})
			} else if (Utils.isObject(options)) {
				let keys = [];
				let values = [];
				let index = arguments[3]??null;
				for (var key in options) {
					if (!Object.hasOwnProperty.call(self.options, key)) {
						Utils.warn(`The parameter '${key}' was not declared in the Model, is not stored in the database.`)
						continue;
					}
					keys.push(key);
					values.push(`'${options[key]}'`);
				}

				let sql = `INSERT INTO '${this.name}' (${keys.join()}) VALUES (${values.join()})`;

				Utils.log(`insert: ${sql}`);
				plus.sqlite.executeSql({
					name: config.name,
					sql: sql,
					success(e) {
						if(index){
							callback(null, e, options, index);
						}
						callback(null, e, options);
					},
					fail(e) {
						if(index){
							callback(e, null, options, index);
						}
						callback(e, null, options);
					}
				})
			}
		}
		return this;
	}


	bulkInsert(array, callback){
		let sql = '';
		let self = this;
		self.repair();
		if(!Utils.isArray(array)){
			Utils.error('The first parameter of Model.bulkInsert should be "Array".')
		}
		if(!Utils.isFunction(callback)){
			Utils.error('The second parameter of Model.bulkInsert should be "Function".')
		}
		await self.beginTransaction();

		try {
			for (var i = 0; i < options.length; i++) {
				self.insert(options[i], callback, i);
			}
			await self.commitTransaction();
		} catch (error) {
			await self.rollbackTransaction();
			callback(error);
		}
	}

	/**
	 * @description 更新数据
	 * @param {String} options：可选参数 更新条件
	 * @param {Object} obj： 修改后的数据 
	 * @param {Function} callback :（err,results）=>{}
	 */
	update(options, obj, callback) {
		let sql = '';
		let self = this;
		let items = [];
		self.repair();
		
		if(!(Utils.isObject(options)||Utils.isString(options))){
			Utils.error('The first parameter of Model.update should be "Object" or "String".')
		}
		if(!(Utils.isObject(obj)||Utils.isFunction(obj))){
			Utils.error('The second parameter of Model.update should be "Objrct" or "Function".')
		}
		
		if (!callback) {
			// 不存在options
			callback = obj;
			obj = options;

			for (var key in obj) {
				items.push(`${key}='${obj[key]}'`);
			};
			sql = `UPDATE '${this.name}' SET ${items.join()}`;
		} else {
			// 存在options
			for (var key in obj) {
				items.push(`${key}='${obj[key]}'`);
			};
			sql = `UPDATE ${this.name} SET ${items.join()} WHERE ${options}`;
		};
		Utils.log(`update: ${sql}`);
		plus.sqlite.executeSql({
			name: config.name,
			sql: sql,
			success(e) {
				callback(null, e);
			},
			fail(e) {
				callback(e);
			}
		});

		return this;
	}

	/**
	 * @description 删除数据
	 * @param {String} options ：可选参数 删除条件
	 * @param {Function} callback :（err,results）=>{}
	 */
	delete(options, callback) {
		var sql = '';
		let self = this;
		self.repair();
		
		if(!(Utils.isString(options)||Utils.isFunction(options))){
			Utils.error('The first parameter of Model.delete should be "Object" or "Function".')
		}
		if(callback&&!Utils.isFunction(callback)){
			Utils.error('The second parameter of Model.delete should be "Function".')
		}

		if (!callback) {
			sql = `DELETE FROM '${this.name}'`;
			callback = options;
		} else {
			sql = `DELETE FROM '${this.name}' WHERE ${options}`;
		};
		Utils.log(`delete: ${sql}`);
		plus.sqlite.executeSql({
			name: config.name,
			sql: sql,
			success(e) {
				callback(null, e);
			},
			fail(e) {
				callback(e);
			}
		});

		return this;
	}


	/**
	 * @description  重命名或者新增列
	 * @param {Object|Array|String} options 参数 数组为新增多列 对象为新增单列{aa} 字符串重命名
	 * @param {Function} callback :（err,results）=>{}
	 * @return: 
	 */
	alter(options, callback) {
		let self = this;
		let sql = '';
		self.repair();
		if(!(Utils.isObject(options)||Utils.isArray(options)||Utils.isString(options))){
			Utils.error('The first parameter of Model.alter should be "Object", "Array" or "String".')
		}
		if(!Utils.isFunction(callback)){
			Utils.error('The second parameter of Model.alter should be "Function".')
		}
		
		if (Utils.isArray(options)) { // 新增多列
			for (let i = 0; i < options.length; i++) {
				self.alter(options[i], callback);
			}
		} else if (Utils.isObject(options)) { // 新增单列
			let column = Utils.restrain(options.name, options.option);
			sql = `ALTER TABLE '${this.name}' ADD COLUMN ${column}`
		} else if (options.constructor == String) { // 重命名
			sql = `ALTER TABLE '${self.name}' RENAME TO '${options}'`
		}
		Utils.log(`alter: ${sql}`);
		plus.sqlite.selectSql({
			name: config.name,
			sql: sql,
			success(e) {
				if (options.constructor == String) { // 重命名
					self.name = options;
				}
				callback(null, e);
			},
			fail(e) {
				callback(e);
			}
		});
		return this;
	}
	/**
	 * @description 
	 * @param {Model} model 右 Model
	 * @param {Object} options 
	 * @param {Function} callback 
	 * @returns 
	 */
	join(model, options, callback) {
		if (!model) {
			Utils.error('"model" cannot be empty.');
		}
		if (!Utils.isObject(options)) {
			Utils.error('The type of "options" is wrong, it should be "Object".');
		}
		if (!options.type || !options.predicate) {
			Utils.error('Missing required parameters');
		}

		let leftName = this.name;
		let rightName = model.name;
		let leftValue = options.predicate.left;
		let rightValue = options.predicate.right;
		let cols = ['*'];
		self.repair();

		const SQL_MAP = {
			cross: `SELECT ${cols.join()} FROM ${leftName} CROSS JOIN ${rightName};`,
			inner: [`SELECT ${cols.join()} FROM ${leftName} NATURAL JOIN ${rightName}`,
			`SELECT ${cols.join()} FROM ${leftName}  INNER JOIN ${rightName} ON ${leftName}.${leftValue} = ${rightName}.${rightValue}`
			],
			outer: `SELECT ${cols.join()} FROM ${leftName}  OUTER JOIN ${rightName} ON ${leftName}.${leftValue} = ${rightName}.${rightValue}`
		}

		let sql = '';
		if (options.type == inner && !options.predicate) {
			sql = SQL_MAP[options.type][0];
		} else if (options.type == inner && !options.predicate) {
			sql = SQL_MAP[options.type][1];
		} else {
			sql = SQL_MAP[options.type];
		}

		Utils.log(`join: ${sql}`);
		plus.sqlite.selectSql({
			name: config.name,
			sql: sql,
			success(e) {
				callback(null, e);
			},
			fail(e) {
				callback(e);
			}
		});
		return this;
	}

	// TODO Transaction 
	/**
	 * @param {String} control 事务控制
	 * @param {Function} callback 回调函数
	 */
	transaction(control, callback){
		let self = this;

		if(!Utils.isString(control)){
			Utils.error('The first parameter of Model.transaction should be "String".')
		}
		if(!Utils.isFunction(callback)){
			Utils.error('The second parameter of Model.transaction should be "Function".')
		}

		if (control === 'begin'||control === 'start') {
			self.beginTransaction().then(()=>{
				callback(null);
			}
			).catch(e=>{
				callback(e);
			});
		} 
		else if (control === 'commit'||control === 'end') {
			self.commitTransaction().then(()=>{
				callback(null);
			}
			).catch(e=>{
				callback(e);
			});
		}
		else if (control === 'rollback'||control === 'cancel') {
			self.rollbackTransaction().then(()=>{
				callback(null);
			}
			).catch(e=>{
				callback(e);
			});
		}
		else {
			// 提示错误 control参数错误 应该为begin|commit|rollback
			Utils.error('Parameter "control" is wrong, should be "begin|commit|rollback"');
		}
	}
	
	/**
	 * beginTransaction 开启事务
	 * @returns {Promise}
	 */
	async beginTransaction(){
		return await new Promise(function(resolve, reject){
			plus.sqlite.transaction({
				name: config.name,
				operation: 'begin',
				success: function(e){
					resolve();
				},
				fail: function(e){
					reject(e);
				}
			});
		})
	}
	
	/**
	 * commitTransaction 提交事务
	 * @returns {Promise}
	 */
	async commitTransaction(){
		return await new  Promise(function(resolve, reject){
			plus.sqlite.transaction({
				name: config.name,
				operation: 'commit',
				success: function(e){
					resolve();
				},
				fail: function(e){
					reject(e);
				}
			});
		})
	}
	
	/**
	 * rollbackTransaction 回滚事务
	 * @returns {Promise}
	 */
	async rollbackTransaction(){
		return await new Promise(function(resolve, reject){
			plus.sqlite.transaction({
				name: config.name,
				operation: 'rollback',
				success: function(e){
					resolve();
				},
				fail: function(e){
					reject(e);
				}
			});
		})
	}
	
	/**
	 * @description 执行sql语句
	 * @param {String} sql : sql语句
	 * @param {Function} callback :（err,results）=>{}
	 */
	sql(sql, callback) {
		if (!Utils.isString(sql)) {
			Utils.error('"The type of "sql" is wrong, it should be "String".');
		}
		if (callback&&!Utils.isFunction(callback)) {
			Utils.error('The type of "callback" is wrong, it should be "Function".');
		}
		
		let self = this;
		self.repair();

		Utils.log(`sql: ${sql}`);
		plus.sqlite.selectSql({
			name: config.name,
			sql: sql,
			success(e) {
				callback(null, e);
			},
			fail(e) {
				callback(e);
			}
		});
		return this;
	}

	/**
	 * @description 判断是否存在 
	 * @param {Function} callback 
	 */
	isExist(callback) {
		if (callback&&!Utils.isFunction(callback)) {
			Utils.error('The type of "callback" is wrong, it should be "Function".');
		}
		
		let sql = `SELECT count(*) AS isExist FROM sqlite_master WHERE type='table' AND name='${this.name}'`;
		let self = this;
		Utils.log(`isExist: ${sql}`);
		Utils.log(`isExist: ${config.name}`);
		plus.sqlite.selectSql({
			name: config.name,
			sql: sql,
			success(e) {
				callback(null, e);
			},
			fail(e) {
				callback(e);
			}
		});
		return this;
	}
	/**
	 * @description 删除数据表 **不推荐**
	 * @param {Function} callback 
	 */
	drop(callback) {
		if (callback&&!Utils.isFunction(callback)) {
			Utils.error('The type of "callback" is wrong, it should be "Function".');
		}
		
		var sql = `DROP TABLE '${this.name}'`;
		let self = this;
		self.repair();

		Utils.log(`drop: ${sql}`);
		plus.sqlite.selectSql({
			name: config.name,
			sql: sql,
			success(e) {
				callback(null, e);
			},
			fail(e) {
				callback(e);
			}
		});
		return this;
	}

	/**
	 * @description 创建数据表 **不推荐**
	 * @param {Function} callback 
	 */
	create(callback) {
		if (callback&&!Utils.isFunction(callback)) {
			Utils.error('The type of "callback" is wrong, it should be "Function".');
		}
		
		let self = this;
		let sql = Utils.modelSql(self.name, self.options);
		Utils.log(`create: ${sql}`);
		plus.sqlite.executeSql({
			name: config.name,
			sql: sql,
			success(e) {
				callback(null, e);
			},
			fail(e) {
				callback(e)
			}
		});
		return this;
	}

	toString() {
		return `[${this.name} Model]`;
	}

	repair() {
		let self = this;
		self.isExist(function (e, r) {
			if (e) {
				console.error(e);
			}

			if (!r[0].isExist) {
				self.create(function (e, r) {
					Utils.log(e, r);
				});
			}
		});
	}
	
}


// 单例模式
export class usqlite {
	/**
	 * 构造函数
	 * @param {Object} options 数据库配置信息 *
	 * {name: 'demo', path: '_doc/demo.db'}
	 * - name 数据库名称*
	 * - path 数据库路径
	 * @param {Function} callback 
	 */
	constructor(options, callback) {
		console.warn('No instantiation');
	}
	/**
	 * @description 链接数据库
	 * @param {Object} options 数据库配置信息 *
	 * {name: 'demo', path: '_doc/demo.db'}
	 * - name 数据库名称*
	 * - path 数据库路径
	 * @param {Function} callback 
	 */
	static connect(options, callback) {
		config.name = options.name; // 数据库名称*
		config.path = options.path; // 数据库名称*

		plus.sqlite.openDatabase({
			name: config.name, //数据库名称
			path: config.path, //数据库地址
			success(e) {
				config.isConnect = true;
				callback(null, e);
			},
			fail(e) {
				if (e.code == -1402) {
					config.isConnect = true;
				}
				callback(e);
			}
		});
	}
	
	/**
	 * @description 断开数据库
	 * @param {*} callback 
	 */
	static close(callback) {
		plus.sqlite.closeDatabase({
			name: config.name, //数据库名称
			path: config.path, //数据库地址
			success(e) {
				config.isConnect = false;
				callback(null, e);
			},
			fail(e) {
				callback(e);
			}
		});
	}

	/**
	 * @description 创建 Model 对象
	 * @example
	 * usqlite.model('demo',
	 * {
	 * 		id: {
	 * 					type:Number
	 * 				},
	 * 		content: String
	 * })
	 * @param {String} name 数据表名称 *
	 * @param {String} options 参数配置 *
	 * @returns 返回 Model 对象
	 */
	static model(name, options) {
		Utils.log(config);
		return new Model(name, options);
	}
}
