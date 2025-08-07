<template>
	<view class="content">
		<!-- 頂部搜索框 -->
		<view class="topSearchBox">
			<u-search v-model="keyword" :showAction="true" actionText="搜索" :animation="true" placeholder="搜索加油站"
				maxlength='20' bgColor='#ffffff' @search='handelSearch()' @custom='handelSearch()' :clearabled="false" :focus="true">
			</u-search>
		</view>
		<!-- 顶部装饰盒子 -->
		<view class="nowTitleBox">历史搜索</view>
		<view class="topCarBox">
			<view class="historyItem" v-for="i in historyList" :key="i" @click="handleHistory(i)">
				<view class="">{{i}}</view>
				<!-- <view class="iconBox" @click="delHistory(i)"><u-icon name="close-circle" size="14"></u-icon></view> -->
			</view>
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
					<view class="desBtnBox">
						<view class="redBackBox">加200元</view>
						<view class="redFontBox">低至&yen;{{item.disprice}}/L</view>
					</view>
				</view>
			</view>
			<u-loadmore :status="status" />
		</view>
	</view>
</template>

<script>
	import {
		localStorage
	} from 'mp-storage'
	import {
		reqGasStationList
	} from '@/network/gas_api.js'
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
				keyword: '',
				historyList: [],
				status: 'nomore',
				currentPage: 1,
				gasStationList: [], //油站列表
			}
		},
		created() {
			if (!localStorage.getItem('historyList')) {
				localStorage.setItem('historyList', JSON.stringify([]))
			}
			// 获取缓存的历史记录
			this.historyList = JSON.parse(localStorage.getItem('historyList'))
		},
		methods: {
			handelSearch() {
				if (this.keyword) {
					this.keyword = this.keyword.trim()
					let list = JSON.parse(localStorage.getItem('historyList'))
					const isExist = list.some(element => element == this.keyword);
					if (!isExist) {
						list.unshift(this.keyword)
					}
					if (list.length > 10) {
						list = list.slice(0, 10)
					}
					localStorage.setItem('historyList', JSON.stringify(list))
					this.historyList = list
					this.getList()
				}
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
			// 点击历史记录
			handleHistory(i) {
				this.keyword = i
				this.status = 'loading'
				this.getList()
			},
			// 获取油站数据
			getList(thePageIndex) {
				let reqData = {
					userId: this.$store.state.userStore.userInfo.id,
					channel:this.$store.state.userStore.userInfo.channel ||  this.$store.state.userStore.scanHomeChannel,
					pageIndex: thePageIndex || 1,
					pageSize: 20,
					stationname: this.keyword,
					address: null,
					lng: this.$store.state.userStore.userInfo.lng,
					lat: this.$store.state.userStore.userInfo.lat
				}
				reqGasStationList(reqData).then(res => {
					if (thePageIndex) {
						// 多次触底请求
						if (res.data.length == 0) {
							this.status = 'nomore'
						} else {
							this.gasStationList = this.gasStationList.concat(res.data)
							this.status = 'nomore'
						}
					} else {
						// 首次请求
						this.gasStationList = res.data;
						this.status = 'nomore'
					}

				}).catch((error) => {
					console.error('Error calculating total amount:', error);
				});
			},
			// 触碰到底部的方法
			onReachBottom() {
				console.log('触碰到底部的方法被调用');
				if (this.status == 'loading') {
					return
				}
				this.status = 'loading'
				this.currentPage = ++this.currentPage;
				this.getList(this.currentPage)
			},
		}
	}
</script>

<style lang="scss">
	.content {
		background: linear-gradient(150deg, #FFDAD6, #FFDAD6, #fff 50%);
		min-height: 90vh;
		padding: 0 16rpx;
		padding-bottom: 100rpx;
		box-sizing: border-box;
	}

	.nowTitleBox {
		margin: 20rpx 0;
	}

	// 顶部装饰盒子
	.topCarBox {
		max-height: 300rpx;
		width: 100%;
		margin: 20rpx 0;
		// background-color: skyblue;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		column-gap: 40rpx;
		row-gap: 20rpx;

		.historyItem {
			background-color: #fff;
			border-radius: 15rpx;
			padding: 5rpx 25rpx;
			font-size: 24rpx;
			color: #606266;
			position: relative;

			.iconBox {
				position: absolute;
				right: -10rpx;
				top: -5rpx;

			}
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