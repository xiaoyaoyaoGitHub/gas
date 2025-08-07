import {
	myRequest
} from './base.js'

// 本接口来源于小幺鸡接口文档  云信加油APP/小程序 
// 但要把url的/vehicleapp 换成 /duduapp   其余参数都一样

// 获取油站列表 
export function reqGasStationList(data) {
	return myRequest({
		url: '/duduapp/station/list',
		method: 'POST',
		data
	})
}
// 获取油枪油号信息
export function reqGasGun(data) {
	return myRequest({
		url: '/duduapp/station/gunList',
		method: 'POST',
		data
	})
}
// 计算加油订单当前的金额
export function reqGasAmount(data) {
	return myRequest({
		url: '/duduapp/pay/orderAmount_app',
		method: 'POST',
		data
	})
}
// 创建加油订单
export function reqCreateGasOrder(data) {  
	return myRequest({
		url:'/duduapp/pay/createOrderJSAPI',
		method:'POST',
		data
	})
}
// 获取用户优惠券
export function reqGasCouponList(data) {  
	return myRequest({
		url:'/duduapp/coupon/list_app',
		method:'POST',
		data
	})
}
// 获取油站订单列表
export function reqGasOrderList(data) {  
	return myRequest({
		url:'/duduapp/order/list_app',
		method:'POST',
		data
	})
}
// 获取油站订单的核销二维码
export function reqOrderQRcode(data) {  
	return myRequest({
		url:'/duduapp/order/getSupInfo_app',
		method:'POST',
		data
	})
}

// 获取油站的核销方式（即 获取电子券产品信息）
export function reqVerifyMode(data) {  
	return myRequest({
		url:'/duduapp/station/productList_app',
		method:'POST',
		data
	})
}
