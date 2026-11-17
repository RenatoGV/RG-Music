import { StyleProp, StyleSheet, TextStyle, View } from "react-native"
import TextTicker from "react-native-text-ticker"

interface Props {
   text: string
   style: StyleProp<TextStyle>
}

export const AnimatedTickerText = ({ text, style }: Props) => (
   <View style={styles.container}>
      <TextTicker
         style={style}
         duration={10000}
         loop
         bounce={false}
         repeatSpacer={80}
         marqueeDelay={1000}
      >
         {text}
      </TextTicker>
   </View>
)

const styles = StyleSheet.create({
   container: {
      width: '100%',
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
   }
})