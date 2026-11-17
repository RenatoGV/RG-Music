import { colors } from "@/constants/tokens"
import { FontAwesome6 } from "@expo/vector-icons"
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface SongsFolderModalProps {
   visible: boolean
   onClose: () => void
   onRefresh: () => void
   onSelectFolder: () => void
}

export const SongsFolderModal = ({visible, onClose, onRefresh, onSelectFolder}: Readonly<SongsFolderModalProps>) => {
   return (
      <Modal
         animationType="slide"
         transparent={true}
         visible={visible}
         onRequestClose={onClose}
      >
         <View style={styles.centeredView}>
            <View style={styles.modalView}>
               <TouchableOpacity onPress={onClose} style={styles.buttonClose}>
                  <FontAwesome6 name="circle-xmark" size={22} color={colors.primary} />
               </TouchableOpacity>
               <View style={{ gap: 15 }}>
                  <TouchableOpacity
                     style={[styles.modalButton, styles.buttonSave]}
                     onPress={onRefresh}
                  >
                     <Text style={styles.textStyle}>Actualizar lista de canciones</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                     style={[styles.modalButton, styles.buttonSave]}
                     onPress={onSelectFolder}
                  >
                     <Text style={styles.textStyle}>Seleccionar carpeta de canciones</Text>
                  </TouchableOpacity>
               </View>
            </View>
         </View>
      </Modal>
   )
}

const styles = StyleSheet.create({
   centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
   },
   modalView: {
      width: '70%',
      margin: 20,
      backgroundColor: '#1c1c1c',
      borderRadius: 20,
      padding: 35,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
         width: 0,
         height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
   },
   modalButton: {
      borderRadius: 10,
      padding: 10,
      elevation: 2,
      paddingHorizontal: 20,
   },
   buttonClose: {
      position: 'absolute',
      right: 12,
      top: 12,
   },
   buttonSave: {
      backgroundColor: colors.primary,
   },
   textStyle: {
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
   }
})