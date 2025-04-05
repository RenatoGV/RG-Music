import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

export default function SplashScreen() {
  // Valor animado para la rotación
  const rotateValue = useRef(new Animated.Value(0)).current;
  const fullText = 'RG Music';
  const [textArray, setTextArray] = useState(
    fullText.split('').map(() => new Animated.Value(0))
  );

  useEffect(() => {
    // Crea una animación que oscila entre -1 y 1 y se repite en bucle
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateValue, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotateValue, {
          toValue: -1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotateValue, {
          toValue: 0,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animación de fade-in letra por letra
    textArray.forEach((animValue, index) => {
      setTimeout(() => {
        Animated.timing(animValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
      }, index * 200);
    });
  }, []);

  // Interpolamos el valor para obtener una rotación en grados
  const rotate = rotateValue.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-5deg', '5deg'],
  });

  return (
    <LinearGradient colors={['#fc3c44', '#383838']} style={styles.container}>
      <StatusBar backgroundColor='transparent' style='light' />
      <Animated.Image
        source={require('./../../assets/splash-icon.png')}
        style={[styles.logo, { transform: [{ rotate }] }]} 
      />
      <View style={styles.textContainer}>
        {fullText.split('').map((char, index) => (
          <Animated.Text key={index} style={[styles.text, { opacity: textArray[index] }]}>
            {char}
          </Animated.Text>
        ))}
      </View>
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
