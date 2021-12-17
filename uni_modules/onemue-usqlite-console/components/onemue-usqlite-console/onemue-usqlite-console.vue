<template>
	<view class="pages">
		<view class="tools">
			{{isConnect?'已连接':'未连接'}}
			{{consoleText}}
		</view>
		<view class="tab-list-visual">
			<view class="tab-list" >
				<view class="tab-item" :class="thisTableIndex==tableIndex?'this':''" v-for="tableItem,tableIndex in tableList" :key="tableIndex" @click="changeTable(tableIndex, tableItem.name)">
					{{tableItem.name}}
				</view>
			</view>
		</view>
		<view class="table-content-visual">
			<table class="table-content">
				<td class="header" v-for="(cols,cIndex) in currentTableData[0]" :key="'cols-header-'+cIndex" @tap="tdTap(rIndex, cIndex, cols)">
					<view class="">
						{{cIndex=='usql_id'?'':cIndex}}
					</view>
				</td>
				<tr v-for="(row,rIndex) in currentTableData" :key="'rows-'+rIndex">
					<td :class="cIndex=='usql_id'?'id':'content'" v-for="(cols,cIndex) in row" :key="'cols-'+rIndex+'-'+cIndex" @tap="tdTap(rIndex, cIndex, cols)">
						<view class="data">
							<view :class="(rIndex==thisrIndex&&cIndex==thiscIndex&&cIndex!='usql_id')?'hied':'show'">
								{{cols}}
							</view>
							<input :class="(rIndex==thisrIndex&&cIndex==thiscIndex&&cIndex!='usql_id')?'show':'hied'" type="text" v-model="thisValue" @blur="changeValue(rIndex, cIndex, thisValue)">
						</view>
					</td>
				</tr>
			</table>
		</view>
	</view>
</template>
<script>
	import { usqlite } from '@/uni_modules/onemue-USQLite/js_sdk/usqlite.js'
	export default {
		data() {
			return {
				isConnect: false,
				consoleText: '',
				tableList: [],
				thisTableIndex: 0,
				thisTableName: '',
				thisSqlModel: null,
				thisrIndex: null,
				thiscIndex: null,
				thisValue: null,
				currentTableData: [],
			}
		},
		onShow() {
			let self = this;
			self.consoleText = usqlite;
			usqlite.connect(this.dbOptions, function(e, r){
				if(e){
					if(e.code == -1402){
						self.isConnect = true;
						self.getTable();
					}else{
						console.log('this is error');
						console.log(e); 
						self.consoleText = e;
					}
					return;
				}
				self.getTable();
				self.isConnect = true;
				console.log('链接成功');
			})
		},
		methods:{
			tdTap(rows, cols, content){
				console.log(rows, cols, content);
				this.thiscIndex = cols;
				this.thisrIndex = rows;
				this.thisValue = content;
			},
			changeTable(index, name){
				this.thisTableIndex = index;
				this.thisTableName = name;
				this.getTableData();
			},
			changeValue(rows, cols, content){
				this.thiscIndex = null;
				this.thisrIndex = null;
				this.thisValue = null;
				let option = {};
				if(this.currentTableData[rows][cols]==content){
					console.log('no change');
					return;
				}
				let options = this.currentTableData[rows];
				let str = '';
				let self = this;
				for(var key in options){
					str += `${key} = '${options[key]}' AND `
				}
				str = str.replace(/AND $/, '');
				option[cols] = content;
				
				this.thisSqlModel.update(str, option, function(e, r){
					if(e){
						return;
					}
					self.getTableData();
				});
			},
			getTable(){
				let self = this;
				plus.sqlite.selectSql({
					name: this.dbOptions.name,
					sql: "select * FROM sqlite_master where type='table'",
					success(e) {
						self.tableList = e;
						if(!self.thisTableName){
							self.thisTableName = e[self.thisTableIndex].name;
							self.getTableData();
						}
						console.log(e);
					},
					fail(e) {
						console.log(e)
					}
				})
			},
			getTableData(){
				let self = this;
				let thisTableName = self.thisTableName;
				console.log(self.thisTableName);
				let thisSqlModel = usqlite.model(thisTableName)
				this.thisSqlModel = thisSqlModel;
				this.thisSqlModel.find(function(err, r) {
					if (err) {
						console.log(err);
						return;
					}
					self.currentTableData = r;
				})
			}
		}
	}
</script>
<style scoped>
	.tools{
		position: sticky;
		top: 0;
		line-height: 2em;
		height: 2em;
		background: #FFFFFF;
	}
	.tab-list-visual{
		position: sticky;
		top: 2em;
		line-height: 2em;
		height: 2em;
		background: #FFFFFF;
	}
	.tab-list-visual{
		overflow: auto;
		border: #333333 1px solid;
		border-width: 1px 0  1px 0;
	}
	.tab-list{
		display: flex;
	}
	.tab-list .tab-item{
		padding: 0 4px;
		line-height: 2em;
		border-right: #eee 1px solid;
		white-space: nowrap;
	}
	.tab-list .tab-item:last-child{
		border-right: #eee 1px none;
	}
	.tab-list .tab-item.this{
		background: #eee;
	}
	.table-content-visual{
		overflow: auto;
	}
	.table-content {border-collapse:collapse;}
	.table-content td.content,
	.table-content td.header{
		padding: 2px;
		border: #eee 1px solid;
		margin: 0;
		white-space: nowrap;
	}
	.table-content td.content:hover{
		background: #eee;
	}
	.data .show{
		display: block;
	}
	.data .hied{
		display: none;
	}
</style>
