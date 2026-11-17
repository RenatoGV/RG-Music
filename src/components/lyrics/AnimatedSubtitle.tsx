import { colors, fontSize } from "@/constants/tokens";
import React from "react";
import { StyleSheet } from "react-native";
import { AnimatedTickerText } from "./AnimatedTickerText";

type Props = {
  text: string;
};

export const AnimatedSubtitle = ({ text }: Props) => {
  return (
    <AnimatedTickerText text={text} style={styles.text} />
  );
};

const styles = StyleSheet.create({
  text: {
    color: colors.textMuted,
    fontWeight: 'semibold',
    textAlign: 'center',
    fontSize: fontSize.lg
  },
});
