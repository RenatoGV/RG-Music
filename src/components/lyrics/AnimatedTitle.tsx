import React from "react";
import { StyleSheet, View } from "react-native";
import TextTicker from "react-native-text-ticker";

type Props = {
  text: string;
};

export const AnimatedTitle = ({ text }: Props) => {
  return (
    <View style={styles.container}>
      <TextTicker
        style={styles.text}
        duration={10000}        // velocidad del scroll
        loop                   // que se repita siempre
        bounce={false}         // si quieres rebote ponlo true
        repeatSpacer={80}      // espacio entre repeticiones
        marqueeDelay={1000}    // espera antes de empezar
      >
        {text}
      </TextTicker>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    alignItems: "center",     // centra el ticker horizontalmente
    justifyContent: "center", // centra verticalmente si cambia de alto
  },
  text: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",      // centra el texto dentro del ticker
  },
});
