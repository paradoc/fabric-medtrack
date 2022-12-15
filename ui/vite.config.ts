import { defineConfig, loadEnv } from 'vite'
import type { ManifestOptions, VitePWAOptions } from 'vite-plugin-pwa'
import { VitePWA } from 'vite-plugin-pwa'
import react from '@vitejs/plugin-react'
import replace from '@rollup/plugin-replace'
import fs from 'fs'
import dayjs from 'dayjs'

const pwaOptions: Partial<VitePWAOptions> = {
  mode: 'development',
  base: '/',
  includeAssets: ['*'],
  // we'll use https://realfavicongenerator.net/ for manifest generation
  manifest: false,
  devOptions: {
    enabled: process.env.SW_DEV === 'true',
    /* when using generateSW the PWA plugin will switch to classic */
    type: 'module',
    navigateFallback: 'index.html',
  },
}

const replaceOptions = {
  __DATE__: dayjs().format('YYYY-MM-DD HH:mm:ssZ[Z]'),
  __DOMAIN__: loadEnv('', process.cwd()).VITE_NGROK_URL
}
const claims = process.env.CLAIMS === 'true'
const reload = process.env.RELOAD_SW === 'true'
const selfDestroying = process.env.SW_DESTROY === 'true'

if (process.env.SW === 'true') {
  pwaOptions.srcDir = 'src/sw'
  pwaOptions.filename = claims ? 'claims-sw.ts' : 'prompt-sw.ts'
  pwaOptions.strategies = 'injectManifest'
    ; (pwaOptions.manifest as Partial<ManifestOptions>).name = 'PWA Inject Manifest'
    ; (pwaOptions.manifest as Partial<ManifestOptions>).short_name = 'PWA Inject'
}

if (claims)
  pwaOptions.registerType = 'autoUpdate'

if (reload) {
  // @ts-expect-error just ignore
  replaceOptions.__RELOAD_SW__ = 'true'
}

if (selfDestroying)
  pwaOptions.selfDestroying = selfDestroying


// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: process.env.SOURCE_MAP === 'true',
  },
  plugins: [react(), VitePWA(pwaOptions), replace(replaceOptions)],
  server: {
    https: {
      // generated via `mkcert localhost "*.example.com"`
      key: fs.readFileSync('./keys/localhost+1-key.pem'),
      cert: fs.readFileSync('./keys/localhost+1.pem'),
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
