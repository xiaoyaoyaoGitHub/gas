import createPersistedState from "vuex-persistedstate";
import {
	reqGasAmount
} from '@/network/gas_api.js';
import {
	objIsEmpty
} from '@/utils/someMethods.js';

// 云信加油相关的仓库数据
const state = {
	// 后端没有根据id查油站的接口。故进入油站详情页前端要存储油站的全部数据
	stationInfo: {},
	// 计算金额时，需要填写的订单数据
	gasOrderInfo: {
		oilNo: '', //当前选择的油号
		oilgun: '', //当前选择的油枪
		goodsAmount: '', //选择的加油金额
		couponId: null, //优惠券Id
		channel: null,
	},
	// 计算完金额后返回的数据
	gasAmountInfo: {
		goodsAmount: null, //应付金额
		orderAmount: null, //实付金额
		couponId: null, //优惠劵ID
		couponSn: null, //优惠劵编号
		couponAmount: null, //优惠劵金额
		serviceAmount: null, //服务费金额
		balance: null, //加油金金额
		diffAmount: null, //优惠直降金额
		disAgent: null //?
	},
	scanOriginalcode:null, //扫码进入油站时保存油站code
	elecProductId:"", //电子券支付时要传的productId
}

const mutations = {
	// 更改所选油站的信息
	setGasInfo(state, param) {
		state.stationInfo = param
	},
	// 更改计算金额时的订单信息
	setGasOrderInfo(state, param) {
		state.gasOrderInfo = {
			...state.gasOrderInfo,
			...param
		};
	},
	// 更改金额信息
	setAmount(state, param) {
		state.gasAmountInfo = param;
	},
	// 更改扫码进入油站时保存油站
	setScanOriginalcode(state, param) {
		state.scanOriginalcode = param;
	},
	// 更改电子券支付时的productId
	setElecProductId(state, param) {
		state.elecProductId = param;
	},
}

const actions = {
	//计算订单价格
	async calculateTotalAmount({
		commit,
		state,
		rootState
	}) {
		let reqData = {
			...state.gasOrderInfo,
			// 在详情页登录后，gasOrderInfo可能对用户信息更新不及时，这里再更新一次
			channel:rootState.userStore.userInfo.channel || rootState.userStore.scanHomeChannel,
			userId:rootState.userStore.userInfo.id,
		}
		try {
			const res = await reqGasAmount(reqData);
			commit('setAmount', res.data);
		} catch (error) {
			console.error('Error calculating total amount:', error);
		}
	}
}


export default {
	namespaced: true,
	state,
	mutations,
	actions,
};