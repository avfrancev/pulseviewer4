import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
// import { GesturePlugin } from '@vueuse/gesture'
import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages'

import { createYmaps } from 'vue-yandex-maps';


const router = createRouter({
    history: createWebHistory(),
    routes,
})

createApp(App)
.use(router)
.use(createYmaps({
    apikey: 'a0212be8-caa5-4f01-8dc3-9ec59a4348bb',
    // lang: 'ru_RU',
    // coordorder: 'latlong',
    // enterprise: false,
    // version: '2.1'
}))
.mount('#app')
