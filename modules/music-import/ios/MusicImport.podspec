Pod::Spec.new do |s|
  s.name           = 'MusicImport'
  s.version        = '1.0.0'
  s.summary        = 'Native helpers for importing music files.'
  s.description    = 'Reads local audio durations for the RG Music library.'
  s.author         = 'RG Music'
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.license        = { :type => 'MIT' }
  s.platform       = :ios, '15.1'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,mm,swift}"
end
