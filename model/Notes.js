import { usqlite } from '@/uni_modules/onemue-USQLite/js_sdk/usqlite.js';
export default usqlite.model(
	'notes',
	{
		id: {
			type: String,		// 类型
			primaryKey: true,	// 主键
			unique: true,  		// 不能重复
			notNull: true, 		// 非空
		},
		name: {
			type: String,
			default: '未命名'
		},
		time: {					// 创建时间
			type: Number,
		},
		lastMinute: Number,		// 最近编辑时间
		content: String
	});