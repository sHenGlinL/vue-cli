import Vue from "vue";
import Router from "vue-router";
Vue.use(Router);

const VueRouterPush = Router.prototype.push;
Router.prototype.push = function push(to) {
  return VueRouterPush.call(this, to).catch((err) => err);
};
const VueRouterReplace = Router.prototype.replace;
Router.prototype.replace = function replace(to) {
  return VueRouterReplace.call(this, to).catch((err) => err);
};

const routes = [
  {
    path: '/',
    name: 'welcome',
    component: () => import("@/App.vue"),
  }
]

const router = new Router({
  routes
})

export default router
