const { withAndroidManifest } = require('@expo/config-plugins')

const withYtDlpAndroid = (config) => withAndroidManifest(config, (configMod) => {
  const application = configMod.modResults.manifest.application?.[0]
  if (application) application.$['android:extractNativeLibs'] = 'true'
  return configMod
})

module.exports = withYtDlpAndroid
