import {
	myRequest
} from './base.js'

// 获取微信的openid
export function reqWXopenid(data) {
	return myRequest({
		url: '/duduapp/app_user/wx_login',
		method: 'POST',
		data
	})
}
// 微信注册
export function reqRegisterWx(data) {
	return myRequest({
		url: '/duduapp/app_user/wx_register',
		method: 'POST',
		data
	})
}
// 获取支付宝的openid
export function reqZFBopenid(data) {
	return myRequest({
		url: '/duduapp/app_user/ali_login',
		method: 'POST',
		data
	})
}
// 支付宝注册
export function reqRegisterZFB(data) {
	return myRequest({
		url: '/duduapp/app_user/ali_register',
		method: 'POST',
		data
	})
}
// 获取客服电话
export function reqServiceTel(data) {
	return myRequest({
		url: '/duduapp/app_user/getCustomerServiceTel',
		method: 'POST',
		data
	})
}
// 计算服务费的费率
export function reqCalServicePay(data) {
	return myRequest({
		url: '/duduapp/pay/serviceRate_app2',
		method: 'POST',
		data
	})
}
// 获取用户优惠券
export function reqCouponList(data) {  
	return myRequest({
		url:'/duduapp/userCoupon/usable',
		method:'POST',
		data
	})
}