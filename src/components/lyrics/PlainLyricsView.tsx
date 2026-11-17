import { colors, fontSize } from "@/constants/tokens"
import { useFonts } from "expo-font"
import { ScrollView, StyleSheet, Text } from "react-native"

export const PlainLyricsView = ({ lyrics }: { lyrics: string }) => {
   const [fontsLoaded] = useFonts({
      SourceSansPro: require('@/assets/fonts/source-sans-pro-cyrillic-700-normal.ttf')
   })

   return (
      <ScrollView
         style={{ flex: 1 }}
         showsVerticalScrollIndicator={false}
      >
         <Text style={[styles.lyrics, {fontFamily: fontsLoaded ? 'SourceSansPro' : undefined}]}>
         {lyrics.replace(/\n+/g, (lineBreaks) => `${lineBreaks}\n`)}
         </Text>
      </ScrollView>
   )
}

const styles = StyleSheet.create({
   lyrics: {
      textAlign: 'center',
      fontSize: fontSize.lg,
      color: colors.text
   }
})
