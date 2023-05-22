import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'mapbox-gl/dist/mapbox-gl.css'
import "@/assets/reset.css"
export const app = createApp(App)
app.use(createPinia()).use(router).mount('#app')
