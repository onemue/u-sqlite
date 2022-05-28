import Uilts from "Uilts";

export default class Model {
    // TODO 创建model
    constructor(name, options) {
		let _this = this;
		_this.name = name;
		_this.options = options;

		if (config.isConnect) {
			_this.repair();
		} else {
			if(!config.name||!config.path){
				console.error('"config.name" or "config.path" is empty');
			}
			usqlite.connect(config);
		}
    }

    /**
     * @description 插入数据
     * @param {Object|Array} options: 需要插入的单个或者多个数据
     * @param {Function} callback :（err,results）=>{}
     */
    insert(options, callback) {
        let _this = this;
        let sql = ``;

        if (Uilts.isArray(options)) {
            _this.insertBulk(options, callback);
            return _this;
        }

        sql = `INSERT INTO ${this.name} (${Object.keys(options).join(',')}) VALUES (${Object.values(options).map(item => `'${item}'`).join(',')})`;
        this.query(sql, callback);
        return _this;
    }

    /**
     * @description 插入数据
     * @param {Object|Array} options: 需要插入的单个或者多个数据
     * @param {Function} callback :（err,results）=>{}
     */
    async bulkInsert(options, callback) {
        let _this = this;
        let sql = ``;
        let result;
        _this.beginTransaction(() => {
            try {
                if (Uilts.isArray(options)) {
                    options.forEach(item => {
                        sql = `INSERT INTO ${this.name} (${Object.keys(item).join(',')}) VALUES (${Object.values(item).map(item => `'${item}'`).join(',')})`;
                        result = await _this.queryAsync(sql);

                        if (result.code) {
                            let error = result;
                            
                            // 抛出异常回滚
                            throw result;
                        }
                    });
                }

                _this.commitTransaction().then(() => {
                    callback(null, result);

                }).catch(error => {
                    callback(error);
                });
            } catch (error) {
                _this.rollbackTransaction().then(() => {
                    callback(error);
                }).catch(error => {
                    callback(error);
                });
            }
        })
        return _this;
    }

    /**
     * @description 删除数据
     * @param {String} options ：可选参数 删除条件
     * @param {Function} callback :（err,results）=>{}
     */
    delete() {
        let _this = this;
        let options = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
        let callback = arguments[arguments.length - 1];
        let where = options.find(item => Uilts.isString(item));
        let sql = ``;
        if (where) {
            sql = `DELETE FROM ${this.name} WHERE ${where}`;
        } else {
            sql = `DELETE FROM ${this.name}`;
        }
        this.query(sql, callback);
        return _this;
    }


    /**
     * @description 更新数据
     * @param {String} options：可选参数 更新条件
     * @param {Object} obj： 修改后的数据 
     * @param {Function} callback :（err,results）=>{}
     */
    update() {
        let _this = this;
        let options = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
        let callback = arguments[arguments.length - 1];
        let where = options.find(item => Uilts.isString(item));
        let data = options.find(item => Uilts.isObject(item));
        let sql = ``;

        if (where) {
            sql = `UPDATE ${this.name} SET ${Object.keys(data).map(item => `${item}='${data[item]}'`).join(',')} WHERE ${where}`;
        } else {
            sql = `UPDATE ${this.name} SET ${Object.keys(data).map(item => `${item}='${data[item]}'`).join(',')}`;
        }

        this.query(sql, callback);
        return _this;
    }


    /**
     * @description 查询表数据
     * @param {String|Array} ...options 
     * - String  WHERE 内容
     * - Array 需要查询的列
     * @param {Function} callback 
     * @returns 
     */
    find() {
        let _this = this;
        let options = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
        let callback = arguments[arguments.length - 1];
        let where = options.find(item => Uilts.isString(item));
        let columns = options.find(item => Uilts.isArray(item));
        let sql = ``;

        if (where) {
            sql = `SELECT ${columns ? columns.join(',') : '*'} FROM ${this.name} WHERE ${where}`;
        } else {
            sql = `SELECT ${columns ? columns.join(',') : '*'} FROM ${this.name}`;
        }

        this.query(sql, callback);
        return _this;
    }


    /**
     * @description 分页查询
     * @param {Object} options :   { where:查询条件, number: 当前页数 , count : 每页数量 }
     * @param {Function} callback :（err,results）=>{} 
     * @return
     */
    limit() {
        let _this = this;
        let options = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
        let callback = arguments[arguments.length - 1];
        let where = options.where;
        let number = options.number;
        let count = options.count;
        let sql = ``;

        if (where) {
            sql = `SELECT * FROM '${this.name}' WHERE ${where} LIMIT ${count} OFFSET ${(number - 1) * count}`;
        } else {
            sql = `SELECT * FROM '${this.name}' LIMIT ${count} OFFSET ${(number - 1) * count}`;
        }

        this.query(sql, callback);
        return _this;
    }
    // TODO 多表联查
    join() { }
    // TODO 自定义查询SQL
    sql(sql, callback) {
        plus.sqlite.selectSql({
            name: this.name,
            sql: sql,
            success: (result) => {
                callback(null, result);
            },
            fail: (error) => {
                callback(error);
            }
        });
    }

    /**
     * 自定义SQL
     * @param {String} sql 执行的sql
     * @param {Function} callback 回调函数
     */
    query(sql, callback) {
        plus.sqlite.executeSql({
            name: this.name,
            sql: sql,
            success: (result) => {
                callback(null, result);
            },
            fail: (error) => {
                callback(error);
            }
        });
    }
    queryAsync(sql) {
        return new Promise((resolve, reject) => {
            plus.sqlite.executeSql({
                name: this.name,
                sql: sql,
                success: (result) => {
                    resolve(result);
                },
                fail: (error) => {
                    reject(error);
                }
            });
        })
    }
    // TODO 事务相关
    /**
         * @param {String} control 事务控制
         * @param {Function} callback 回调函数
         */
    transaction(control, callback) {
        let _this = this;

        if (!Utils.isString(control)) {
            Utils.error('The first parameter of Model.transaction should be "String".')
        }
        if (!Utils.isFunction(callback)) {
            Utils.error('The second parameter of Model.transaction should be "Function".')
        }

        if (control === 'begin' || control === 'start') {
            _this.beginTransaction().then(() => {
                callback(null);
            }
            ).catch(e => {
                callback(e);
            });
        }
        else if (control === 'commit' || control === 'end') {
            _this.commitTransaction().then(() => {
                callback(null);
            }
            ).catch(e => {
                callback(e);
            });
        }
        else if (control === 'rollback' || control === 'cancel') {
            _this.rollbackTransaction().then(() => {
                callback(null);
            }
            ).catch(e => {
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
    async beginTransaction() {
        return await new Promise(function (resolve, reject) {
            plus.sqlite.transaction({
                name: config.name,
                operation: 'begin',
                success: function (e) {
                    resolve();
                },
                fail: function (e) {
                    reject(e);
                }
            });
        })
    }

    /**
     * commitTransaction 提交事务
     * @returns {Promise}
     */
    async commitTransaction() {
        return await new Promise(function (resolve, reject) {
            plus.sqlite.transaction({
                name: config.name,
                operation: 'commit',
                success: function (e) {
                    resolve();
                },
                fail: function (e) {
                    reject(e);
                }
            });
        })
    }

    /**
     * rollbackTransaction 回滚事务
     * @returns {Promise}
     */
    async rollbackTransaction() {
        return await new Promise(function (resolve, reject) {
            plus.sqlite.transaction({
                name: config.name,
                operation: 'rollback',
                success: function (e) {
                    resolve();
                },
                fail: function (e) {
                    reject(e);
                }
            });
        })
    }
    // TODO 视图
    // TODO 索引
    // TODO 表的操作
    alter() { }
    toString() {
        return `[${this.name} Model]`;
    }





    static #modelSql(name, options) {
		let sql;
		let sqlArr = [];
		let primaryKeyArr = [];
		Utils.log('options:' + options);
		for (const key in options) {
			if (Object.hasOwnProperty.call(options, key)) {
				const option = options[key];
				sqlArr.push(this.#restrain(key, option));
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

	static #restrain(key, options) {

		let restrainArray = [];
		restrainArray.push(`'${key}'`);

		// 如果是 String 拦截处理
		if (options.constructor != Object) {
			restrainArray.push(_this.#toType(options));
			return restrainArray.join(' ');
		}

		restrainArray.push(_this.#toType(options.type));
		
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

	static #toType(jsType) {
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


    /**
	 * @description 创建数据表 **不推荐**
	 * @param {Function} callback 
	 */
	create(callback) {
		if (callback&&!Utils.isFunction(callback)) {
			Utils.error('The type of "callback" is wrong, it should be "Function".');
		}
		
		let _this = this;
		let sql = Utils.modelSql(_this.name, _this.options);
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

    repair() {
		let _this = this;
		_this.isExist(function (e, r) {
			if (e) {
				console.error(e);
			}

			if (!r[0].isExist) {
				_this.create(function (e, r) {
					Utils.log(e, r);
				});
			}
		});
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
		let _this = this;
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
}