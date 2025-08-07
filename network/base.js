let baseURL = '';

// baseURL = 'https://test.cdbitdeer.com'; // 测试环境
baseURL = 'https://wxmini.ouoils.com/'; // 正式环境
// baseURL = '/baseUrlTest'; // 跨域

import store from '@/store' // 假设store.js在src/store.js路径下
export const myRequest = (options) => {
	return new Promise((resolve, reject) => {
		let formattedData = {
			cipher: 200,
			noAes: 1,
			content: {
				...options.data,
				appVersion: '1.0.0',
				appGroupId: store.state.userStore.appGroupId,
				packageName: store.state.userStore.appId,
				appChannel: 'app'
			}
		}
		let emptyData = {
			cipher: 200,
			noAes: 1,
		}
		uni.request({
			url: baseURL + options.url, //接口地址：前缀+方法中传入的地址
			method: options.method || 'POST', //请求方法：传入的方法或者默认是“POST”
			data: options.data ? formattedData : emptyData,
			success: (res) => {
				//返回的数据（不固定，看后端接口，这里是做了一个判断，如果不为true，用uni.showToast方法提示获取数据失败)
				if (res.data.status != 200) {
					console.log('响应拦截器，失败的响应体', res);
					console.log('响应拦截器，失败的请求体', formattedData);
					uni.showToast({
						title: res.data.msg || '获取数据失败',
						icon: 'error'
					})
					reject(res.data)

				} else {
					resolve(res.data)
				}
				// 如果不满足上述判断就输出数据
			},
			// 这里的接口请求，如果出现问题就输出接口请求失败
			fail: (err) => {
				console.log('响应拦截器，获取数据失败err', err);
				uni.showToast({
					title: err.msg || '获取数据失败',
					icon: 'error'
				})
				reject(err)
				return
			}
		})
	})
}