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
            <LiquidGlassSurface intensity={15} borderRadius={20} blurTarget={blurTarget ?? undefined} style={styles.modalSurface}>
               <TouchableOpacity onPress={onClose} style={styles.buttonClose}>
                  <FontAwesome6 name="xmark" size={20} color={colors.text} />
               </TouchableOpacity>
               <View style={{ gap: 15 }}>
                  <GradientButton style={styles.modalButton} onPress={onRefresh}>
                     <Text style={styles.textStyle}>Actualizar lista de canciones</Text>
                  </GradientButton>

                  <LiquidGlassButton style={styles.modalButton} onPress={onSelectFolder}>
                     <Text style={styles.textStyle}>Seleccionar carpeta de canciones</Text>
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
      alignItems: 'center'
   },
   modalSurface: {
      width: '85%',
      margin: 20,
      paddingTop: 35,
      paddingBottom: 20,
      paddingHorizontal: 35,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
         width: 0,
         height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5
   },
   modalButton: {
      borderRadius: 20,
      padding: 10,
      elevation: 2,
      paddingHorizontal: 20,
   },
   buttonClose: {
      position: 'absolute',
      right: 12,
      top: 12,
   },
   textStyle: {
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
   }
})
