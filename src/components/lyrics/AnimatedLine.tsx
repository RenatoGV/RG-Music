import { useEffect, useRef } from 'react'
import { Animated, Text } from 'react-native'

type LineProps = {
  content: string
  active: boolean
}

export const AnimatedLine = ({ content, active }: LineProps) => {
  const fontSize = useRef(new Animated.Value(20)).current

  useEffect(() => {
    Animated.timing(fontSize, {
      toValue: active ? 20 : 16,
      duration: 300,
      useNativeDriver: false
    }).start()
  }, [active])

  return (
    <Animated.Text
      style={{
        textAlign: 'center',
        color: active ? 'white' : 'gray',
        fontWeight: active ? "bold" : '200',
        fontSize
      }}
    >
      {content}
    </Animated.Text>
  )
}