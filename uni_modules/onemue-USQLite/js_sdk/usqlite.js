/**
 * 处理SQLite SQLite 是 APP 才有的内容 所以 需要同一套API 满足 setStorage 的API
 * 方便多平台开发
 * time：2021-12-16 16:30:00
 * version：1.0.0
 * by: onemue
 */

//数据库配置
let options = {};
let tableSQL = '';
let databaseName = '';
let isConnect = false;

class Model {
	constructor(name, option, db) {
		this.name = name;
		this.option = option;
		this.db = db;
		let self = this;
		self.isExist(function(e, r){
			if (!r) {
				self.create();
			}
		})
	}
	/**
	 * @description: 查询数据
	 * @param {} options：可选参数
	 * @param {Function} callback :（err,results）=>{}
	 */
	find(options, callback) {
		var sql = '';
		let self = this;
		self.repair();
		if (!callback) {
			sql = `SELECT * FROM '${this.name}'`;
			callback = options;
		} else if (options.constructor == Array) {
			sql = `SELECT ${options.join()} FROM '${this.name}'`;
		} else {
			sql = `SELECT * FROM '${this.name}' WHERE ${options}`;
		};
		plus.sqlite.selectSql({
			name: self.db,
			sql: sql,
			success(e) {
				callback(null, e);
			},
			fail(e) {
				callback(e);
			}
		})
		console.log(sql)
		return this;
	}
	/**
	 * @description: 分页查询
	 * @param {Object} options :   { where:查询条件, number: 当前页数 , count : 每页数量 }
	 * @return: 
	 */
	limit(options, callback) {
		var sql = '';
		let self = this;
		self.repair();
		if (!options.where) {
			sql = `SELECT * FROM '${this.name}' LIMIT ${options.count} OFFSET ${(options.number - 1) * options.count}`
		} else {
			sql =
				`SELECT * FROM '${this.name}' WHERE ${options.where} LIMIT ${options.count} OFFSET ${(options.number - 1) * options.count}`;
		};
		plus.sqlite.selectSql({
			name: self.db,
			sql: sql,
			success(e) {
				callback(null, e);
			},
			fail(e) {
				callback(e);
			}
		})
		return this;
	}
	/**
	 * @description: 插入数据
	 * @param {Object} obj:对象或者数组
	 * @param {Function} callback :（err,results）=>{}
	 */
	insert(obj, callback) {
		let self = this;
		self.repair();
		if (!true) {
			// todo
		} else {
			if (Array.isArray(obj)) {
				for (var i = 0; i < obj.length; i++) {
					this.insertObj(obj[i], callback)
				}
			} else {
				this.insertObj(obj, callback)
			}
		}
		return this;
	}

	insertObj(obj, callback) {
		let keys = [];
		let values = '';
		let self = this;
		self.repair();
		for (var key in obj) {
			keys.push(key);
			values += `'${obj[key]}',`;
		};
		values = values.replace(/,$/, '');
		let sql = `INSERT INTO '${this.name}' (${keys.join()}) VALUES (${values})`;
		console.log(sql);
		plus.sqlite.executeSql({
			name: self.db,
			sql: sql,
			success(e) {
				callback(null, e);
			},
			fail(e) {
				callback(e);
			}
		})
		return this;
	}
	/**
	 * @description: 更新数据
	 * @param {Object} option：可选参数 更新条件 // TODO 更新条件
	 * @param {Object} obj： 修改后的数据 
	 * @param {Function} callback :（err,results）=>{}
	 */
	update(option, obj, callback) {
		let sql = '';
		let self = this;
		self.repair();
		if (arguments.length == 2) {
			callback = obj;
			obj = option;
			sql = `UPDATE '${this.name}' SET `;
			for (var key in obj) {
				sql += `${key}='${obj[key]}', `;
			};
			sql = sql.replace(/(, )$/, '');
		} else {
			sql = `UPDATE ${this.name} SET `;
			for (var key in obj) {
				sql += `${key}='${obj[key]}', `;
			};
			sql = sql.replace(/(, )$/, '');
			sql += ` WHERE ${option}`;
		};
		plus.sqlite.executeSql({
			name: self.db,
			sql: sql,
			success(e) {
				callback(null, e);
			},
			fail(e) {
				callback(e);
			}
		})
		return this;
	}
	/**
	 * @description: 删除数据
	 * @param {Object} option：可选参数 删除条件
	 * @param {Function} callback :（err,results）=>{}
	 */
	delete(option, callback) {
		var sql = '';
		let self = this;
		self.repair();
		if (!callback) {
			sql = `DELETE FROM '${this.name}'`;
			callback = option;
		} else {
			sql = `DELETE FROM '${this.name}' WHERE ${option}`;
		};
		plus.sqlite.executeSql({
			name: self.db,
			sql: sql,
			success(e) {
				callback(null, e);
			},
			fail(e) {
				callback(e);
			}
		})
		return this;
	}
	/**
	 * @description:  重命名或者新增列
	 * @param {Object} option：参数 数组为新增多列 对象为新增单列{aa} 字符串重命名
	 * @param {Function} callback :（err,results）=>{}
	 * @return: 
	 */
	alter(option, callback) {
		let self = this;
		let sql = '';
		if(option.constructor == Array){		// 新增多列
			for (let i = 0; i < option.length; i++) {
				self.alter(option[i], callback);
			}
		}
		else if(option.constructor == Object){	// 新增单列
			let column = '';
			if (option.option == Number) {
				column += `'${option.name}' numeric,`;
			} else if (option.option == Date) {
				column += `'${option.name}' timestamp,`;
			} else if (Object.prototype.toString.call(option.option) === '[object Object]') {
				const THIS_VALUE = option.option;
				let cols = [];
				if (THIS_VALUE.type == Number) {
					console.log(`'${option.name}' numeric`);
					cols.push(`'${option.name}' numeric`);
				} else if (THIS_VALUE.type == Date) {
					console.log(`'${option.name}' timestamp`);
					cols.push(`'${option.name}' timestamp`);
				} else {
					console.log(`'${option.name}' varchar`);
					cols.push(`'${option.name}' varchar`);
				}
			
				// 是否允许为空
				if(THIS_VALUE.notNull==true){
					console.log(` NOT NULL`);

					cols.push(' NOT NULL');
				}
			
				// 默认值
				if(THIS_VALUE.default){
					console.log(` DEFAULT ${THIS_VALUE.default}`);
			
					cols.push(` DEFAULT ${THIS_VALUE.default}`);
				}
			
				// 是否是不同的值
				if(THIS_VALUE.unique ==true){
					console.log(` UNIQUE`);
			
					cols.push(' UNIQUE');
				}
			
				// 主键
				if(THIS_VALUE.primaryKey==true){
					console.log(` PRIMARY KEY`);
			
					cols.push(' PRIMARY KEY');
				}
			
				// 检查
				if(THIS_VALUE.check){
					console.log(` CHECK(${THIS_VALUE.check})`);
			
					cols.push(` CHECK(${THIS_VALUE.check})`);
				}
				cols.push(',');
				console.log(sqls.join(''));
			
				column += sqls.join('');
			} else {
				column += `'${option.name}' varchar,`;
			}
			column = column.replace(/,$/, '');
			sql = `ALTER TABLE '${this.name}' ADD COLUMN ${column}`
		}
		else if(option.constructor == String){	// 重命名
			sql = `ALTER TABLE '${self.name}' RENAME TO '${option}'`
		}
		
		plus.sqlite.selectSql({
			name: self.db,
			sql: sql,
			success(e) {
				if(option.constructor == String){	// 重命名
					self.name = option;
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
	 * @description: 执行sql语句
	 * @param {String} sql : sql语句
	 * @param {Function} callback :（err,results）=>{}
	 */
	sql(sql, callback) {
		let self = this;
		self.repair();
		plus.sqlite.selectSql({
			name: self.db,
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
	 * @description: 删除model表格 （慎用！）
	 * @param {type} 
	 * @return: 
	 */
	drop(callback) {
		var sql = `DROP TABLE '${this.name}'`;
		let self = this;
		plus.sqlite.selectSql({
			name: self.db,
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

	connect(callback) {
		let sql = `SELETE count(*) AS isTable FROM sqlite_master WHERE type='table' AND name='${this.name}'`;
		let self = this;
		plus.sqlite.selectSql({
			name: self.db,
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
	 * 判断是否存在
	 * @param {Object} callback 
	 */
	isExist(callback) {
		let self = this;
		// return new Promise((resolve, reject) => {
			plus.sqlite.selectSql({
				name: self.db,
				sql: `select count(*) as isExist FROM sqlite_master where type='table' and name='${this.name}'`,
				success(e) {
					callback(null, e[0].isExist ? true : false)
				},
				fail(e) {
					console.log(e)
					callback(e)
					// reject(e);
				}
			})
		return this;
	}

	create(callback) {
		let self = this;
		this.tableSQL = usqlite.modelSql(self.name, self.option);
		plus.sqlite.executeSql({
			name: self.db,
			sql: self.tableSQL,
			success(e) {
				callback(null, e);
			},
			fail(e) {
				callback(e)
			}
		})
		return this;
	}
	
	repair(){
		let self = this;
		self.isExist(function(e, r){
			if (!r) {
				self.create();
			}
		})
	}
}


usqlite = {
	/**
	 * @description:连接数据库
	 * @param {String} name: 数据库名称*
	 * @param {String} path: 数据库路径*
	 * @param {Function} callback :（err,results）=>{}
	 * @return: 
	 */
	connect({
		name = '',
		path = ''
	}, callback) {
		options = {
			name, // 数据库名称*
			path, // 数据库路径*
		};
		plus.sqlite.openDatabase({
			name: options.name, //数据库名称
			path: options.path, //数据库地址
			success(e) {
				isConnect = true;
				callback(null, e);
			},
			fail(e) {
				callback(e);
			}
		})
	},
	/**
	 * @description:关闭数据库
	 * @param {Function} callback :（err,results）=>{}
	 * @return: 
	 */
	close(callback) {
		plus.sqlite.closeDatabase({
			name: options.name, //数据库名称
			path: options.path, //数据库地址
			success(e) {
				isConnect = false;
				callback(null, e);
			},
			fail(e) {
				callback(e);
			}
		});
	},
	/**
	 * @description:创建model (表格模型对象)
	 * @param {String} name:表格名称
	 * @param {Object} options:表格数据结构 
	 * @return: Model对象：负责数据库增删改查
	 */
	model(name, option) {
		return new Model(name, option, options.name);
	},
	/**
	 * @description 生成创建model的modelSql
	 * @param {Object} name
	 * @param {Object} option
	 */
	modelSql(name, option) {
		let isHasPRIMARY_Key = false; 
		let str = ''; // usql_id 为自增主键
		for (var key in option) {
			if (option[key] == Number) {
				str += `'${key}' numeric,`;
			} else if (option[key] == Date) {
				str += `'${key}' timestamp,`;
			} else if (Object.prototype.toString.call(option[key]) === '[object Object]') {
				const THIS_VALUE = option[key];
				let sqls = [];
				// THIS_VALUE.type = getSqlType();
				if (THIS_VALUE.type == Number) {
					console.log(`'${key}' numeric`);
					sqls.push(`'${key}' numeric`);
				} else if (THIS_VALUE.type == Date) {
					console.log(`'${key}' timestamp`);
					sqls.push(`'${key}' timestamp`);
				} else {
					console.log(`'${key}' varchar`);
					sqls.push(`'${key}' varchar`);
				}

				// 是否允许为空
				if(THIS_VALUE.notNull==true){
					console.log(` NOT NULL`);

					sqls.push(' NOT NULL');
				}

				// 默认值
				if(THIS_VALUE.default){
					console.log(` DEFAULT ${THIS_VALUE.default}`);

					sqls.push(` DEFAULT ${THIS_VALUE.default}`);
				}

				// 是否是不同的值
				if(THIS_VALUE.unique ==true){
					console.log(` UNIQUE`);

					sqls.push(' UNIQUE');
				}

				// 主键
				if(THIS_VALUE.primaryKey==true){
					isHasPRIMARY_Key = true;
					console.log(` PRIMARY KEY`);

					sqls.push(' PRIMARY KEY');
				}

				// 检查
				if(THIS_VALUE.check){
					console.log(` CHECK(${THIS_VALUE.check})`);

					sqls.push(` CHECK(${THIS_VALUE.check})`);
				}
				sqls.push(',');
				console.log(sqls.join(''));

				str+= sqls.join('');
			} else {
				str += `'${key}' varchar,`;
			}
		};
		// 如果没有主键 就添加主键
		// if (!isHasPRIMARY_Key) {
		// 	str = '`usql_id` integer PRIMARY KEY,'+str; // usql_id 为自增主键
		// }
		str = str.replace(/,$/, '');
		console.log(`CREATE TABLE '${name}' (${str})`);
		return `CREATE TABLE '${name}' (${str})`;
	}
}


export var usqlite;
