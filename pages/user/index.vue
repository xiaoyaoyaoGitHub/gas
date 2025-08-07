<template>
	<view class="content">
		<view class="userinfo">
			<view class="user_view">
				<image class="user_img" :src="userInfo.headimgurl || defaultAvatar" fit="cover" round></image>
				<!-- </view> -->
				<view class="user_txt">
					{{userInfo.nickname || defaultNickName}}
				</view>
			</view>
		</view>
		<view class="order">
			<view class="order_content">
				<view class="order_item" @click="jump('order')">
					<view class="order_item_left">
						<image class="order_item_img" src='@/static/mine_icon_dingdan.png'></image>
						<view class="order_item_text">我的订单</view>
					</view>
					<u-icon name="arrow-right" color="#a7a7a7" size="32rpx"></u-icon>

				</view>
				<view class="order_item" @click="jump('discount')" style="margin-top: 60rpx;">
					<view class="order_item_left">
						<image class="order_item_img" src='@/static/Coupon.png'></image>
						<view class="order_item_text">我的优惠券</view>
					</view>
					<u-icon name="arrow-right" color="#a7a7a7" size="32rpx"></u-icon>
				</view>
			</view>
		</view>
		<view class="contactinfo">
			<view class="contact_view">联系客服 : <view class="telBox" @click="callPhone(servicePhone)">{{ servicePhone }}</view>
			</view>
			<view class="tips">
				<view>为保证安全，如您在加油站使用手机拨打电话</view>
				<view>请咨询油站工作人员，前往安全区域操作</view>
			</view>
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
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	import {
		reqServiceTel
	} from '@/network/project_api.js'
	import {
		isEmpty
	} from '@/utils/someMethods.js'
	export default {
		// 分享页的设置
		onShareAppMessage(res) {
			return {
				title: '云信加油',
				path: 'pages/carHome/index'
			}
		},
		name: "User",
		data() {
			return {
				station: {},
				userInfo: {},
				nickname: "",
				servicePhone: "",
				defaultAvatar: '/static/userDefaultAvatar.png',
				defaultNickName: '',
				getPhonePop: false, //提示用户需要获取电话号的弹窗
			};
		},
		created() {
			this.getServicePhone()
			this.defaultNickName = `用户_${(this.$store.state.userStore.userInfo.openid).slice(0,8)}`
		},
		computed: {
			...mapState('userStore', {
				appGroupId: state => state.appGroupId
			})
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
			// 获取客服电话
			getServicePhone() {
				let requestData = {
					userId: this.$store.state.userStore.userInfo.id,
				};
				reqServiceTel(requestData).then(res => {
					this.servicePhone = res.data
				})
			},
			// 唤起手机拨号
			callPhone(num) {
				uni.makePhoneCall({
					phoneNumber: num
				})
			},
			back() {
				this.$router.go(-1) //返回上一层
			},
			// 跳转到我的订单或者优惠券
			jump(status) {
				// 如果从未登录过，则要获取手机号
				if (this.$store.state.userStore.userInfo.register) {
					this.getPhonePop = true
					return
				}
				if (status == 'order') {
					uni.navigateTo({
						url: `/pages/orderList/index`,
						fail(err) {
							console.log(err);
						}
					});
				} else if (status == 'discount') {
					uni.navigateTo({
						url: `/pages/couponList/couponList`,
						fail(err) {
							console.log(err);
						}
					});
				}
			},
			// 支付宝获取用户手机号
			async getPhoneNumber_zfb() {
				this.getPhonePop = false
				this.$store.dispatch('userStore/getPhoneNum_zfb');
			},
			// 微信获取用户手机号
			async getPhoneNumber_wx(e) {
				this.getPhonePop = false
				this.$store.dispatch('userStore/getPhoneNum_wx', e);
			},
		},
	};
</script>

<style scoped>
	page {
		background: #F7F8FA;
	}

	.content {
		min-height: 90vh;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		background: linear-gradient(150deg, #FFDAD6, #FFDAD6, rgba(245, 245, 245, 1) 50%);
	}

	.userinfo {
		width: 90%;
		background: #FFFFFF;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		border-radius: 24rpx;
		margin-top: 24rpx;
	}

	/* 用户信息 */
	.user_view {
		width: 100%;
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
		padding: 36rpx;
	}

	.user_img {
		height: 152rpx;
		width: 152rpx;
		border-radius: 50%;
		background: #DDDAD7;
	}

	.user_txt {
		margin-left: 36rpx;
		font-size: 40rpx;
		font-weight: 400;
		color: #333333;
	}

	/* 消费信息 */
	.consume_view {
		width: 100%;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-around;
		margin-top: 48rpx;
		margin-bottom: 32rpx;
	}

	.consume_item {
		height: 80%;
		width: 33%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.cons_txt {
		line-height: 40rpx;
		font-size: 24rpx;
		color: #666666;
		letter-spacing: 0.48rpx;
	}

	.cons_txts {
		font-size: 36rpx;
		font-weight: bold;
		color: #333333;
	}

	/* 订单信息 */
	.order {
		width: 90%;
		background: #FFFFFF;
		margin-top: 24rpx;
		text-align: left;
		font-size: 28rpx;
		font-weight: 600;
		border-radius: 24rpx;
	}

	.order_content {
		padding: 28rpx 60rpx;
	}

	.order_item {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.order_item_left {
		display: flex;
		align-items: center;
	}

	.order_item_img {
		width: 48rpx;
		height: 48rpx;
		margin-right: 8rpx;
	}

	.order_item_text {
		font-size: 28rpx;
		font-weight: 500;
		color: #333333;
	}

	.order_item_imgs {
		width: 20rpx;
		height: 20rpx;
	}

	/* 联系方式 */
	.contactinfo {
		text-align: center;
		height: 160rpx;
		width: 100%;
		margin-top: 32rpx;
		letter-spacing: 0.48rpx;
	}

	.contact_view {
		color: #A4A2A3;
		font-size: 24rpx;
		line-height: 36rpx;
		letter-spacing: 0.48rpx;
		display: flex;
		justify-content: center;
	}

	.telBox {
		color: royalblue;
		text-decoration: underline;
		font-size: 28rpx;
		width: 11em;
	}

	.tips {
		font-size: 24rpx;
		line-height: 24rpx;
		color: #A4A2A3;
		margin-top: 20rpx;
	}

	/* // 提示用户需要获取电话号的弹窗 */
	.getPhonePopBox {
		height: 6em;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 20px;

	}

	.btnBox {
		display: flex;
		justify-content: space-around;
	}
</style>