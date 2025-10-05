// player.tsx (imports al inicio del archivo)
import { PanGestureHandler, State } from 'react-native-gesture-handler'
import { Animated, View } from 'react-native' // Animated clásico (no Reanimated)
import { useRef } from 'react'
import { useNavigation } from 'expo-router' // ya usas expo-router
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// ... dentro de PlayerScreen o en el mismo archivo:

export const DismissPlayerSymbol2 = () => {
  const { top } = useSafeAreaInsets()
  const navigation = useNavigation()
  const translateY = useRef(new Animated.Value(0)).current

  // actualizar el translate mientras arrastra (solo para dar feedback si quieres)
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  )

  const onHandlerStateChange = ({ nativeEvent }: any) => {
    // oldState === ACTIVE significa que el gesto terminó
    if (nativeEvent.oldState === State.ACTIVE) {
      const { translationY, velocityY } = nativeEvent

      const DISMISS_DISTANCE = 120
      const DISMISS_VELOCITY = 1000

      if (translationY > DISMISS_DISTANCE || velocityY > DISMISS_VELOCITY) {
        // cerrar la pantalla
        navigation.goBack()
      } else {
        // volver a la posición original con animación
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start()
      }
    }
  }

  // Opcional: mapea translateY a una opacidad o transform para feedback visual
  const animatedStyle = {
    transform: [{ translateY: translateY }]
  }

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      // activeOffsetY puede ayudar a evitar trigger por pequeños toques
      // por ejemplo: activeOffsetY={[-5, 5]} (ajusta si quieres)
    >
      <Animated.View style={{
        position: 'absolute',
        top: top + 8,
        left: 0,
        right: 0,
        alignItems: 'center',
        ...animatedStyle
      }}>
        <View accessible={false} style={{
          width: 50,
          height: 8,
          borderRadius: 8,
          backgroundColor: '#fff',
          opacity: 0.7
        }} />
      </Animated.View>
    </PanGestureHandler>
  )
}
