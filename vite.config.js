import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Pages from 'vite-plugin-pages'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({ /* options */ }),
    Pages(),    
    AutoImport({ 
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
        /\.md$/, // .md
      ],
    
      // global imports to register
      imports: [
        // presets
        'vue',
        '@vueuse/core',
        // custom
      ],
      resolvers: [
        ElementPlusResolver(),
      ],
      vueTemplate: true,
     }),
  ],
})
