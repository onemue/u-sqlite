/**
 * 对 SQLite 的 ORM 的封装处理
 * @time 2021-12-16 16:30:00
 * @version 1.0.0
 * 
 * @by onemue
 */
let config = {
  deBug: true,
  isConnect: false
}

class Response{
  constructor(code, msg, data) {
    this.code = code;
    this.msg = msg;
    this.data = data;
  }
  toString(){
    return JSON.stringify(this);
  }
}

class Utils{
  static modelSql(name, options){
    let sql = [];
    for (const key in options) {
      if (Object.hasOwnProperty.call(options, key)) {
        const option = options[key];
        sql.push(Utils.restrain(key, option));
      }
    }
    return `CREATE TABLE '${name}' (${sql.join(', ')})`;
  }

  static restrain(key, options){

    let restrainArray = [];
    restrainArray.push(`'${key}'`);

    // 如果是 String 拦截处理
    if (options.constructor != Object) {
      restrainArray.push(Utils.toType(options));
      return restrainArray.join(' ');
    }
    
    restrainArray.push(Utils.toType(options.type));
    // 非空
    if(options.notNull==true){
      restrainArray.push('NOT NULL');
    }

    // 默认值
    if(options.default){
      restrainArray.push(`DEFAULT ${options.default}`);
    }

    // 是否是不同的值
    if(options.unique ==true){
      restrainArray.push('UNIQUE');
    }

    // 主键
    if(options.primaryKey==true){
      restrainArray.push('PRIMARY KEY');
    }

    // 检查
    if(options.check){
      restrainArray.push(`CHECK(${THIS_VALUE.check})`);
    }

    return restrainArray.join(' ');
  }

  static toType(jsType){
    let sqliteType = '';
    if (jsType == Number) {
      sqliteType = 'numeric';
    }
    else if(jsType == Date){
      sqliteType = 'timestamp';
    }
    else{
      sqliteType = 'varchar';
    }
    return sqliteType;
  }
  static log(){
    if (config.deBug) {
      console.log.apply(this, arguments);
    }
  }
}


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
		let self = this;
    self.name = name;
    self.options = options;

    if (config.isConnect) {
      self.isExist(function(e, r){
        if (e) {
          console.error(e);
        }
        if (!r) {
          self.create();
        }
      });
    } else {
      console.error('no connect');
    }
    return self;
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
    let sql = '';
		let self = this;

    if (!callback) {
			sql = `SELECT * FROM '${this.name}'`;// 查找全部
			callback = options;
		} else if (options.constructor == Array) {
			sql = `SELECT ${options.join()} FROM '${this.name}'`; // 查找制定列
		} else if (options.constructor == String) {
			sql = `SELECT * FROM '${this.name}' WHERE ${options}`; // 制定条件查询
		};

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
	 * @description: 分页查询
	 * @param {Object} options :   { where:查询条件, number: 当前页数 , count : 每页数量 }
	 * @param {Function} callback :（err,results）=>{} 
   * @return
	 */
	limit(options, callback) {
    let sql = '';
		let self = this;

		if (!options.where) {
      // 不存在 where
			sql = `SELECT * FROM '${this.name}' LIMIT ${options.count} OFFSET ${(options.number - 1) * options.count}`
		} else {
      // 存在 where
			sql = `SELECT * FROM '${this.name}' WHERE ${options.where} LIMIT ${options.count} OFFSET ${(options.number - 1) * options.count}`;
		};

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
    return this;
  }
  
  /**
	 * @description: 插入数据
	 * @param {Object|Array} options: 需要插入的单个或者多个数据
	 * @param {Function} callback :（err,results）=>{}
	 */
	insert(options, callback){
    let self = this;
		if (config.isConnect) {
			if (options.constructor == Array) {
				for (var i = 0; i < options.length; i++) {
					this.insert(options[i], callback)
				}
			} 
      else if (options.constructor == Object) {
        let keys = [];
        let values = [];
		    for (var key in options) {
          keys.push(key);
          values.push(options[key]);
        }

		    let sql = `INSERT INTO '${this.name}' (${keys.join()}) VALUES (${values.join()})`;

        plus.sqlite.executeSql({
          name: config.name,
          sql: sql,
          success(e) {
            callback(null, e);
          },
          fail(e) {
            callback(e);
          }
        })
			}
		}
    return this;
  }

  /**
	 * @description: 更新数据
	 * @param {Object} options：可选参数 更新条件
	 * @param {Object} obj： 修改后的数据 
	 * @param {Function} callback :（err,results）=>{}
	 */
	update(options, obj, callback) {
    let sql = '';
		let self = this;
    let items = [];

		if (!callback) {
      // 不存在options
			callback = obj;
			obj = options;
			
			for (var key in obj) {
        items.push(`${key}='${obj[key]}`);
			};
      sql = `UPDATE '${this.name}' SET ${items.join()}`;
		} else {
      // 存在options
			for (var key in obj) {
        items.push(`${key}='${obj[key]}`);
			};
			sql = `UPDATE ${this.name} SET ${items.join()} WHERE ${options}`;
		};

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
	 * @description: 删除数据
	 * @param {Object} options ：可选参数 删除条件
	 * @param {Function} callback :（err,results）=>{}
	 */
	delete(options, callback) {
    var sql = '';
		let self = this;

		if (!callback) {
			sql = `DELETE FROM '${this.name}'`;
			callback = option;
		} else {
			sql = `DELETE FROM '${this.name}' WHERE ${option}`;
		};

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
	 * @description:  重命名或者新增列
	 * @param {Object} options 参数 数组为新增多列 对象为新增单列{aa} 字符串重命名
	 * @param {Function} callback :（err,results）=>{}
	 * @return: 
	 */
	alter(options, callback) {
    let self = this;
		let sql = '';
		if(options.constructor == Array){		// 新增多列
			for (let i = 0; i < options.length; i++) {
				self.alter(options[i], callback);
			}
		}
		else if(options.constructor == Object){	// 新增单列
			let column = Utils.restrain(options.name, options.option);
			sql = `ALTER TABLE '${this.name}' ADD COLUMN ${column}`
		}
		else if(option.constructor == String){	// 重命名
			sql = `ALTER TABLE '${self.name}' RENAME TO '${option}'`
		}
		
		plus.sqlite.selectSql({
			name: config.name,
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
	 * 判断是否存在
	 * @param {Function} callback 
	 */
	isExist(callback) {
		let sql = `SELETE count(*) AS isTable FROM sqlite_master WHERE type='table' AND name='${this.name}'`;
		let self = this;
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
   * 删除数据表 **不推荐**
   * @param {Function} callback 
   */
	drop(callback) {
    var sql = `DROP TABLE '${this.name}'`;
		let self = this;
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
   * 创建数据表 **不推荐**
   * @param {Function} callback 
   */
  create(callback) {
    let self = this;
		let sql = Utils.modelSql(self.name, self.option);

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

  toString(){
    return `[${this.name} Model]`;
  }

  // TODO 更新表结构
  // TODO 数据表备份?? 
  // TODO 多表联查
  // TODO 下班了其他的想不起来 回头再说
}


// 单例模式
// export 
class usqlite{
  /**
   * 构造函数
   * @param {Object} options 数据库配置信息 *
   * {name: 'demo', path: '_doc/demo.db'}
   * - name 数据库名称*
   * - path 数据库路径
   * @param {Function} callback 
   */
  constructor(options, callback){
    console.warn('No instantiation');
  }
  /**
   * 链接数据库
   * @param {Object} options 数据库配置信息 *
   * {name: 'demo', path: '_doc/demo.db'}
   * - name 数据库名称*
   * - path 数据库路径
   * @param {Function} callback 
   */
  static connect(options, callback){
    config.options = {
			name: options.name, // 数据库名称*
			path: options.path, // 数据库路径*
		};

    plus.sqlite.openDatabase({
			name: config.options.name, //数据库名称
			path: config.options.path, //数据库地址
			success(e) {
				config.isConnect = true;
				callback(null, e);
			},
			fail(e) {
				callback(e);
			}
		});
  }
  /**
   * 断开数据库
   * @param {*} callback 
   */
  static close(callback){
    plus.sqlite.closeDatabase({
			name: config.options.name, //数据库名称
			path: config.options.path, //数据库地址
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
   * 创建 Model 对象
   * @param {String} name 数据表名称 *
   * @param {String} options 参数配置 *
   * @returns 返回 Model 对象
   */
  static model(name, options){
    return Model(name, options);
  }
}


console.log(Utils.modelSql('user',{id:{type: Number,notNull: true},age:{type: Number,notNull: true}, app_id: Number}));