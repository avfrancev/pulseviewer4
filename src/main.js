import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { GesturePlugin } from '@vueuse/gesture'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import routes from '~pages'

const pinia = createPinia()

const router = createRouter({
    history: createWebHistory(),
    routes,
})

const app = createApp(App)

// app.config.performance = true;
app.config.devtools = true;

app.use(pinia)
app.use(router)
app.use(GesturePlugin)
app.mount('#app')
