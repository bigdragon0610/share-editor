import { defineConfig, presetIcons, presetUno } from 'unocss'

export default defineConfig({
  // OSの設定 (prefers-color-scheme) に追従させるため media ストラテジを使う
  presets: [presetUno({ dark: 'media' }), presetIcons()],
})
