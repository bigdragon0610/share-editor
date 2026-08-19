import { defineConfig, presetIcons, presetUno } from 'unocss'

export default defineConfig({
  // 手動切り替えを行うため、dark: は html.dark で制御する
  presets: [presetUno({ dark: 'class' }), presetIcons()],
})
