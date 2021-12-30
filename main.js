import App from './App'
// import { usqlite } from '@/uni_modules/onemue-USQLite/js_sdk/usqlite.js'
import { usqlite } from '@/uni_modules/onemue-USQLite/js_sdk/usqlite.js' // 挂载 v2 版本
import sql from "@/model/index.js"
usqlite.connect({
    name: 'demo',// 数据库名称
    path:'_doc/demo.db', // 路径
});
 
uni.sql = sql; // 绑定所有model 到uni.sql 或者其他都可以 只有usqlite v2才支持这种写法
uni.$sql = usqlite;

Vue.prototype.dbOptions = {
	name: 'demo',
	path: '_doc/demo.db'
}
// #ifndef VUE3
import Vue from 'vue'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
    ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif