import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import LottieView from 'lottie-react-native';
import splashAnimation from '@/assets/lottie/splash.json'

interface Props {
  onFinish: () => void
}

export default function SplashScreen({ onFinish }: Readonly<Props>) {
  return (
    <LinearGradient
      pointerEvents="none"
      colors={['#297051', '#02181C', '#0E0E10']}
      locations={[0, 0.36, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <StatusBar style='light' />
      <LottieView source={splashAnimation} style={{width: '100%', height: '100%'}} autoPlay loop={false}
        onAnimationFinish={onFinish}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  textContainer: {
    flexDirection: 'row',
  },
  text: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
});
