<template>
	<view class="page" :style="`height:calc(100vh - ${keyHeight}px)`">
		<input class="title" type="text" v-model="note.name" placeholder="未命名" focus="true"/>
		<textarea class="content" v-model="note.content" placeholder=""  />
		<view class="tools">
			<uni-dateformat class="time" :date="note.time" :threshold="[60000, 3600000]" format="创建于yyyy年MM月dd日"></uni-dateformat>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				isOpen: false,
				note: {
					id: Math.random().toString(16).slice(2),
					name: '',
					time: Date.parse(new Date),
					lastMinute: Date.parse(new Date), // 最近编辑时间
					content: '',
				},
				keyHeight: 0
			}
		},
		onLoad: function(option) { //option为object类型，会序列化上个页面传递的参数
			self = this;
			uni.onKeyboardHeightChange(function(e){
				console.log(e); 
				self.keyHeight = e.height;
			})
			
			if (option.id==='undefined') { // 没有id为新建页面
				self.isOpen = false;
				console.log('isOpen = false');
				self.note = {
					id: Math.random().toString(16).slice(2),
					name: '',
					time: Date.parse(new Date),		  // 创建事件
					lastMinute: Date.parse(new Date), // 最近编辑时间
					content: ''
				}
				return;
			}
			self.isOpen = true;
			console.log('isOpen = true'); 
			uni.sql.notesModel.find(`id="${option.id}"`, function(e, r) { 
				if (e) { // 发生错误返回首页
					uni.navigateBack();
					uni.showToast({
						title: '打开错误'
					});
					return;
				}
				self.note = r[0];
				if(self.note.name=='未命名'){
					self.note.name = ''
				}
			})
		}, 
		onHide: function() {
			this.saveNote();
		},
		onUnload: function(){
			this.saveNote();
		},
		methods: {
			saveNote: function(){
				console.log(this.note.name)
				if(this.note.name==''){
					this.note.name = '未命名'
				}
				if(!this.isOpen){
					this.new();
					return;
				}
				this.save();
			},
			new: function(){
				self = this;
				console.log('new function');
				uni.sql.notesModel.insert(self.note, function(e, r) {
					console.log(e);
					if (e) {
						uni.showToast({
							title: '保存错误'
						});
						return;
					}
					uni.showToast({
						title: '保存成功'
					});
					self.note = r;
				});
				return;
			},
			save: function(){
				self = this; 
				self.note.lastMinute = Date.parse(new Date());
				uni.sql.notesModel.update(`id='${self.note.id}'`, self.note, function(e, r) {
					console.log(e);
					if (e) {
						uni.showToast({
							title: '保存错误'
						});
						return;
					}
					uni.showToast({
						title: '保存成功'
					});
					self.note = r;
				})
			}
		}
	}
</script>

<style>
.page{
	height: 100vh;
	display: flex;
	flex-direction: column;
}
.title{
	font-size: 22px;
	height: 64rpx;
	padding: 16rpx 8rpx;
	border-bottom: #eee 1px solid;
}
.content{
	flex: 1;
	padding: 8rpx;
}
.tools{
	display: flex;
	justify-content: flex-end;
	padding: 8rpx;
	height: 28rpx;
	border-top: #eee 1px solid;
}
.tools .time{
	text-align: right;
	color: #888;
	line-height: 28rpx;
}
</style>
