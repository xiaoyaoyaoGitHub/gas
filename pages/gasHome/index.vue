<template>
	<view class="content">
		<!-- 頂部搜索框 -->
		<view class="topSearchBox">
			<view class="searchBox" @click="jumpSearch">
				<uni-icons type="search" size="40rpx" color="#909399"></uni-icons>
				<text style="margin: 0 10rpx;">搜索加油站</text>
			</view>
			<view style="padding-left: 10px;" @click="getNewPosi"><uni-icons type="location" size="60rpx"
					color="#6b6b6b"></uni-icons></view>
		</view>
		<!-- 顶部装饰盒子 -->
		<view class="topCarBox">
			<image src="@/static/gasPage_banner.png" alt="" />
		</view>
		<!-- 油站列表 -->
		<view class="stationListBox">
			<view class="stationItemBox" v-for="(item,index) in gasStationList" :key="index" @click="jumpStationDetail(item)">
				<view class="imgDesBox">
					<image :src="item.thumb" alt="" />
					<view class="desBox">
						<view class="titleBox">
							{{item.stationname}}
						</view>
						<view class="positionBox">
							{{(item.distance / 1000).toFixed(3)}} km | {{item.address}}
						</view>
					</view>
					<view class="gasUpBtnBox">
						<view class="gasUpBtn">
							立刻加油
						</view>
					</view>
				</view>
				<view class="bottomBox">
					<view class="emptyBox"></view>
					<view class="moneyTipsBox">&yen;</view>
					<view class="moneyBox">{{item.disprice}}</view>
					<view class="moneyUnitBox">/L</view>
					<view class="moneyTipsBox">起</view>
					<!-- <view class="priceGunBox">油站价 &yen;{{item.priceGun}}/L</view> -->
					<view class="desBtnBox">
						<view class="redBackBox">加200元</view>
						<view class="redFontBox">低至&yen;{{item.disprice}}/L</view>
					</view>
				</view>
			</view>
			<u-loadmore :status="status" />
		</view>
		<!-- 提示框 -->
		<u-toast ref="uToast"></u-toast>
		<u-loading-page bg-color="#00000080" :loading="isLoading" color="#fff" iconSize="36"
			font-size="16"></u-loading-page>

	</view>
</template>

<script>
	import {
		reqGasStationList
	} from '@/network/gas_api.js'
	export default {
		// 分享页的设置
		onShareAppMessage(res) {
			return {
				title: '云信加油',
				path: 'pages/gasHome/index'
			}
		},
		data() {
			return {
				keyword: '',
				status: 'nomore',
				currentPage: 1,
				gasStationList: [], //油站列表
				isFirstOnload: false, //首次进入时
				isLoading: false,
				theScanHomeChannel: ""
			}
		},
		async onLoad(options) {
			console.log("option",options);
			// 扫码进入油站首页时的情况，获取channel并存入仓库
			if (options.q) {
				const q = decodeURIComponent(options.q) // 获取到二维码原始链接内容
				console.log("获取到二维码原始链接内容",q);
				const queryString = q.split('?')[1];
				console.log("获取queryString内容",queryString);
				// 解析参数
				const params = {};
				if (queryString) {
					queryString.split('&').forEach(item => {
						const [key, value] = item.split('=');
						params[key] = decodeURIComponent(value);
					});
				}
				console.log("扫码进入解析出来的参数：", params);
				if (params.channel && !params.originalcode) {
					// 扫码进入首页
					this.theScanHomeChannel = params.channel
					this.$store.commit('userStore/setScanHomeChannel', params.channel)

				}
			}

			this.isFirstOnload = true
			// 首次进入时，获取openid
			await this.$store.dispatch('userStore/getUserInfo_silence');
			this.getUserLocation()
			this.isFirstOnload = false
		},
		async onShow() {
			// 将滚动条设到顶部，用于触底的分页
			uni.pageScrollTo({
				scrollTop: 0,
				duration: 0,
			})
			if (!this.isFirstOnload) {
				// 如果是首次启动页面，则不调用获取列表的方法
				this.status = 'loading'
				this.currentPage = 1
				this.getList()
				return
			}
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
			// 重新获取定位
			getNewPosi() {
				this.isLoading = true
				uni.pageScrollTo({
					scrollTop: 0,
					duration: 0,
				})
				// #ifdef MP-WEIXIN
				wx.getSetting({
					success: (res) => {
						var statu = res.authSetting;
						if (!statu['scope.userLocation']) { //判断是否授权，没有授权就提示下面的信息
							wx.showModal({
								title: '授权您的地理位置，用于获取周围站点信息',
								success: (tip) => {
									if (tip.confirm) { //查看是否点击确定
										wx.openSetting({ //打开设置
											success: (data) => {
												if (data.authSetting["scope.userLocation"] == true) { //到这一步表示打开了位置授权
													uni.getLocation({
														type: 'wgs84',
														success: (res) => {
															let location = {
																lng: res.longitude,
																lat: res.latitude
															}
															this.$store.commit('userStore/setUserInfo', location)
														},
														fail: (err) => {
															uni.showToast({
																title: '获取定位失败',
																icon: 'error'
															});
														},
														complete: () => {
															this.status = 'loading'
															this.currentPage = 1
															this.getList()
														}
													})
												} else {
													console.log('授权失败');
												}
											},
											fail: function() {}
										})
									} else {
										uni.showToast({
											title: '授权失败',
											icon: 'error'
										});
										this.isLoading = false
									}
								}
							})
						} else {
							// 若已授权则更新当前定位
							uni.getLocation({
								type: 'wgs84',
								success: (res) => {
									console.log("获取定位信息res", res);
									let location = {
										lng: res.longitude,
										lat: res.latitude
									}
									this.$store.commit('userStore/setUserInfo', location)

								},
								fail: (err) => {
									uni.showToast({
										title: '获取定位失败',
										icon: 'error'
									});
								},
								complete: () => {
									this.status = 'loading'
									this.currentPage = 1
									this.getList()
								}
							})
						}
					}
				})
				// #endif

				// #ifdef MP-ALIPAY
				uni.getLocation({
					success: (res) => {
						let location = {
							lng: res.longitude,
							lat: res.latitude
						}
						this.$store.commit('userStore/setUserInfo', location)
					},
					fail: (err) => {
						uni.showToast({
							title: '获取定位失败',
							icon: 'error'
						});
					},
					complete: () => {
						this.status = 'loading'
						this.currentPage = 1
						this.getList()
					}
				})
				// #endif

			},
			// 跳转到搜索页
			jumpSearch() {
				uni.navigateTo({
					url: '/pages/gasSearch/gasSearch',
					fail(err) {
						console.log(err);
					}
				});
			},
			jumpStationDetail(item) {
				this.$store.commit('gasStore/setGasInfo', item);
				uni.navigateTo({
					url: `/pages/gasPlaceOrder/index`,
					fail(err) {
						console.log(err);
					}
				});
			},
			// 获取油站数据
			getList(thePageIndex) {
				let reqData = {
					channel: this.$store.state.userStore.userInfo.channel || this.theScanHomeChannel,
					userId: this.$store.state.userStore.userInfo.id,
					pageIndex: thePageIndex || 1,
					pageSize: 10,
					stationname: null,
					address: null,
					lng: this.$store.state.userStore.userInfo.lng,
					lat: this.$store.state.userStore.userInfo.lat
				}
				reqGasStationList(reqData).then(res => {
					if (thePageIndex) {
						// 多次触底请求
						if (res.data.length == 0) {} else {
							this.gasStationList = this.gasStationList.concat(res.data)
						}
					} else {
						// 首次请求
						this.gasStationList = res.data;
					}
					this.status = 'nomore'
				}).catch((error) => {
					this.status = 'nomore'
					console.error('Error calculating total amount:', error);
				}).finally(() => {
					this.isLoading = false
				});
			},
			// 触碰到底部的方法
			onReachBottom() {
				if (this.status == 'loading') {
					return
				}
				this.status = 'loading'
				this.currentPage = ++this.currentPage;
				this.getList(this.currentPage)
			},
			// 获取用户定位
			getUserLocation() {
				uni.showLoading({
					title: '获取定位中'
				});
				// 获取定位信息
				// #ifdef MP-WEIXIN
				uni.getLocation({
					type: 'wgs84',
					success: (res) => {
						console.log("获取定位信息res", res);
						let location = {
							lng: res.longitude,
							lat: res.latitude
						}
						this.$store.commit('userStore/setUserInfo', location)
					},
					fail: (err) => {
						uni.showToast({
							title: '获取定位失败',
							icon: 'error'
						});
					},
					complete: () => {
						this.status = 'loading'
						this.currentPage = 1
						this.getList()
						uni.hideLoading()
					}
				})
				// #endif

				// #ifdef MP-ALIPAY
				uni.getLocation({
					success: (res) => {
						let location = {
							lng: res.longitude,
							lat: res.latitude
						}
						this.$store.commit('userStore/setUserInfo', location)
					},
					fail: (err) => {
						uni.showToast({
							title: '获取定位失败',
							icon: 'fail'
						});
					},
					complete: () => {
						this.status = 'loading'
						this.currentPage = 1
						this.getList()
						uni.hideLoading()
					}
				})
				// #endif
			},
		}
	}
</script>

<style lang="scss">
	.content {
		background: linear-gradient(150deg, #FFDAD6, #FFDAD6, rgba(245, 245, 245, 1) 50%);
		min-height: 90vh;
		padding: 0 16rpx;
		padding-bottom: 100rpx;
	}

	.topSearchBox {
		display: flex;
		align-items: center;

		.searchBox {
			flex: 1;
			background-color: #ffffff;
			border-radius: 100px;
			color: #606266;
			font-size: 28rpx;
			padding-left: 30rpx;
			display: flex;
			padding: 16rpx;
			padding-left: 30rpx;
			height: 40rpx;
			line-height: 40rpx;
		}
	}

	// 顶部装饰盒子
	.topCarBox {
		height: 300rpx;
		width: 100%;
		margin: 20rpx 0;

		image {
			height: 300rpx;
			width: 100%;
		}
	}

	// 油站列表
	.stationListBox {
		.stationItemBox {
			border-radius: 16px;
			background: #FFF;
			box-shadow: 0 4px 12px 0 #00000008;
			padding: 16rpx 24rpx;
			margin-top: 16rpx;

			.imgDesBox {
				display: flex;

				image {
					width: 100rpx;
					height: 100rpx;
					border-radius: 8px;
					margin-right: 16rpx;
				}

				.desBox {
					display: flex;
					flex-direction: column;
					justify-content: space-around;
					flex: 1;


					.titleBox {
						font-size: 34rpx;
						color: #000000;
						font-weight: 600;

					}

					.positionBox {
						color: #9C9C9C;
						font-size: 22rpx;
						font-weight: 400;
						display: -webkit-box;
						-webkit-box-orient: vertical;
						-webkit-line-clamp: 1;
						overflow: hidden;
					}
				}

				.gasUpBtnBox {
					flex-shrink: 0;
					display: flex;
					flex-direction: column;
					align-items: center;

					.gasUpBtn {
						font-size: 22rpx;
						color: #F56256;
						font-weight: 600;
						background-color: #ffe4e2;
						padding: 10rpx 20rpx;
						border-radius: 30rpx;
						margin: auto;
					}
				}
			}

			.bottomBox {
				display: flex;
				align-items: baseline;
				// padding: 14rpx;/
				position: relative;
				border-radius: 16rpx;
				color: #F92F3F;

				.emptyBox {
					width: 120rpx;
					background-color: rgba(255, 117, 80, 0);
				}

				.moneyBox {
					font-size: 36rpx;
					font-weight: 600;
				}

				.moneyUnitBox {
					font-size: 24rpx;
				}

				.moneyTipsBox {
					font-size: 28rpx;
				}

				.priceGunBox {
					color: #9c9c9c;
					font-size: 22rpx;
					text-decoration: line-through;
					margin-left: 20rpx;
				}

				.desBtnBox {
					display: flex;
					align-items: center;
					justify-content: space-around;
					border-radius: 10px 0 12px 0;
					margin-left: 10rpx;
					box-sizing: border-box;
					background-color: #ffefc3;
					border: 1rpx solid #FF7551;
					font-size: 20rpx;
					color: #F92F3F;
					padding: 0 16rpx;
					padding-left: 0;
					font-weight: 500;
					overflow: hidden;

					.redBackBox {
						font-size: 20rpx;
						padding: 5rpx 16rpx;
						justify-content: center;
						align-items: center;
						border-radius: 10px 0 12px 0;
						margin-right: 5rpx;
						// border: 1px solid #F92F3F;
						background: linear-gradient(312deg, #f67f1d, #ff605b);
						box-shadow: 2px 2px 8px 0 #0000001a;
						color: #FFF;
					}

				}
			}

		}
	}
</style>