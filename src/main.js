import { createApp } from "vue"
import App from "./App.vue"
import router from "./routes"
import { analytics } from "./services/analytics.js"

createApp(App)
  .use(router)
  .mount("#app")

analytics.install(router)
