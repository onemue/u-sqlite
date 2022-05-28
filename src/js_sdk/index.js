import Utils from "Utils";
import Model from "Model";

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
    static connectAsync(options) {
        return new Promise((resolve, reject) => {
           push.sqlite.openDatabase({
                name: options.name, //数据库名称
                path: options.path, //数据库地址
                success(e) {
                    config.isConnect = true;
                    resolve(e);
                },
                fail(e) {
                    if (e.code == -1402) {
                        config.isConnect = true;
                    }
                    reject(e);
                }
           });
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
    static closeAsync() {
        return new Promise((resolve, reject) => {
            plus.sqlite.closeDatabase({
                name: config.name, //数据库名称
                path: config.path, //数据库地址
                success(e) {
                    config.isConnect = false;
                    resolve(e);
                },
                fail(e) {
                    reject(e);
                }
            });
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