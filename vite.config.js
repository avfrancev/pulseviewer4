import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Pages from 'vite-plugin-pages'
import Icons from 'unplugin-icons/vite'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import IconsResolver from 'unplugin-icons/resolver'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      extensions: ['vue', 'md', 'js'],
      include: [/\.vue$/, /\.vue\?vue/, /\.js$/],
      resolvers: [
        IconsResolver({
          customCollections: ['custom', 'inline'],
        }),
      ]
    }),
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
      dts: true,
      resolvers: [
        ElementPlusResolver(),
      ],
      vueTemplate: true,
     }),
    Icons({
      compiler: 'vue3',
      autoInstall: true,
    }),
  ],
})
