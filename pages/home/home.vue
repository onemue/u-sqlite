<template>
	<view class="content">
		<view class="header">
			<text>记事本</text>
			<text class="left" @tap="open()">+</text>
		</view>
		<ul class="notes">
			<il v-for="(item,index) in nodeList" :key="item.id">
				<view class="item" @tap="open(item.id)">
					<text class="name">{{item.name}}</text> 
					<uni-dateformat class="time" :date="item.lastMinute" :threshold="[60000, 3600000]"></uni-dateformat>
				</view>
			</il>
		</ul>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				pageIndex: 2,
				pageCount: 10,
				nodeList: [],
			}
		},
		onLoad() {

		},
		onShow(){
			let self = this;
			
			uni.sql.notesModel.find(
			function(e, r){
				if(e){
					console.log(e);
					return;
				}
				console.log(r)
				self.nodeList = r.sort(function(a, b){
					return b.lastMinute - a.lastMinute;
				});
			})
		},
		methods: {
			open(id){
				let self = this;
				console.log('pages/node/node?id='+id)
				uni.navigateTo({
					url: '../../pages/node/node?id='+id,
					fail: function(e){
						console.log(e)
					}
				});
			},
		}
	}
</script>

<style>
	*{
		padding: 0;
		margin: 0;
	}


	.header{
		padding: 16rpx;
		width: calc(100% -32rpx);
		display: flex;
		justify-content: space-between;
		line-height: 28px;
		border-bottom: #eeeeee 1px solid;
	}
	.header .left{
		font-size: 28px;
		display: block;
	}
	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
	.notes ,
	.notes > li{
		width: 100%;
	}
	.item{
		display: flex;
		justify-content: space-between;
		padding: 0 16rpx;
		line-height: 84rpx;
		border-bottom: #eeeeee 1px solid;
	}
	.item .name{
		color: #333;
	}
	.item .time{
		color: #888;
	}
</style>
