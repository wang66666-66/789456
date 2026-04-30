import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { router } from './router'
import App from './App.vue'
import './style.css'
import { useUserStore } from '@/stores/user'

// 引入Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
const pinia = createPinia()
setActivePinia(pinia)

app.use(pinia)
useUserStore().loadFromLocalStorage()
app.use(router)
app.use(ElementPlus)

app.mount('#app')