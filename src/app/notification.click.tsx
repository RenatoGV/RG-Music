import { LinearGradient } from 'expo-linear-gradient';
import { Redirect } from 'expo-router';
import { StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';

export default function NotificationClick() {
  return (
    <LinearGradient colors={['#fc3c44', '#383838']} style={styles.container}>
      <FastImage
          source={require('@/assets/splash-icon.png')}
          style={{ height: 100, width: 100 }}
      />
      <Redirect href="/" />
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