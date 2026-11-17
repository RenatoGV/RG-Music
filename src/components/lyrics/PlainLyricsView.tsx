import { colors, fontSize } from "@/constants/tokens"
import { ScrollView, StyleSheet, Text } from "react-native"

export const PlainLyricsView = ({ lyrics }: { lyrics: string }) => {
   return (
      <ScrollView
         style={{ flex: 1 }}
         showsVerticalScrollIndicator={false}
      >
         <Text style={styles.lyrics}>
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
