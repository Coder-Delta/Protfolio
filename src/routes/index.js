import { createRouter, createWebHistory } from "vue-router"
import Home from "@/Pages/Home.vue"
import Projects from "@/Pages/Projects.vue"

const routes = [
  { path: "/", component: Home, meta: { transition: "page-slide" } },
  { path: "/projects", component: Projects, meta: { transition: "page-slide" } }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    return {
      top: 0,
      behavior: to.path === from.path ? "auto" : "smooth"
    }
  }
})

export default router
