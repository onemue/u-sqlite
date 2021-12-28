import App from './App'
// import { usqlite } from '@/uni_modules/onemue-USQLite/js_sdk/usqlite.js'
import { usqlite } from '@/uni_modules/onemue-USQLite/js_sdk/usqlite_v2.js' // 挂载 v2 版本

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