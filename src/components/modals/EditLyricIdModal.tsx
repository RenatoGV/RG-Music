import { useEffect, useState } from "react"
import { FontAwesome6 } from "@expo/vector-icons"
import { BackHandler, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import Animated, { Easing, SlideInDown, SlideOutDown } from "react-native-reanimated"
import type { BlurViewProps } from "expo-blur"
import { colors, fontSize } from "@/constants/tokens"
import { LiquidGlassSurface } from "@/components/glass/LiquidGlassSurface"
import { PrimaryGlassButton } from "@/components/common/PrimaryGlassButton"
import { LiquidGlassButton } from "@/components/common/LiquidGlassButton"

interface EditLyricsIdModalProps {
   initialValue: string
   onClose: () => void
   onSave: (lyricId: string) => void
   blurTarget?: BlurViewProps["blurTarget"]
}

const EditLyricsIdModal = ({ initialValue, onClose, onSave, blurTarget }: Readonly<EditLyricsIdModalProps>) => {
   const [value, setValue] = useState(initialValue)

   useEffect(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
         onClose()
         return true
      })

      return () => subscription.remove()
   }, [onClose])

   const handleSave = () => onSave(value.trim())

   return (
      <View style={styles.overlay}>
         <Pressable accessibilityLabel="Cerrar" style={styles.backdrop} onPress={onClose} />
         <View pointerEvents="box-none" style={styles.centeredView}>
            <Animated.View
               entering={SlideInDown.duration(260).easing(Easing.out(Easing.cubic))}
               exiting={SlideOutDown.duration(180)}
               style={styles.modalFrame}
            >
               <LiquidGlassSurface intensity={15} borderRadius={20} blurTarget={blurTarget} style={styles.modalSurface}>
                  <TouchableOpacity
                     accessibilityRole="button"
                     accessibilityLabel="Cerrar"
                     hitSlop={10}
                     onPress={onClose}
                     style={styles.buttonClose}
                  >
                     <FontAwesome6 name="xmark" size={14} color={colors.text} />
                  </TouchableOpacity>

                  <View style={styles.heading}>
                     <Text style={styles.title}>Editar ID de la letra</Text>
                     <Text style={styles.description}>
                        Introduce el identificador para asociar esta canción con su letra.
                     </Text>
                  </View>

                  <TextInput
                     accessibilityLabel="ID de la letra"
                     style={styles.modalInput}
                     placeholder="Introduce el ID"
                     selectionColor={colors.primary}
                     placeholderTextColor={colors.textMuted}
                     autoCapitalize="none"
                     autoCorrect={false}
                     returnKeyType="done"
                     onSubmitEditing={handleSave}
                     onChangeText={setValue}
                     value={value}
                  />

                  <View style={styles.actions}>
                     <PrimaryGlassButton style={styles.modalButton} onPress={handleSave}>
                        <View style={styles.buttonContent}>
                           <FontAwesome6 name="check" size={16} color={colors.text} />
                           <Text style={styles.buttonText}>Guardar ID</Text>
                        </View>
                     </PrimaryGlassButton>

                     <LiquidGlassButton style={styles.modalButton} onPress={onClose}>
                        <View style={styles.buttonContent}>
                           <FontAwesome6 name="xmark" size={16} color={colors.text} />
                           <Text style={styles.buttonText}>Cancelar</Text>
                        </View>
                     </LiquidGlassButton>
                  </View>
               </LiquidGlassSurface>
            </Animated.View>
         </View>
      </View>
   )
}

const styles = StyleSheet.create({
   overlay: {
      ...StyleSheet.absoluteFill,
      zIndex: 1000,
      elevation: 1000,
   },
   centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
   },
   backdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0, 8, 10, 0.28)',
   },
   modalFrame: {
      width: '100%',
      maxWidth: 380,
   },
   modalSurface: {
      width: '100%',
      paddingTop: 28,
      paddingBottom: 22,
      paddingHorizontal: 22,
      shadowColor: '#000',
      shadowOffset: {
         width: 0,
         height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
   },
   heading: {
      gap: 7,
      marginBottom: 18,
      paddingRight: 28,
   },
   title: {
      color: colors.text,
      fontSize: fontSize.base,
      lineHeight: 25,
      fontWeight: '700',
   },
   description: {
      color: 'rgba(255,255,255,0.72)',
      fontSize: fontSize.xs,
      lineHeight: 20,
   },
   modalInput: {
      width: '100%',
      minHeight: 48,
      marginBottom: 18,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: 'rgba(255,255,255,0.22)',
      backgroundColor: 'rgba(0,0,0,0.18)',
      color: colors.text,
      fontSize: fontSize.sm,
   },
   actions: {
      gap: 11,
   },
   modalButton: {
      width: '100%',
      height: 52,
      borderRadius: 26,
      justifyContent: 'center',
      elevation: 2,
   },
   buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
   },
   buttonText: {
      color: colors.text,
      fontSize: fontSize.sm,
      fontWeight: '600',
      textAlign: 'center',
   },
   buttonClose: {
      position: 'absolute',
      right: 14,
      top: 14,
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.13)',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: 'rgba(255,255,255,0.32)',
   },
})

export default EditLyricsIdModal
