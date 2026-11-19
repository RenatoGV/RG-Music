import { colors } from "@/constants/tokens"
import { FontAwesome6 } from "@expo/vector-icons"
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { LiquidGlassSurface } from "@/components/glass/LiquidGlassSurface"
import { LiquidGlassBlurTargetRefContext } from "@/components/glass/LiquidGlassBlurTarget"
import { useContext } from "react"
import { GradientButton } from "../common/GradientButton"
import { LiquidGlassButton } from "../common/LiquidGlassButton"

interface SongsFolderModalProps {
   visible: boolean
   onClose: () => void
   onRefresh: () => void
   onSelectFolder: () => void
}

export const SongsFolderModal = ({visible, onClose, onRefresh, onSelectFolder}: Readonly<SongsFolderModalProps>) => {
   const blurTarget = useContext(LiquidGlassBlurTargetRefContext)

   return (
      <Modal
         animationType="slide"
         transparent={true}
         visible={visible}
         onRequestClose={onClose}
      >
         <View style={styles.centeredView}>
            <View pointerEvents="none" style={styles.backdrop} />
            <LiquidGlassSurface intensity={15} borderRadius={20} blurTarget={blurTarget ?? undefined} style={styles.modalSurface}>
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
                  <Text style={styles.title}>Gestionar canciones</Text>
                  <Text style={styles.description}>
                     Actualiza tu biblioteca o elige otra carpeta de música.
                  </Text>
               </View>

               <View style={styles.actions}>
                  <GradientButton style={styles.modalButton} onPress={onRefresh}>
                     <View style={styles.buttonContent}>
                        <FontAwesome6 name="arrows-rotate" size={17} color={colors.text} />
                        <Text style={styles.buttonText}>Actualizar lista</Text>
                     </View>
                  </GradientButton>

                  <LiquidGlassButton style={styles.modalButton} onPress={onSelectFolder}>
                     <View style={styles.buttonContent}>
                        <FontAwesome6 name="folder" size={17} color={colors.text} />
                        <Text style={styles.buttonText}>Seleccionar carpeta</Text>
                     </View>
                  </LiquidGlassButton>
               </View>
            </LiquidGlassSurface>
         </View>
      </Modal>
   )
}

const styles = StyleSheet.create({
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
   modalSurface: {
      width: '100%',
      maxWidth: 380,
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
      elevation: 5
   },
   heading: {
      gap: 7,
      marginBottom: 20,
      paddingRight: 28,
   },
   title: {
      color: colors.text,
      fontSize: 20,
      lineHeight: 25,
      fontWeight: '700',
   },
   description: {
      color: 'rgba(255,255,255,0.72)',
      fontSize: 14,
      lineHeight: 20,
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
      fontSize: 15,
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
