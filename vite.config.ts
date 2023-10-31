import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default ({ mode }) => {
  process.env = Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  if (mode === 'lib') {
    // Library Mode
    return defineConfig({
      build: {
        outDir: 'dist',
        minify: true,
        lib: {
          entry: resolve(__dirname, './src/maplibre-gl-overview-map.ts'),
          name: 'OverviewMapControl',
          fileName: 'maplibre-gl-overview-map'
        },
        rollupOptions: {
          output: {
            assetFileNames: `maplibre-gl-overview-map.css`
          }
        }
      },
      plugins: [dts()]
    })
  } else {
    // Deploy to Github Page
    return defineConfig({
      base: '/maplibre-gl-overview-map/',
      build: {
        outDir: 'dist/example',
        minify: true
      }
    })
  }
}
