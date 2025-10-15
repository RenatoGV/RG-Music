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
        duration={10000}
        loop
        bounce={false}
        repeatSpacer={80}
        marqueeDelay={1000}
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
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
});
