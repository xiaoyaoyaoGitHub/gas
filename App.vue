<script>
	import {
		reqWXopenid,
		reqZFBopenid
	} from '@/network/project_api.js'
	import {
		reqGasStationList
	} from '@/network/gas_api.js'
	export default {
		onLaunch: function(options) {
			//获取用户的openidid
			if (process.env.UNI_PLATFORM === 'mp-weixin') {
				// 微信小程序中
				this.$store.commit('userStore/setAppGroupId', 'DDA')
				this.$store.commit('userStore/setAppId', 'wx1b07f7975090817f')
				
			} else if (process.env.UNI_PLATFORM === 'mp-alipay') {
				// 支付宝小程序
				this.$store.commit('userStore/setAppGroupId', 'DDP')
				this.$store.commit('userStore/setAppId', '2021006109676006')
				// 支付宝扫码进入小程序，只能在app.vue获取二维码数据。
				if (options.query) {
					const q = decodeURIComponent(options.query.qrCode) // 获取到二维码原始链接内容
					const queryString = q.split('?')[1];
					// 解析参数
					const params = {};
					if (queryString) {
						queryString.split('&').forEach(item => {
							const [key, value] = item.split('=');
							params[key] = decodeURIComponent(value);
						});
					}
					console.log("扫码进入解析出来的参数：", params);
					if (params.channel && params.originalcode) {
						// 扫码进入指定油站
						this.$store.commit('userStore/setScanChannel', params.channel)
						this.$store.commit('gasStore/setScanOriginalcode', params.originalcode)

					} else if (params.channel) {
						// 扫码进入首页
						this.$store.commit('userStore/setScanHomeChannel', params.channel)
					}
				}
			} else if (process.env.UNI_PLATFORM === 'mp-toutiao') {
				// 抖音小程序
				this.$store.commit('userStore/setAppGroupId', 'DDT')
			} else {
				// 其他平台的处理逻辑
			}
		},
		onShow: function() {
			// ——————————检测小程序更新
			const updateManager = uni.getUpdateManager();
			updateManager.onCheckForUpdate(function(res) {
				// 请求完新版本信息的回调
			});
			updateManager.onUpdateReady(function(res) {
				uni.showModal({
					title: '更新提示',
					content: '新版本已经准备好，是否重启应用？',
					success(res) {
						if (res.confirm) {
							// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
							updateManager.applyUpdate();
						}
					}
				});
			});
			updateManager.onUpdateFailed(function(res) {
				// 新的版本下载失败
				console.log("新的版本下载失败");
			});
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {}
	}
</script>

<style lang="scss">
	/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
	@import "@/uni_modules/uview-ui/index.scss";
</style>