<template>
	<view class="orderMainBox">
			<GasOrder ref="gasRef"></GasOrder>
	</view>
</template>

<script>
	import GasOrder from './gasOrder.vue'
	export default {
		// 分享页的设置  支付宝所有页面都能分享，故这里设置分享页面为首页
		name: "Order",
		components: {
			GasOrder,
		},
	}
</script>
<style lang="scss" scoped>
	.orderMainBox {
		position: relative;
	}
</style>