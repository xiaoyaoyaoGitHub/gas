import Vue from 'vue'
import App from './App'
import uView from '@/uni_modules/uview-ui'
import store from '@/store/index.js'

Vue.prototype.$store = store
Vue.use(uView);
Vue.config.productionTip = false
App.mpType = 'app'


//app.vue  onlunch调用结束后才能调用onload
Vue.prototype.$onLaunched = new Promise(resolve => {
	Vue.prototype.$isResolve = resolve
})

const app = new Vue({
	store,
	...App
})
app.$mount()