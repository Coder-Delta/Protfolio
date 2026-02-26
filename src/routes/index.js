import { createRouter, createWebHistory } from "vue-router"
import Home from "@/Pages/Home.vue"
import Projects from "@/Pages/Projects.vue"

const routes = [
  { path: "/", component: Home },
  { path: "/projects", component: Projects }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
