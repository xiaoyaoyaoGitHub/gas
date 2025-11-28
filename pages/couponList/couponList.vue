<template>
	<view class="orderMainBox">
		<!-- 加油的优惠券 -->
		<view class="content" v-show="showGas">
			<view v-show="couponList.length == 0">
				<u-empty mode="data" text="暂无可用优惠券">
				</u-empty>
			</view>
			<view class="popListbox" v-show="couponList.length > 0">
				<view class="distanceRadioBox" v-for="(item, index) in couponList" :key="index">
					<view class="radioInnerBox">
						<view>
							<view v-if="item.type === 1" class="tipBox">折扣券</view>
							<view v-if="item.type === 2" class="tipBox">立减劵</view>
						</view>
						<view class="distanceBox" v-if="item.type === 1">
							{{parseFloat((item.discount * 10).toFixed(1)) }}折
						</view>
						<view class="distanceBox" v-if="item.type === 2">
							满{{item.conditionAmount}}可用
						</view>
						<view class="desBox">
							<view>{{item.title}}</view>
							<view class="overdueTimeBox">{{formatExpTime(item.expTime)}}到期</view>
						</view>
						<view class="useBtn" @click="handleUseBtn">
							使用
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		reqCouponList
	} from '@/network/project_api'
	import {
		isEmpty,
		formatDate
	} from '@/utils/someMethods.js';
	export default {
		// 分享页的设置  支付宝所有页面都能分享，故这里设置分享页面为首页
		onShareAppMessage(res) {
			return {
				title: '云信加油',
				path: 'pages/carHome/index'
			}
		},
		data() {
			return {
				couponList: [],
				tabList: ['优惠加油'],
				curNow: 0,
				showGas: true,
			};
		},
		created() {
			this.getList(1) //首先展示加油订单
		},
		methods: {
			// 请求优惠券列表
			async getList(type) {
				let reqData = {
					userId: this.$store.state.userStore.userInfo.id,
					authority: type
				}
				let res = await reqCouponList(reqData)
				this.couponList = res.data
			},
			// 格式化时间戳
			formatExpTime(timeStr) {
				return formatDate(timeStr * 1000)
			},
			// 点击使用按钮
			handleUseBtn() {
				uni.switchTab({
					url: '/pages/gasHome/index',
					fail(err) {
						console.log(err);
					}
				})
			},
		}
	}
</script>

<style lang="scss" scoped>
	.orderMainBox {
		position: relative;
	}

	.popListbox {
		padding: 10rpx;
		padding-bottom: 60rpx;
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;

		.popItemBox {
			background: #f5f9fa;
			color: #303133;
			border-radius: 16rpx;
			padding: 0.5em;
			font-size: 28rpx;
			width: 5em;
			text-align: center;
		}

		.activePopItemBox {
			color: #ff605b;
			background: #ffe4e2;
			border: 2rpx solid #f8928a;

		}
	}

	// 优惠券的弹框
	.distanceRadioBox {
		background: #ffe5d9;
		border-radius: 8px;
		position: relative;
		padding: 1em;
		margin-top: 10rpx;
		overflow: hidden;
		width: 100%;

		.radioInnerBox {
			width: 100%;
			display: flex;
			justify-content: space-around;
			align-items: center;
			margin-left: 1em;
			margin-right: 1em;

			.tipBox {
				position: absolute;
				left: -5em;
				top: -2em;
				background-color: #ffd1bc;
				color: #fa6400;
				-webkit-transform: rotate(-45deg);
				transform: rotate(-45deg);
				font-size: 8px;
				font-weight: 600;
				padding: 0px 33px;
				padding-top: 31px;
				padding-bottom: 10rpx;
			}

			.distanceBox {
				color: #f67f1d;
				font-size: 32rpx;
				font-weight: 600;
				width: 30%;
				padding-right: 1em;
				box-sizing: border-box;
				text-align: center;
			}

			.desBox {
				font-size: 28rpx;
				flex: 1;

				.overdueTimeBox {
					font-size: 20rpx;
					color: #999;
					min-width: 12em;
					margin-top: 1em;
				}
			}

			.useBtn {
				padding: 0.5em 1em;
				border-radius: 10rpx;
				margin-right: 0.5em;
				font-size: 24rpx;
				background: #f67f1d;
				color: #fff;
			}
		}
	}
</style>