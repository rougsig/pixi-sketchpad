import path from 'path'
import {defineConfig} from 'vite'
import {visualizer} from 'rollup-plugin-visualizer'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    visualizer(),
  ],
})
