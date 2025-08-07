import Vue from 'vue';
import Vuex from 'vuex';
import userStore from './modules/userStore';
import gasStore from './modules/gasStore';
import createPersistedState from "vuex-persistedstate";
import {
	localStorage
} from 'mp-storage'

Vue.use(Vuex);
const store = new Vuex.Store({
	modules: {
		// 注册模块
		gasStore,
		userStore,
	},
	plugins: [createPersistedState({
		key: 'PersistedState',
		paths: [], // 需要持久化的数据们
		storage: localStorage
	})],
});
export default store