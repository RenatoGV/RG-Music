import { requireNativeModule } from 'expo'
import { Platform } from 'react-native'

type AudioDurationModule = {
  getDuration: (uri: string) => Promise<number>
}

export const getAudioDuration = async (uri: string): Promise<number | null> => {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') return null

  try {
    const module = requireNativeModule<AudioDurationModule>('MusicImport')
    const duration = await module.getDuration(uri)
    return Number.isFinite(duration) && duration > 0 ? duration : null
  } catch (error) {
    console.warn('No se pudo leer la duración del audio', { uri, error })
    return null
  }
}
