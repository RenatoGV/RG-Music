import { LinearGradient } from 'expo-linear-gradient';
import { useRootNavigationState, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import splashIcon from '@/assets/splash-icon.png'

export default function NotificationClick() {
  const router = useRouter()
  const navigationState = useRootNavigationState()

  useEffect(() => {
    if(!navigationState?.key) return

    router.replace('/')

    const timeout = setTimeout(() => {
      router.navigate('/player')
    }, 300)

    return () => clearTimeout(timeout)
  }, [navigationState?.key, router])
  
  return (
    <LinearGradient colors={['#fc3c44', '#383838']} style={styles.container}>
      <FastImage
          source={splashIcon}
          style={{ height: 100, width: 100 }}
      />
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
})
