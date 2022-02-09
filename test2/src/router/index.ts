
import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

export const constantRoutes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "welcome",
    component: () => import("@/App.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
});

export default router;
