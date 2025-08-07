<template>
	<view class="">
		<view class="cardBox formBox">
			<view class="">油号/单价</view>
			<view class="gasBox">
				<view class="gasNumBox" @click="gasNumPop = true">
					<view class="">{{form.oilNo}}#</view>
					<view class="dotBox"></view>
				</view>
				<view class="priceShowBox">
					<view class="priceShowBoxTop">
						<!-- <view class="moneyTipsBox"></view> -->
						<view class="moneyBox">&yen;{{oliInfo.disprice}}</view>
						<view class="moneyUnitBox">/L</view>
						<view class="moneyTipsBox">起</view>
					</view>
					<view class="priceShowBoxBottom">
						加200元低至{{oliInfo.disprice}}/L
					</view>
				</view>
				<view class="intlPriceBox">
					<view class="">油站价格 ¥ {{oliInfo.priceGun}}/L</view>
					<view class="">国标价格 ¥ {{oliInfo.price}}/L</view>
				</view>
			</view>
			<view class="">选择油枪</view>
			<view class="gunNumBox" @click="openGunPop">
				<view class="placeholderBox" v-show="!form.oilgun">请到站后选择油枪</view>
				<view class="" v-show="form.oilgun">{{form.oilgun}} 号</view>
				<view class="dotBox"></view>
			</view>
			<view class="">加油金额</view>
			<view class="priceNumBox" v-if="!isQuotaPay">
				<!-- <view class="placeholderBox">请到站后选择油枪</view> -->
				<u--input type="digit" placeholder="请到站后输入加油金额" border="surround" v-model="formatGoodsAmount"
					@change="inputAmount" style="border: none;fontWeight:600;backgroundColor:#f0f0f1 ;" color='#f92f3f'
					maxlength='7'></u--input>
			</view>
			<view class="priceListBox" v-if="!isQuotaPay">
				<view @click="setMyAount(200)" :class="formatGoodsAmount == 200 ? 'activePayMoney' : ''">&yen;200</view>
				<view @click="setMyAount(300)" :class="formatGoodsAmount == 300 ? 'activePayMoney' : ''">&yen;300</view>
				<view @click="setMyAount(500)" :class="formatGoodsAmount == 500 ? 'activePayMoney' : ''">&yen;500</view>
			</view>
			<view class="elcPriceListBox" v-else="isQuotaPay">
				<view class="elcPriceItemBox" v-for="(item,index) in quotaPayList" :key="index" @click="setMyElcAount(item)"
					:class="formatGoodsAmount == (item.parValue / 100) ? 'activePayMoney' : ''">
					<view class="originalPriceBox">&yen;{{(item.parValue / 100)}}</view>
					<view class="sellBox">售价&yen;{{(item.parValue / 100 * item.disUser)}}</view>

				</view>

			</view>
			<view class="showCodeTipBox" v-show="showCodeTip"><uni-icons type="info" size="15" color="#f92f3f"></uni-icons>
				支付后请出示核销码</view>
		</view>
		<!-- 油号弹框 -->
		<u-popup :round="10" :show="gasNumPop" @close="closePop">
			<view class="popBox">
				<view class="popTitle">选择油号</view>
				<view class="popListbox">
					<view @click="chooseGas(i)" class="popItemBox" :class="form.oilNo == i ? 'activePopItemBox' : ''"
						v-for="i in gasShowNumList" :key="i">{{i}}
					</view>
				</view>

			</view>
		</u-popup>
		<!-- 油枪弹框 -->
		<u-popup :round="10" :show="gunNumPop" @close="closePop">
			<view class="popBox">
				<view class="popTitle">选择油枪</view>
				<view class="popListbox">
					<view class="popItemBox" :class="form.oilgun == i ? 'activePopItemBox' : ''" v-for="i in gunShowNumList"
						:key="i" @click="chooseGun(i)">{{i}}
					</view>
				</view>
			</view>
		</u-popup>
		<!-- 提示用户需要获取电话号的弹窗 -->
		<u-popup :show="getPhonePop" mode="center" :round="10">
			<view class="getPhonePopBox">
				<view>登录后体验完整功能</view>
				<view class="btnBox">
					<button size="mini" type="default" @click="getPhonePop = false">取消</button>
					<!-- #ifdef MP-WEIXIN -->
					<button open-type="getPhoneNumber" @getphonenumber="getPhoneNumber_wx" size="mini"
						type="primary">登录</button>
					<!-- #endif -->
					<!-- #ifdef MP-ALIPAY -->
					<button open-type="getPhoneNumber" @getphonenumber="getPhoneNumber_zfb" size="mini"
						type="primary">登录</button>
					<!-- #endif -->
				</view>
			</view>
		</u-popup>
		<u-toast ref="uToast"></u-toast>
	</view>

</template>

<script>
	import {
		objIsEmpty,
		isEmpty
	} from '@/utils/someMethods.js'
	import {
		reqGasGun,
		reqVerifyMode
	} from "@/network/gas_api.js"
	export default {
		data() {
			return {
				getPhonePop: false, //获取手机号的弹框
				gasNumPop: false,
				gunNumPop: false,
				gasInfoList: [],
				gasShowNumList: [], //当前可选择的油号列表
				gunShowNumList: [], //当前可选择的油枪列表
				timer: null,
				form: {
					oilNo: '', //当前选择的油号
					oilgun: '', //当前选择的油枪
					goodsAmount: null, //选择的加油金额
				},
				formatGoodsAmount: null,
				oliInfo: null, //该油号下的价格信息
				showCodeTip: false, //提示用户付款后需展示核销码
				isQuotaPay: false, //是否是定额电子券支付
				quotaPayList: null, //定额电子券的列表
			}
		},
		watch: {
			form: {
				handler(newVal) {
					this.$store.commit('gasStore/setGasOrderInfo', newVal);
					if (!objIsEmpty(this.form, ['oilNo', 'oilgun', 'goodsAmount']) && Number(newVal.goodsAmount) > 0) {
						// 调取vuex计算金额
						this.$store.dispatch('gasStore/calculateTotalAmount');
					}
				},
				deep: true
			},
			'form.goodsAmount': {
				// 金额改变时，清空优惠券，因为前端筛选出用户能用的优惠券
				handler(newVal) {
					// let obj = {
					// 	couponId: null,
					// }
					// this.$store.commit('gasStore/setGasOrderInfo', obj);
				}
			}
		},
		async created() {
			await this.getVerifyMode()
			this.getGasInfo()
			console.log("this.$store.state.userStore.scanHomeChannel",this.$store.state.userStore.scanHomeChannel);
		},
		methods: {
			// 打开选择油枪的弹框
			openGunPop() {
				console.log(111);
				// 如果register为true，则需要用电话注册
				if (this.$store.state.userStore.userInfo.register) {
					this.getPhonePop = true
				} else {
					this.gunNumPop = true
				}
			},
			// 点击选择油号
			chooseGas(i) {
				this.$set(this.form, 'oilNo', i.split('#')[0])
				let theItem = this.gasInfoList.filter((item) => {
					return item.oilNo == i.split('#')[0]
					// return item
				})
				this.oliInfo = theItem[0] //更新枪号信息
				this.gunShowNumList = theItem[0].gunList // 抢号列表取决于油号
				this.$set(this.form, 'oilgun', '') //枪号取决于油号
				this.gasNumPop = false
			},
			// 点击选择枪号
			chooseGun(i) {
				this.$set(this.form, 'oilgun', i)
				this.gunNumPop = false
			},
			// 获取油站的核销方式
			async getVerifyMode() {
				let stationInfo = this.$store.state.gasStore.stationInfo
				if (stationInfo.codeMode == 1 || stationInfo.codeMode == 10) {
					this.$store.commit("gasStore/setElecProductId", null)
					return
				}
				let reqData = {
					originalcode: this.$store.state.gasStore.stationInfo.originalcode,
					userId: this.$store.state.userStore.userInfo.id
				}
				let res = await reqVerifyMode(reqData)
				// 普通支付页面
				if (res.data.length == 0) return
				// 非定额电子券。目前没有动态券，故不做处理
				if (stationInfo.parValueMode == 1) {
					this.showCodeTip = true
					this.$store.commit("gasStore/setElecProductId", res.data[0].productId)
					let obj = {
						productId: res.data[0].productId
					}
					this.$store.commit('gasStore/setGasOrderInfo', obj)
				} else if (stationInfo.parValueMode == 2) {
					// 定额电子券
					this.showCodeTip = true
					this.isQuotaPay = true
					this.quotaPayList = res.data
				}
			},
			// 获取油号油枪信息
			getGasInfo() {
				let reqData = {
					originalcode: this.$store.state.gasStore.stationInfo.originalcode,
					userId: this.$store.state.userStore.userInfo.id,
					channel:this.$store.state.userStore.userInfo.channel || this.$store.state.userStore.scanHomeChannel,
				}
				reqGasGun(reqData).then(res => {
					if (res.status == 200) {
						this.gasInfoList = res.data
						// 默认显示第一个油号信息
						this.$set(this.form, 'oilNo', this.gasInfoList[0].oilNo)
						this.gunShowNumList = this.gasInfoList[0].gunList
						let arr = []
						for (let i = 0; i < this.gasInfoList.length; i++) {
							arr.push(this.gasInfoList[i].oil)
						}
						this.gasShowNumList = arr
						this.oliInfo = this.gasInfoList[0]
					}
				})

			},

			// 关闭Pop弹框
			closePop() {
				this.gasNumPop = false
				this.gunNumPop = false
			},
			// 输入加油金额时，格式化油站金额
			inputAmount(theNum) {
				if (this.timer) {
					clearTimeout(this.timer);
				}
				this.timer = setTimeout(() => {
					// 去掉首尾空格
					const trimmedValue = theNum.trim();
					// 判断是否为空字符串
					if (trimmedValue === '') {
						console.log('空');
						return;
					}
					// 检查是否为字符串
					if (!isNaN(trimmedValue)) {
						const decimalPart = trimmedValue.split('.')[1];

						// 检查小数点后的位数
						if (decimalPart && decimalPart.length > 2) {
							this.$refs.uToast.show({
								type: 'default',
								message: "请正确输入加油金额",
							})
						} else {
							// 正整数  或小数点后两位的小数
							this.$set(this.form, 'goodsAmount', trimmedValue)
						}
					} else {
						// 如果不是数字，输出字符串类型
						this.$refs.uToast.show({
							type: 'default',
							message: "请正确输入加油金额",
						})
					}
				}, 500);
			},
			// 将加油金额设置为指定的200 300 500。因为直接赋值的时候无法触发Input的change事件，就无法改变form.goodsAmount的值
			setMyAount(num) {
				this.formatGoodsAmount = num
				this.$set(this.form, 'goodsAmount', num)
			},
			setMyElcAount(item) {
				this.$store.commit("gasStore/setElecProductId", item.productId)
				let obj = {
					productId: item.productId
				}
				this.$store.commit('gasStore/setGasOrderInfo', obj)
				this.formatGoodsAmount = item.parValue / 100
				this.$set(this.form, 'goodsAmount', item.parValue / 100)
			},
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

	// 中间选择油号油枪
	.formBox {
		font-size: 28rpx;

		// 选择油号
		.gasBox {
			margin: 18rpx 0;
			display: flex;
			justify-content: space-between;
			align-items: center;

			.gasNumBox {
				display: flex;
				justify-content: space-between;
				align-items: center;
				width: 5em;
				padding: 18rpx;
				padding-right: 0;
				border-radius: 16rpx;
				background: #f0f0f1;
				margin-right: 16rpx;

				.dotBox {
					width: 0;
					height: 0;
					border-left: 10rpx solid transparent;
					border-right: 10rpx solid transparent;
					border-bottom: 14rpx solid black;
					margin-right: 30rpx;
					-webkit-transform: rotate(90deg);
					transform: rotate(90deg);
				}
			}

			.priceShowBox {
				flex: 1;

				.priceShowBoxTop {
					display: flex;
					align-items: baseline;
					color: #F92F3F;
					font-weight: 600;

					.moneyBox {
						font-size: 40rpx;
					}

					.moneyUnitBox {
						font-size: 24rpx;
					}

					.moneyTipsBox {
						font-size: 24rpx;
					}

				}

				.priceShowBoxBottom {
					text-align: center;
					background-color: #ffe4e2;
					font-size: 20rpx;
					color: #F92F3F;
					padding: 0.125em 0;
					width: 11em;
				}
			}

			.intlPriceBox {
				color: #909399;
				font-size: 20rpx;
			}
		}

		// 选择油枪
		.gunNumBox {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 18rpx;
			padding-right: 0;
			border-radius: 16rpx;
			background: #f0f0f1;
			margin: 16rpx 0;

			.placeholderBox {
				color: #969799;
				font-weight: 700;
			}

			.dotBox {
				width: 0;
				height: 0;
				border-left: 10rpx solid transparent;
				border-right: 10rpx solid transparent;
				border-bottom: 14rpx solid black;
				margin-right: 30rpx;
				-webkit-transform: rotate(90deg);
				transform: rotate(90deg);
			}
		}

		// 选择加油金额
		.priceNumBox {
			border-radius: 16rpx;
			// background: #f0f0f1;
			margin: 16rpx 0;

			::v-deep .uni-input-placeholder {
				color: #969799 !important;
				font-weight: 560 !important;
			}

			::v-deep .u-input__content__field-wrapper__field {
				background: #f0f0f1 !important;
			}
		}

		// 金额选择列表
		.priceListBox {
			display: flex;
			justify-content: space-between;
			align-items: center;

			view {
				background-color: #f0f0f1;
				width: 25%;
				text-align: center;
				border-radius: 16rpx;
				padding: 10rpx 0;
			}

		}


		// 定额电子券选择列表
		.elcPriceListBox {
			text-align: center;
			display: flex;
			justify-content: start;
			padding-top: 15rpx;
			gap: 20rpx;
			flex-wrap: wrap;

			.elcPriceItemBox {
				background-color: #f0f0f1;
				border-radius: 16rpx;
				padding: 10rpx 35rpx;

				.originalPriceBox {
					font-size: 46rpx;
				}

				.sellBox {
					padding-top: 4rpx;
					color: #f92f3f;
				}
			}
		}

		.activePayMoney {
			background: #ffe5d9 !important;
		}

		.showCodeTipBox {
			color: #f92f3f;
			padding-top: 1em;
		}
	}

	// 油号、油枪的选择弹框
	.popBox {
		height: 30vh;
		overflow: scroll;

		.popTitle {
			padding: 20rpx;
			font-size: 28rpx;
			font-weight: 600;
		}

		.popListbox {
			padding: 10rpx 20rpx;
			padding-bottom: 4em;
			overflow: auto;
			display: flex;
			flex-wrap: wrap;
			column-gap: 5%;
			row-gap: 0.5em;

			.popItemBox {
				background: #f5f9fa;
				color: #303133;
				border-radius: 16rpx;
				padding: 0.5em;
				font-size: 28rpx;
				width: 20%;
				box-sizing: border-box;
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
</style>