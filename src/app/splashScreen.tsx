import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import LottieView from 'lottie-react-native';

interface Props {
  onFinish: () => void
}

export default function SplashScreen({ onFinish }: Props) {
  return (
    <LinearGradient colors={['#fc3c44', '#383838']} style={styles.container}>
      <StatusBar backgroundColor='transparent' style='light' />
      <LottieView source={require('@/assets/lottie/splash.json')} style={{width: '100%', height: '100%'}} autoPlay loop={false} 
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
