import { colors, fontSize } from "@/constants/tokens";
import React from "react";
import { StyleSheet } from "react-native";
import { AnimatedTickerText } from "./AnimatedTickerText";

type Props = {
  text: string;
};

export const AnimatedTitle = ({ text }: Props) => {
  return (
    <AnimatedTickerText text={text} style={styles.text} />
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: fontSize.xxl,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
  },
});
