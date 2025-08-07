<template>
	<!-- 顶部油站 -->
	<view class="cardBox stationInfo" @click="jumpMap">
		<view class="stationTitle">
			{{stationInfo.stationname}}
		</view>
		<view class="stationPosition">
			{{stationInfo.address}}
		</view>
		<view class="stationDistance" v-if="pageStatus != 'scanPage' ">
			距离你 {{(stationInfo.distance / 1000).toFixed(3) }} km
		</view>
	</view>
	</view>
</template>

<script>
	// import {

	// } from '@/network/gas_api.js'
	export default {
		props: ["pageStatus"],
		data() {
			return {
				stationInfo: null,
			}
		},

		created() {
			this.stationInfo = this.$store.state.gasStore.stationInfo
		},
		methods: {
			// 跳转到地图
			jumpMap() {
				uni.openLocation({
					// 要去的纬度
					latitude: this.stationInfo.lat,
					// 要去的经度
					longitude: this.stationInfo.lng,
					// 要去的地址信息 微信必填
					address: this.stationInfo.address,
					// 位置名称，支付宝必填
					name: this.stationInfo.stationname,
					// 缩放大小
					scale: 18,
					success: () => {
						console.log('this.stationInfo555', this.stationInfo)
					},
					fail: (err) => {
						console.log('失败了@@', err);
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.cardBox {
		border-radius: 16px;
		background: #FFF;
		box-shadow: 0 4px 12px 0 #00000008;
		padding: 16rpx 24rpx;
		padding-top: 20rpx;
		margin-bottom: 20rpx;
	}

	// 油站详情
	.stationInfo {
		.stationTitle {
			font-size: 32rpx;
			color: #000;
			margin-bottom: 10rpx;
		}

		.stationPosition {
			font-size: 22rpx;
			color: #303133;
			margin-bottom: 10rpx;

		}

		.stationDistance {
			font-size: 22rpx;
			color: #909399;

		}
	}
</style>