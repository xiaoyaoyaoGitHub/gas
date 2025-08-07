<template>
	<view class="content">
		<!-- 顶部油站信息 -->
		<TopDes></TopDes>
		<!-- 选择油枪油号 -->
		<CenterForm></CenterForm>
		<!-- 优惠券 -->
		<Discounts></Discounts>
		<!-- 底部结算按钮 -->
		<view class="bottomBox">
			<view class="">总计：</view>
			<view class="priceBox">&yen;{{totalAmount ? totalAmount : '0.00'}}</view>
			<view @click="handlePay" class="btn">立即支付</view>
		</view>
		<!-- 提示用户需要获取电话号的弹窗 -->
		<u-popup :show="getPhonePop" mode="center" :round="10">
			<view class="getPhonePopBox">
				<view>登录后体验完整功能</view>
				<view class="btnBox">
					<button size="mini" type="default" @click="getPhonePop = false">取消</button>
					<button v-if="appGroupId == 'DDA'" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber_wx" size="mini"
						type="primary">登录</button>
					<button v-if="appGroupId == 'DDP'" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber_zfb" size="mini"
						type="primary">登录</button>
				</view>
			</view>
		</u-popup>
		<u-toast ref="uToast"></u-toast>
		<u-loading-page bg-color="#00000080" :loading="isLoading" color="#fff" iconSize="36"
			font-size="14"></u-loading-page>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	import {
		reqCreateGasOrder
	} from '@/network/gas_api.js'
	import TopDes from '@/pages/gasPlaceOrder/TopDes.vue'
	import CenterForm from '@/pages/gasPlaceOrder/CenterForm.vue'
	import Discounts from '@/pages/gasPlaceOrder/Discounts.vue'
	import {
		isEmpty
	} from '@/utils/someMethods.js';
	export default {
		// 分享页的设置
		onShareAppMessage(res) {
			return {
				title: '云信加油',
				path: 'pages/carHome/index'
			}
		},
		components: {
			TopDes,
			CenterForm,
			Discounts
		},
		computed: {
			totalAmount() {
				return this.$store.state.gasStore.gasAmountInfo.orderAmount;
			},
			...mapState('userStore', {
				appGroupId: state => state.appGroupId
			}),
		},
		data() {
			return {
				getPhonePop: false, //提示用户需要获取电话号的弹窗
				isLoading: false,
			}
		},
		created() {
			// 重置请求订单的信息 和后端返回的订单信息
			let reqData = {
				oilNo: '', //当前选择的油号
				oilgun: '', //当前选择的油枪
				goodsAmount: '', //选择的加油金额
				couponId: null, //优惠券Id
			}
			let resData = {
				goodsAmount: null, //应付金额
				orderAmount: null, //实付金额
				couponId: null, //优惠劵ID
				couponSn: null, //优惠劵编号
				couponAmount: null, //优惠劵金额
				serviceAmount: null, //服务费金额
				balance: null, //加油金金额
				diffAmount: null, //优惠直降金额
				disAgent: null //?
			}
			this.$store.commit('gasStore/setGasOrderInfo', reqData);
			this.$store.commit('gasStore/setAmount', resData);


			// 将本油站的信息赋给仓库的gasOrderInfo。计算订单金额的时候需要
			let thePayType = this.$store.state.userStore.appGroupId == 'DDA' ? 1 : this.$store.state.userStore
				.appGroupId == 'DDP' ? 2 : 3
			let obj = {
				userId: this.$store.state.userStore.userInfo.id,
				channel:this.$store.state.userStore.userInfo.channel,
				codeMode: this.$store.state.gasStore.stationInfo.codeMode,
				productId: this.$store.state.gasStore.elecProductId,  //这个在centerForm页面单独赋
				originalcode: this.$store.state.gasStore.stationInfo.originalcode,
				payType: thePayType //1-微信支付，2-支付宝支付
			}
			this.$store.commit('gasStore/setGasOrderInfo', obj)

		},
		// 加入分享按钮
		mounted() {
			// #ifdef MP-WEIXIN
			uni.showShareMenu({
				withShareTicket: true,
				menus: ["shareAppMessage"]
			})
			// #endif
		},
		methods: {
			// 点击支付
			async handlePay() {
				if (!await this.checkForm()) {
					return
				}
				// 如果register为true，则需要用电话注册
				if (this.$store.state.userStore.userInfo.register) {
					this.getPhonePop = true
					return
				}
				// 支付金额要大于10元
				if (this.$store.state.gasStore.gasAmountInfo.goodsAmount < 10) {
					this.$refs.uToast.show({
						type: 'error',
						message: "加油金额需大于10元",
					})
					return
				}
				// 拉起支付
				this.isLoading = true
				let thePayType = this.$store.state.userStore.appGroupId == 'DDA' ? 1 : this.$store.state.userStore
					.appGroupId == 'DDP' ? 2 : 3
				let reqData = {
					...this.$store.state.gasStore.gasOrderInfo,
					userId: this.$store.state.userStore.userInfo.id,
					channel:this.$store.state.userStore.userInfo.channel,
					codeMode: this.$store.state.gasStore.stationInfo.codeMode,
					productId: this.$store.state.gasStore.elecProductId,
					originalcode: this.$store.state.gasStore.stationInfo.originalcode,
					payType: thePayType //1-微信支付，2-支付宝支付
				}

				console.log('支付时的请求体', reqData);
				let payRes
				try {
					payRes = await reqCreateGasOrder(reqData)
				} catch {
					this.isLoading = false
				}
				if (this.$store.state.userStore.appGroupId == 'DDA') {
					this.pay_wx(payRes)
				} else if (this.$store.state.userStore.appGroupId == 'DDP') {
					this.pay_zfb(payRes)
				} else {
					this.pay_dy(payRes)
				}
			},
			// 微信小程序支付
			async pay_wx(payRes) {
				this.isLoading = false
				uni.requestPayment({
					provider: 'wxpay', // 服务提提供商
					timeStamp: payRes.data.pay.timeStamp, // 时间戳
					nonceStr: payRes.data.pay.nonce_str, // 随机字符串
					package: payRes.data.pay.package,
					signType: payRes.data.pay.signType, // 签名算法
					paySign: payRes.data.pay.paySign, // 签名
					success: (res) => {
						// 支付成功后跳转
						this.paiedJump()
					},
					fail: (err) => {
						console.log('支付失败', err);
						// this.$refs.uToast.show({
						// 	type: 'default',
						// 	message: "支付失败",
						// })
					}
				});
			},
			// 支付宝小程序支付
			async pay_zfb(payRes) {
				let thePay = JSON.parse(payRes.data.pay)
				let theTradeNO = thePay.alipay_trade_create_response.trade_no
				this.isLoading = false
				my.tradePay({
					tradeNO: theTradeNO,
					success: (res) => {
						if (res.resultCode == 9000) {
							// 支付成功后跳转
							this.paiedJump()
						} else {
							// this.$refs.uToast.show({
							// 	type: 'error',
							// 	message: "支付失败",
							// })
							console.log("支付失败", res);
						}
					},
					fail: (err) => {
						// 支付不成功，具体原因看返回，去对照文档
						// this.$refs.uToast.show({
						// 	type: 'error',
						// 	message: "支付失败",
						// })
						console.log('支付失败', err);
					}
				});
			},
			// 支付宝获取用户手机号
			async getPhoneNumber_zfb() {
				this.getPhonePop = false
				this.isLoading = true
				await this.$store.dispatch('userStore/getPhoneNum_zfb');
				// 登录成功后重新计算金额（因为要重新拉去直降优惠）
				await this.$store.dispatch('gasStore/calculateTotalAmount');
				this.isLoading = false
			},
			// 微信获取用户手机号
			async getPhoneNumber_wx(e) {
				this.getPhonePop = false
				this.isLoading = true
				await this.$store.dispatch('userStore/getPhoneNum_wx', e);
				// 登录成功后重新计算金额（因为要重新拉去直降优惠）
				await this.$store.dispatch('gasStore/calculateTotalAmount');
				this.isLoading = false
			},
			// 校验表单信息
			checkForm() {
				console.log('this.$store.state.gasStore.gasOrderInfo.oilgun', this.$store.state.gasStore.gasOrderInfo.oilgun);
				if (isEmpty(this.$store.state.gasStore.gasOrderInfo.oilgun)) {
					this.$refs.uToast.show({
						type: 'default',
						message: "请选择的油枪",
					})
					return false
				} else if (isEmpty(this.$store.state.gasStore.gasOrderInfo.goodsAmount) || Number(this.$store.state.gasStore
						.gasOrderInfo
						.goodsAmount) <= 0) {
					this.$refs.uToast.show({
						type: 'default',
						message: "请输入加油金额",
					})
					return false
				}
				return true
			},
			// 支付成功后的跳转
			paiedJump() {
				this.$refs.uToast.show({
					type: 'success',
					message: "支付成功",
				})
				setTimeout(() => {
					uni.reLaunch({
						url: '/pages/orderList/index?orderType=0',
						fail(err) {
							console.log(err);
						}
					})
				}, 1000);
			},
		}
	}
</script>

<style lang="scss" scoped>
	.content {
		background: linear-gradient(150deg, #FFDAD6, #FFDAD6, rgba(245, 245, 245, 1) 50%);
		min-height: 90vh;
		padding: 16rpx;
		padding-bottom: 100rpx;
		box-sizing: border-box;
	}

	// 底部的结算按钮部分
	.bottomBox {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 40rpx;
		background-color: #FFF;
		padding: 20rpx 30rpx;
		box-sizing: border-box;

		.priceBox {
			flex: 1;
			color: #f92f3f;
			font-weight: 600;
			// width: 4em;
		}

		.btn {
			padding: 0.5em 1.5em;
			background: linear-gradient(312deg, #ff8060, #ff605b);
			border-radius: 40rpx;
			color: #fff;
			font-size: 32rpx;
		}
	}

	// 提示用户需要获取电话号的弹窗
	.getPhonePopBox {
		height: 6em;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 20px;

		.btnBox {
			display: flex;
			justify-content: space-around;
		}
	}
</style>