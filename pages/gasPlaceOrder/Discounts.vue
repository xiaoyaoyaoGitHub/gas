<template>
	<view class="">
		<!-- 选择优惠券 -->
		<view class="cardBox discountBox">
			<view class="discountItem" @click="openDistancePop">
				<view class="red">劵</view>
				<view class="title">优惠券</view>
				<view class="price" style="color: #7a7a7a" v-show='!couponAmount'>
					查看可用优惠券</view>
				<view class="price" v-show='couponAmount'>
					-&yen; {{couponAmount}}</view>
			</view>
			<view class="discountItem">
				<view class="red">惠</view>
				<view class="title">直降优惠</view>
				<view class="price">
					<view v-show='diffAmount'>&yen; {{diffAmount}}</view>
					<view v-show='!diffAmount'></view>
				</view>
			</view>
			<view class="discountItem formItem">
				<image src="@/static/icon_service_fee.png" alt="" />
				<view class="itemTitleBox" style="display: flex;column-gap:16rpx ;">
					<view class="">
						服务费
					</view>
					<u-icon @click="showExplain = true" name="question-circle" color="#a7a7a7" size="32rpx"></u-icon>
				</view>
				<view class="price">
					<view v-show='serviceAmount'> +￥{{serviceAmount}}</view>
					<view v-show='!serviceAmount'></view>
				</view>
			</view>
		</view>
		<!-- 油站评价 -->
		<view class="cardBox evaluationBox">
			<view class="">油站评价</view>
			<view class="gradeBox">
				<view class="gradeLeftBox">
					<view>4.8</view>
					<u-rate :value="4.8" :allowHalf='true' readonly></u-rate>
				</view>
				<view class="gradeRightBox">
					<text v-for="item in pointInfo" :key="item"><text style="color: black;margin-right: 10rpx;">4.8</text>
						{{item}}</text>
				</view>
			</view>
			<view class="evaluateListBox">
				<view class="evaluateItemBox" v-for="item in evaluateInfo" :key="item">
					{{item}}
				</view>
			</view>
		</view>
		<!-- 优惠券弹框 -->
		<u-popup :round="10" :show="discountPop" @close="discountPop = false">
			<view class="popBox" style="height: 50vh;">
				<view class="popTitle">优惠券</view>
				<view class="popListbox" v-if="couponList.length > 0">
					<u-radio-group v-model="distanceShowNum" placement="column" iconPlacement="right" @change="groupChange">
						<view class="distanceRadioBox" v-for="(item, index) in couponList" :key="index">
							<u-radio activeColor="#f67f1d" class="" :label="item.title" :name="item.id" :value='item.id'
								@change="chooseDistance">
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
								</view>
							</u-radio>
						</view>
					</u-radio-group>
				</view>
				<view class="" v-if="couponList.length == 0">
					<u-empty mode="data" text="暂无可用优惠券">
					</u-empty>
				</view>
			</view>
		</u-popup>
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
		<!-- 服务费的说明 -->
		<u-popup :show="showExplain" mode="center" :round="10" :closeOnClickOverlay="true" @close="showExplain = false">
			<view class="servicePopBox">
				<view class="serviceTitleBox">服务费明细</view>
				<view class="serviceMoneyItem">
					<view class="">累计优惠</view>
					<view class="">&yen;{{couponAmount || diffAmount || 0}}</view>
				</view>
				<view class="serviceMoneyItem">
					<view class="">服务费</view>
					<view class="">&yen;{{serviceAmount || 0}}</view>
				</view>
				<view>*您的加油订单需要按照当前享受的累计优惠来支付服务费，“累计优惠”为“直降优惠”和“优惠券”累计的优惠金额（部分优惠券不收取服务费）</view>
				<view>*当每笔订单“直降优惠”和“优惠券”累计的优惠金额大于等于2元时，将按照累计优惠金额的 {{serviceRate * 100}}%
					收取服务费（保留小数点后两位），单笔订单服务费上限为{{serviceMax}}元</view>
				<view>*部分加油站的服务费为固定金额，您可以在服务费明细中查看</view>
				<view>*部分优惠券不收取服务费，包括但不仅限于提前购买所得优惠券，您可以在服务费明细中查看</view>
				<view>*服务费策略可能根据市场实际情况进行调整，将在订单交易时明示给您</view>
			</view>
		</u-popup>
		<u-toast ref="uToast"></u-toast>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	import {
		reqCouponList
	} from '@/network/project_api.js'
	import {
		reqWXopenid,
		reqZFBopenid,
		reqRegisterWx,
		reqRegisterZFB,
		reqCalServicePay
	} from '@/network/project_api.js'
	import {
		isEmpty,
		formatDate
	} from '@/utils/someMethods.js';
	export default {
		data() {
			return {
				pointInfo: ['服务', '油品', '环境'],
				evaluateList: ['油价便宜', '油品质量好', '环境整洁', '排队快', '礼貌友好', '油量充足'],
				discountPop: false,
				couponList: [], //优惠券列表
				distanceShowNum: '', //当前选择的优惠券
				evaluateInfo: [],
				getPhonePop: false, //提示用户需要获取电话号的弹窗
				// radioGroupValue: '', //当前 radioGroup 选中的值
				radioValue: '', // 当前 radio 的值
				num: 0, //用于区分是否是重复选中
				showExplain: false, //服务费的说明
				serviceRate: 0.00, //服务费的说明
				serviceMax: 5 //服务费上限
			}
		},

		created() {
			this.evaluateRamdom()
			if (!this.$store.state.userStore.userInfo.register) {
				//如果注册过 则获取优惠券列表
				this.getCouponList()
			}

			// 查询服务费的费率
			let reqData = {
				originalcode: this.$store.state.gasStore.stationInfo.originalcode
			}
			reqCalServicePay(reqData).then(res => {
				this.serviceRate = res.data.serviceRate
				this.serviceMax = res.data.serviceMax
			})
		},
		computed: {
			diffAmount() {
				return this.$store.state.gasStore.gasAmountInfo.diffAmount;
			},
			//优惠金额
			couponAmount() {
				return this.$store.state.gasStore.gasAmountInfo.couponAmount;
			},
			// 服务费
			serviceAmount() {
				return this.$store.state.gasStore.gasAmountInfo.serviceAmount;
			},
			...mapState('userStore', {
				appGroupId: state => state.appGroupId
			}),
		},
		methods: {
			// 支付宝获取用户手机号
			async getPhoneNumber_zfb(e) {
				this.getPhonePop = false
				this.$store.dispatch('userStore/getPhoneNum_zfb');

			},
			// 微信获取用户手机号
			async getPhoneNumber_wx(e) {
				this.getPhonePop = false
				this.$store.dispatch('userStore/getPhoneNum_wx', e);
			},
			// 格式化时间戳
			formatExpTime(timeStr) {
				return formatDate(timeStr * 1000)
			},
			// 打开优惠券的弹框
			async openDistancePop() {
				// 如果register为true，则需要用电话注册
				if (this.$store.state.userStore.userInfo.register) {
					this.getPhonePop = true
					return
				}
				if (isEmpty(this.$store.state.gasStore.gasOrderInfo.oilgun)) {
					this.$refs.uToast.show({
						message: "请选择油枪"
					})
					return
				} else if (isEmpty(this.$store.state.gasStore.gasOrderInfo.goodsAmount)) {
					this.$refs.uToast.show({
						message: "请填写加油金额"
					})
					return
				} else if (Number(this.$store.state.gasStore.gasOrderInfo.goodsAmount) == NaN) {
					this.$refs.uToast.show({
						message: "请正确填写加油金额"
					})
					return
				}

				// else {
				// 筛选出用户能使用的优惠券以后，再弹出优惠券弹框
				await this.getCouponList()
				let result = this.couponList.filter((obj) => {
					if (obj.type == 2 && Number(obj.conditionAmount) > Number(this.$store.state.gasStore.gasAmountInfo
							.goodsAmount)) {
						return
					}
					return obj
				})
				this.couponList = result
				// 默认为用户使用第一张优惠券
				// XXX
				this.discountPop = true
				// }
			},
			// 选择优惠券
			chooseDistance(item) {
				this.radioValue = item
				// 切换选项后需要初始化 num
				this.num = 0
			},
			groupChange(n) {
				if (n == this.radioValue && this.num == 0) {
					// 第一次相等即执行以下代码
					this.num++
				} else {
					// 第一次后相等即执行以下代码
					// 置空 radioGroupValue 即取消选中的值
					this.distanceShowNum = ''
					// 初始化 num
					this.num = 0
				}

				let discountObj = {
					couponId: !this.distanceShowNum ? this.distanceShowNum : n
				}
				this.$store.commit('gasStore/setGasOrderInfo', discountObj);
				// 调取vuex计算金额
				this.discountPop = false
				this.$store.dispatch('gasStore/calculateTotalAmount');
			},
			// 随机生成油站的评价信息
			evaluateRamdom() {
				let len = Math.random() * 5
				if (len === 0) {
					this.evaluateInfo.push('暂无评论')
				} else {
					for (let i = 0; i < len; i++) {
						this.evaluateInfo.push(this.evaluateList[i])
					}
				}
			},
			// 获取优惠券列表
			async getCouponList() {
				let reqData = {
					userId: this.$store.state.userStore.userInfo.id,
					authority: 1
				}
				let res = await reqCouponList(reqData)
				this.couponList = res.data
			},
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

	// 油站评价
	.evaluationBox {
		font-size: 28rpx;

		.gradeBox {
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-size: 20rpx;
			padding: 10rpx 0;

			.gradeLeftBox {
				display: flex;
				justify-content: space-between;
				align-items: center;
				font-size: 36rpx;

				view {
					margin-right: 10rpx;
					color: #f92f3f;
					font-weight: 600;
				}
			}

			.gradeRightBox {
				color: #909399;

				text {
					margin-right: 20rpx;
				}
			}
		}

		.evaluateListBox {
			display: flex;
			justify-content: flex-start;
			align-items: center;
			flex-wrap: wrap;
			gap: 20rpx;
			padding-top: 10rpx;

			.evaluateItemBox {
				width: 20%;
				border-radius: 25rpx;
				padding: 0.25em 1em;
				text-align: center;
				background-color: #f5f9fa;
				font-size: 24rpx;
			}
		}
	}

	// 优惠券
	.discountBox {
		padding-bottom: 6rpx;

		.discountItem {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 32rpx;

			.red {
				background-color: red;
				color: #fff;
				margin-right: 16rpx;
				font-size: 24rpx;
				line-height: 24rpx;
				padding: 4rpx;
			}

			.title {
				font-size: 24rpx;
				flex: 1;
			}

			.price {
				color: #fb3601;
				font-size: 24rpx;
			}
		}
	}

	// 优惠券的弹框
	.distanceRadioBox {
		background: #ffe5d9;
		border-radius: 8px;
		position: relative;
		padding: 0.5em 1em;
		margin-bottom: 10px;
		overflow: hidden;
		// width: 100%;

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
				width: 36%;
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
		}
	}


	// 弹框样式
	.popBox {
		height: 30vh;
		overflow: auto;

		.popTitle {
			padding: 20rpx;
			font-size: 28rpx;
			font-weight: 600;
		}

		.popListbox {
			padding: 10rpx 20rpx;
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

	// 服务费的盒子
	.formItem {

		// margin-bottom: 0rpx;
		image {
			width: 32rpx;
			height: 32rpx;
			margin-right: 15rpx;
		}

		.itemTitleBox {
			color: rgb(56, 56, 56);
			font-size: 24rpx;
			font-weight: 500;
			flex: 1;
		}
	}

	// 服务费弹窗样式
	.servicePopBox {
		// height: 6em;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 20px;
		font-size: 26rpx;
		color: #545454;

		.serviceTitleBox {
			font-size: 30rpx;
			color: #000;
			text-align: center;
			font-weight: 600;
			margin-bottom: 20rpx;
		}

		.serviceMoneyItem {
			display: flex;
			justify-content: space-between;
			row-gap: 15rpx;
			margin-bottom: 20rpx;
			color: #000;
			font-size: 24rpx;
		}
	}
</style>