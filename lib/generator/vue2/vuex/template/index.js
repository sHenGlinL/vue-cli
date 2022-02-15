import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
Vue.use(Vuex)

const modulesFiles = import.meta.globEager('./modules/*.js')
const modules = {}
Object.entries(modulesFiles).map(([modulePath, value]) => {
  const moduleName = modulePath.replace(/(\.\/modules\/|\.js)/g, '')
  modules[moduleName] = value.default
})

const store = new Vuex.Store({
  modules,
  getters
})

export default store