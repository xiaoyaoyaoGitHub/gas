import createPersistedState from "vuex-persistedstate";
import {
	objIsEmpty,
	isEmpty
} from '@/utils/someMethods.js';
import {
	reqWXopenid,
	reqZFBopenid,
	reqRegisterWx,
	reqRegisterZFB
} from '@/network/project_api.js'

const state = {
	// 用户信息
	userInfo: {
		// id: null,
		id: null,
		lng: null,
		lat: null, //纬度
		register: true,
	},
	// 三端分别要使用的东西
	appGroupId: 'DDA', //DDA  微信小程序,DDT 抖音小程序,DDP 支付宝程序,
	userUnionid: '',
	scanHomeChannel: null, //推广二维码(扫码进首页时保存的channel)
	scanChannel: null, //扫码进入指定油站时携带的参数
	appId: 'wx1b07f7975090817f', //打开小程序时，根据所处小程序，赋不同的appid
}

const mutations = {
	// 修改用户信息
	setUserInfo(state, param) {
		if (param.register) {
			state.userInfo = param
		} else {
			let obj = {
				...state.userInfo,
				...param
			}
			state.userInfo = obj
		}

	},
	// 修改appGroupId
	setAppGroupId(state, param) {
		state.appGroupId = param;
	},
	// 修改register是否需要注册
	setRegister(state, param) {
		state.userInfo.register = param;
	},
	// 修改Unionid
	setUserUnionid(state, param) {
		state.userUnionid = param;
	},
	// 修改appId
	setAppId(state, param) {
		state.appId = param;
	},
	// 修改扫码进入首页的channel
	setScanHomeChannel(state, param) {
		state.scanHomeChannel = param;
	},
	// 修改扫码进入指定油站时携带的channel
	setScanChannel(state, param) {
		state.scanChannel = param;
	},
}

const actions = {
	//获取支付宝手机号
	async getPhoneNum_zfb({
		state,
		rootState,
		dispatch,
		commit
	}) {
		my.getPhoneNumber({
			success: async (res) => {
				this.getPhonePop = false

				// 支付宝注册
				let reqZFBData = {
					packageName: state.appId,
					appGroupId: state.appGroupId,
					openid: state.userInfo.openid,
					response: res.response,
					channel: state.scanHomeChannel,
					appid: state.appId
				}
				try {
					res = await reqRegisterZFB(reqZFBData)

					// 先更新用户id，避免注册后立即下单，导致无感授权未成功，id未更新
					let idObj = {
						...res.data,
						register:false
					}
					commit('setUserInfo', idObj);
					uni.showToast({
						title: '登录成功',
						icon: 'none'
					});
				} catch (e) {
					uni.showToast({
						title: '请求失败',
						icon: 'none'
					});
					console.log(e);
				}
			},
			fail: (err) => {
				console.log(err)
			}
		});
	},

	//获取微信手机号
	async getPhoneNum_wx({
		state,
		rootState,
		dispatch,
		commit
	}, payload) {
		// console.log('仓库内，判断用户是否允许获取手机号################', payload);
		// e.detail.errMsg // 判断用户是否允许获取手机号
		if (payload.detail.errMsg == "getPhoneNumber:ok") { // 用户允许或去手机号
			// 微信注册
			let reqWxData = {
				packageName: state.appId,
				appGroupId: state.appGroupId,
				openid: state.userInfo.openid,
				unionid: state.userUnionid,
				channel: state.scanHomeChannel,
				phoneCode: payload.detail.code,
			}
			try {
				let res = await reqRegisterWx(reqWxData)
				// 先更新用户id，避免注册后立即下单，导致无感授权未成功，id未更新
					let idObj = {
						...res.data,
						register:false
					}
					commit('setUserInfo', idObj);
				uni.showToast({
					title: '登录成功',
					icon: 'none'
				});
			} catch (e) {
				console.log('获取微信手机号失败', e);
				uni.showToast({
					title: '请求失败',
					icon: 'none'
				});
			}
		}
	},

	// 静默获取用户信息
	async getUserInfo_silence({
		state,
		commit
	}) {
		let theProvider = process.env.UNI_PLATFORM === 'mp-weixin' ?
			'weixin' :
			process.env.UNI_PLATFORM === 'mp-alipay' ?
			'alipay' :
			'';
		try {
			const loginRes = await new Promise((resolve, reject) => {
				uni.login({
					provider: theProvider,
					success: resolve,
					fail: reject,
				});
			});
			// console.log('微信或支付宝，无感获取code成功，loginRes', loginRes);
			let reqData = {
				loginCode: loginRes.code,
				packageName: state.appId,
				channel: state.scanHomeChannel,
			};

			let response;
			if (state.appGroupId === 'DDA') {
				response = await reqWXopenid(reqData);
				// console.log('仓库内静默登录 wx 成功response', response);
			} else if (state.appGroupId === 'DDP') {
				response = await reqZFBopenid(reqData);
				// console.log('仓库内静默登录 zfb 成功response', response);
			} else {
				console.log('抖音登录——暂无');
				return; // 如果是其他平台，直接退出
			}

			commit('setUserInfo', response.data);
			commit('setUserUnionid', response.data.unionid || null);

			return Promise.resolve('success');
		} catch (error) {
			console.log(error);
			uni.showToast({
				title: '请求失败',
				icon: 'error',
			});
			return Promise.reject(error);
		}
	}

}

export default {
	namespaced: true,
	state,
	mutations,
	actions,
}