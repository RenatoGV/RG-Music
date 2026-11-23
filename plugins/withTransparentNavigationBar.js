const { withAndroidStyles } = require('@expo/config-plugins')

const upsertItem = (items, name, value, extraAttributes = {}) => {
  const existing = items.find((item) => item.$?.name === name)
  if (existing) {
    existing._ = value
    Object.assign(existing.$, extraAttributes)
    return
  }

  items.push({ $: { name, ...extraAttributes }, _: value })
}

const withTransparentNavigationBar = (config) => withAndroidStyles(config, (configMod) => {
  const resources = configMod.modResults.resources
  const appTheme = resources.style?.find((style) => style.$?.name === 'AppTheme')
  if (!appTheme) return configMod

  appTheme.item ??= []
  upsertItem(appTheme.item, 'android:navigationBarColor', '@android:color/transparent')
  upsertItem(appTheme.item, 'android:enforceNavigationBarContrast', 'false', { 'tools:targetApi': '29' })
  upsertItem(appTheme.item, 'android:windowLightNavigationBar', 'false', { 'tools:targetApi': '29' })

  const rootAttributes = resources.$ ?? (resources.$ = {})
  rootAttributes['xmlns:tools'] ??= 'http://schemas.android.com/tools'
  return configMod
})

module.exports = withTransparentNavigationBar
