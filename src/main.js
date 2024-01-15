import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
// import { GesturePlugin } from '@vueuse/gesture'
import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages'
console.log(routes);

const router = createRouter({
    history: createWebHistory(),
    routes,
})

createApp(App)
.use(router)
.mount('#app')
