<template>
	<view class="content">
		<view class="plus-item" v-for="(plusInem, index) in plus" :key="index">
			<view class="plus-left">
				{{ plusInem.name }}
			</view>
			<view class="plus-right">
				{{ plusInem.describe }}
				<br />
				<button type="default" @click="plusFunc" v-for="(plusFunc, plusFuncName, index) in plusInem.function"
					:key="index">
					{{ plusFuncName }}
				</button>
			</view>
		</view>
		<!-- 		<view class="usql-console">
			<usql-console>aaa</usql-console>
		</view> -->
	</view>
</template>

<script>
	import usqlConsole from '@/uni_modules/onemue-usqlite-console/components/onemue-usqlite-console/onemue-usqlite-console'
	// Vue.use(usqlCnsole)

	export default {
		components: {
			'usql-console': usqlConsole
		},
		data() {
			return {
				sqlMode: null,
				sqlOptions: {
					name: 'demo',
					path: '_doc/demo.db'
				},
				plus: [{
						name: "介绍",
						describe: "这是uSQLite",
					},
					{
						name: "版本",
						describe: "v 2.0.0",
					},
					{
						name: "SQLite",
						describe: "SQLite 封装的方法，更加完善的调用方法",
						function: {
							"打开demo": this.openNote,
							"链接数据库": this.connectDatabase,
							"检测是否链接数据库": this.isConnect,
							"创建Model": this.createModel,
							"检测Model": this.isModel,
							"查询所有表": this.getTables,
							"添加数据": this.insert,
							"查询操作": this.find,
							"分页查询": this.limit,
							"条件查询": this.whereFind,
							"修改操作": this.updata,
							"条件修改": this.whereUpdata,
							"删除操作": this.delete,
							"条件删除": this.whereDelete,
							"清空操作": this.drop,
							"修改表名": this.alter,
							"新增加行": this.alterAddCol,
							"新增加多行": this.alterAddCols,
							"执行自定义SQL语句": this.diySQL,
							"链式调用": this.links,
							"console": this.console
						},
					},
				],
			};
		},
		onLoad() {

		},
		methods: {
			openNote: function() {
				console.log("open note");
				uni.redirectTo({
					url: '../home/home',
					success: function(){
	
					},
					fail(e) {
						console.log(e)
					}
				})
			},
			connectDatabase: function() {
				uni.$sql.connect(this.sqlOptions, function(err, results) {
					if (err) {
						console.log(err);
						return;
					}
					console.log(results);
				})
			},
			isConnect: function() {
				console.log(plus.sqlite.isOpenDatabase(this.sqlOptions))
			},
			createModel: function() {
				this.sqlModel = uni.$sql.model(
					'aaafalse', {
						id: {
							primaryKey: false,
							type: String
						},
						content: String,
						N_a: {
							primaryKey: false,
							type: Number,
							default: 666,
							unique: true,
						},
						B_b: Boolean
					}
				);
				// console.log(this.sqlModel);
			},
			isModel: function() {
				// console.log('e, r');
				this.sqlModel.isExist(function(e, r) {
					console.log(e, r);
					if (e) {
						console.log(e);
						return;
					}
					console.log(r)
				})
			},
			getTables: function() {
				plus.sqlite.selectSql({
					name: this.sqlOptions.name,
					sql: "select * FROM sqlite_master where type='table'",
					success(e) {
						console.log(e)
					},
					fail(e) {
						console.log(e)
					}
				})
			},
			insert: function() {
				this.sqlModel.insert({
					id: Math.random().toString(16).slice(2),
					content: 'this is content：' + Math.random().toString(16).slice(2),
					// number: 666,
					B_b: Math.random() > 0.5 ? true : false
				}, function(err, results, option, index) {
					if (err) {
						console.log(err);
						return;
					}
					console.log(results, option);
				});
			},
			find: function() {
				this.sqlModel.find(function(err, r) {
					if (err) {
						console.log(err);
						return;
					}
					console.log(r)
				})
			},
			limit: function() {
				this.sqlModel.limit({
					where: null,
					number: 2,
					count: 2
				}, function(e, r) {
					console.log(e, r)
				});
			},
			whereFind: function() {
				this.sqlModel.find('B_b = "false"', function(e, r) {
					console.log(e, r)
				});
			},
			updata: function() {
				this.sqlModel.update({
					content: 'This is the updated'
				}, function(e, r) {
					console.log(e, r);
				});
			},
			whereUpdata: function() {
				this.sqlModel.update('B_b = "true"', {
					B_b: '!false'
				}, function(e, r) {
					console.log(e, r);
				});
			},
			delete: function() {
				this.sqlModel.delete(function(e, r) {
					console.log(e, r);
				})
			},
			whereDelete: function() {
				this.sqlModel.delete('B_b="false"', function(e, r) {
					console.log(e, r);
				})
			},
			drop: function() {
				this.sqlModel.drop(function(e, r) {
					console.log(e, r);
				})
			},
			diySQL: function() {
				this.sqlModel.sql('SELECT * FROM sqlModel2', function(e, r) {
					console.log(e, r);
				})
			},
			links: function() {
				this.sqlModel
					.update({
						content: 'This is the updated'
					}, function(e, r) {
						console.log('P1:  ' + e, r);
					})
					.sql('SELECT * FROM sqlModel2', function(e, r) {
						console.log('P2:  ' + e, r);
					})
			},
			alterAddCols: function() {
				this.sqlModel
					.alter([{
							name: 'newCol1',
							option: String
						},
						{
							name: 'newCol2',
							option: String
						},
						{
							name: 'newCol3',
							option: String
						}
					], function(e, r) {
						console.log(e, r);
					})
			},
			alterAddCol: function() {
				this.sqlModel
					.alter({
						name: 'newCol',
						option: String
					}, function(e, r) {
						console.log(e, r);
					})
			},
			alter: function() {
				this.sqlModel
					.alter('demo', function(e, r) {
						console.log(e, r);
					})
			},
			console: function() {

			}
		},
	};
</script>

<style>
	/* 	*{
		background: #3333;
	} */
	.plus-item {
		display: flex;
		font-size: 0.8rem;
		line-height: 0.8rem;
		padding: 0.4rem;
		border-bottom: 1rpx #eee solid;
	}

	.plus-item:last-child {
		border: none;
	}

	.plus-left {
		width: calc(30% - 8px);
		text-align: right;
		padding-right: 8px;
	}

	.plus-right {
		width: 70%;
		text-align: left;
	}

	.plus-item button {
		font-size: 0.8rem;
		height: 2.0rem;
		line-height: 2.0rem;
		display: block;
		background: #eee;
		border-width: 0;
		margin-top: 4px;

	}

	.usql-console {
		position: fixed;
		width: 80vw;
		height: 80vh;
		top: 0px;
		left: 10vw;
		background-color: #fff;
	}
</style>
