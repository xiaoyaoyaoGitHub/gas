<template>
	<view class="gasOrderListMain">
		<view class="content">
			<u-tabs :list="tabList" @click="changeTab()" current="0"></u-tabs>
			<view v-show="orderList.length == 0">
				<u-empty mode="data" text="暂无订单数据">
				</u-empty>
			</view>
			<view class="orderListBox" v-show="orderList.length != 0">
				<view class="orderItemBox" v-for="(item, index) in orderList" :key="index">
					<!-- 油站的基本信息 -->
					<view class="stationInfoBox">
						<image :src="item.thumb" style="width: 140rpx;height: 140rpx;object-fit: contain;" />
						<!-- <image src="https://static.dabapiao.com/images/coupon-index.png" style="width: 140rpx;height: 140rpx;object-fit: contain;"/> -->
						<view class="centerBox">
							<view class="titleBox">{{ item.stationname }}</view>
							<view class="positionBox">{{item.address}}</view>
							<view class="gas_gunBox">
								<text class="top_sub_space">油品号：{{ item.oil }}</text>
								<text>油枪号：{{ item.oilgun }}</text>
							</view>
						</view>
						<view class="statusBox">
							<view v-show="item.orderStatus == 0" class="status sta_recharging">未支付</view>
							<view v-show="item.orderStatus == 1 || item.orderStatus == 2" class="status sta_finish">已支付</view>
							<view v-show="item.orderStatus == 10" class="status sta_refunded">已退款</view>
						</view>
					</view>
					<!-- 订单信息 -->
					<view class="orderInfoBox">
						<view class="orderInfoItem">
							<view>订单编号：</view>
							<view> {{ item.orderSnUpper || item.orderSn }}</view>
						</view>
						<view class="orderInfoItem">
							<view>下单时间：</view>
							<view>{{ item.createTime }}</view>
						</view>
						<view class="orderInfoItem">
							<view>商品总价：</view>
							<view>&yen;{{ toThousandsFormates(item.goodsAmount) }}</view>
						</view>
						<view class="orderInfoItem">
							<view>节省金额：</view>
							<view>&yen; -{{ toThousandsFormates(item.goodsAmount - item.orderAmount) }} </view>
						</view>
					</view>
					<!-- 实付金额 -->
					<view class="paymentBox">
						<view class="paymentTitle">实付金额</view>
						<view class="">&yen;{{ toThousandsFormates(item.orderAmount) }}</view>
					</view>
					<!-- 查看电子核销码 -->
					<view class="orderInfoItem lookQRCodeBox" @click="openQRCode(item)"
						v-if="item.orderStatus != 10 &&item.codeMode != 1 && item.codeMode != 10">
						<text class="title">查看电子核销码</text>
						<u-icon size="24rpx" name="arrow-right-double" color="#FF7551"></u-icon>
					</view>
				</view>
				<u-loadmore :status="loadmoreStatus" />
			</view>
			<u-popup class="popup" :show="showCode" :round="10" mode="center">
				<view class="popup_bg_main">
					<view class="titleBox">扫码支付</view>
					<view>请将二维码展示给油站工作人员~</view>
					<view class="qr_frame" id="qrCodeDiv" ref="qrCodeDiv">
						<uv-qrcode ref="qrcode" size="300rpx" :value="verificationCode"></uv-qrcode>
					</view>
					<!-- 			<view class="popup_coupon">
						{{supInfo.orderSn}}
					</view> -->
					<view class="popup_bg_buttom" @click="showCode = false">
						<u-icon size="48rpx" name="close-circle" color="#ffffff"></u-icon>
					</view>
				</view>
			</u-popup>
		</view>
	</view>
</template>

<script>
	import {
		reqGasOrderList,
		reqOrderQRcode
	} from '@/network/gas_api.js'
	export default {
		data() {
			return {
				tabList: [{
					name: '全部',
				}, {
					name: '已支付',
				}, {
					name: '已退款'
				}],
				orderList: [],
				showCode: false,
				loadmoreStatus: 'loading', //触碰到底部的状态
				currentPage: 1,
				orderStatus: null, //查询订单的类型
				verificationCode:null,//当前订单的核销码
			};
		},
		created() {
			this.getList()
			this.currentPage = 1
		},
		methods: {
			// 打开二维码
			openQRCode(item) {
				let reqData = {
					userId:this.$store.state.userStore.userInfo.id,
					orderSn:item.orderSn
				}
				reqOrderQRcode(reqData).then(res=>{
					this.verificationCode = res.data.writeOffCode
				})
				this.showCode = true
			},
			// 更换tab
			changeTab(i) {
				this.currentPage = 1
				if (i.name == "全部") {
					this.orderStatus = null
					this.getList()
				} else if (i.name == "已支付") {
					this.orderStatus = 1
					this.getList()
				} else if (i.name == "已退款") {
					this.orderStatus = 10
					this.getList()
				} else {
					this.orderStatus = null
					this.getList()
				}
			},
			// 请求订单列表
			getList(thePageIndex) {
				let reqData = {
					userId: this.$store.state.userStore.userInfo.id,
					channel: null,
					pageIndex: thePageIndex || 1,
					pageSize: 20,
					orderStatus:this.orderStatus
				}
				reqGasOrderList(reqData).then(res => {
					if (thePageIndex) {
						if (res.data.length != 0) {
							this.orderList = this.orderList.concat(res.data)
							this.currentPage = ++this.currentPage;
						}
					} else {
						this.orderList = res.data
						this.currentPage = ++this.currentPage;
					}
					this.loadmoreStatus = 'nomore'
					console.log('请求一次数据后的this.orderList',this.orderList);
				})
			},
			// 触碰到底部的方法被调用
			reachBottom() {
				console.log('触碰到底部的方法被调用');
				if (this.loadmoreStatus == 'loading') {
					return
				}
				this.loadmoreStatus = 'loading'
				this.getList(this.currentPage)
			},
			// 将数字格式化为小数点后两位
			toThousandsFormates(num) {
				// 判断传进来的数字是否为非空数字
				if (isNaN(parseFloat(num))) {
					return ''
				}
				var reg = /\./g
				var newNum = Number(Number(num).toFixed(2)).toLocaleString()
				// 判断转换后的数字是否带有小数
				if (reg.test(newNum)) {
					var numArr = newNum.split('.')
					// 判断小数点后数字长度为1，则自动补0
					numArr[1] = numArr[1].length === 1 ? numArr[1] + '0' : numArr[1]
					return numArr.join('.')
				} else {
					// 整数直接在后面补上0.00
					return newNum + '.00'
				}
			}

		}
	}
</script>

<style lang="scss" scoped>
	.content {
		min-height: 90vh;
		background: #F7F8FA;
	}

	// 订单
	.orderListBox {
		padding: 20rpx;

		.orderItemBox {
			background-color: #fff;
			padding: 10rpx;
			border-radius: 20rpx;
			margin-bottom: 10rpx;

			.stationInfoBox {
				display: flex;
				align-items: stretch;

				.centerBox {
					flex: 1;
					margin: 0 1em;
					font-size: 24rpx;
					color: #909399;
					display: flex;
					flex-direction: column;
					justify-content: space-around;

					.titleBox {
						font-size: 28rpx;
						color: #303133;
					}
				}

				.statusBox {
					position: relative;
					width: 4em;

					view {
						position: absolute;
						top: 0%;
						right: 0;
						width: 5em;
						padding: 0.125em 0;
						text-align: center;
						border-radius: 0 20rpx 0 20rpx;
						background: rgb(253, 165, 121);
						font-size: 22rpx;
						color: #ffffff;
					}
					.sta_refunded {
						background-color: #bfbfbf;
					}
				}
			}

			.orderInfoBox {
				padding: 0 10rpx;

				.orderInfoItem {
					display: flex;
					justify-content: space-between;
					align-items: center;
					font-size: 24rpx;
					color: #909399;
					margin-top: 18rpx;
				}
			}

			.paymentBox {
				padding: 10rpx;
				margin: 10rpx;
				margin-top: 20rpx;
				border-top: 1px solid #f2f2f2;
				display: flex;
				justify-content: space-between;
				align-items: center;
				font-size: 28rpx;
				color: #f67f1d;
				font-weight: 600;

				.paymentTitle {
					color: #303133;
				}
			}

			.lookQRCodeBox {
				padding-top: 20rpx;
				border-top: 1px solid #f2f2f2;
				font-size: 28rpx;
				display: flex;
				justify-content: flex-end;
				color: #f67f1d;
				padding-bottom: 0;
				border-bottom: 0;
			}
		}
	}

	// 二维码弹框
	.popup_bg_main {
		text-align: center;
		padding: 32rpx 48rpx;
		position: relative;

		.titleBox {
			font-size: 28rpx;
			margin-bottom: 24rpx;
		}

		.qr_frame {
			width: 300rpx;
			height: 300rpx;
			margin: 24rpx auto;
			text-align: center;
		}

		.popup_coupon {
			color: #9c9c9c;
			text-align: center;
			font-size: 24rpx;
			font-weight: 400;
		}

		.popup_refresh {
			color: #ff7551;
			font-size: 28rpx;
			font-weight: 400;
			display: flex;
			justify-content: center;
			align-items: center;
			line-height: 28rpx;
			margin-top: 20rpx;
		}

		.popup_bg_buttom {
			position: absolute;
			bottom: -15%;
			left: 46%;
		}
	}
</style>