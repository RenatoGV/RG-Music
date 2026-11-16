import { colors, fontSize } from "@/constants/tokens"
import { FontAwesome6 } from "@expo/vector-icons"
import { useState } from "react"
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"

interface EditLyricsIdModalProps {
   initialValue: string
   onClose: () => void
   onSave: (lyricId: string) => void
}

const EditLyricsIdModal = ({ initialValue, onClose, onSave }: Readonly<EditLyricsIdModalProps>) => {
   const [value, setValue] = useState(initialValue)

   return (
      <Modal
         animationType="fade"
         transparent={true}
         onRequestClose={onClose}
      >
         <View style={styles.centeredView}>
            <View style={styles.modalView}>
               <TouchableOpacity onPress={onClose} style={styles.buttonClose}>
                     <FontAwesome6 name="circle-xmark" size={22} color={colors.primary} />
               </TouchableOpacity>
               <Text style={styles.modalText}>Establecer Lyric ID</Text>
               <TextInput
                     style={styles.modalInput}
                     placeholder="Ingrese el ID"
                     selectionColor={colors.primary}
                     placeholderTextColor={colors.textMuted}
                     onChangeText={setValue}
                     value={value}
               />
               <TouchableOpacity
                     style={[styles.button, styles.buttonSave, { opacity: 1 }]}
                     onPress={() => onSave(value.trim())}
               >
                     <Text style={styles.textStyle}>Guardar</Text>
               </TouchableOpacity>
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
      width: '90%',
      backgroundColor: '#1c1c1c',
      borderRadius: 20,
      paddingVertical: 20,
      paddingHorizontal: 20,
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
   button: {
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
   buttonSave: {
      backgroundColor: colors.primary,
   },
   textStyle: {
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
   },
   modalText: {
      marginBottom: 15,
      textAlign: 'center',
      color: colors.primary,
      fontWeight: '500',
      fontSize: fontSize.sm,
   },
   modalInput: {
      width: '80%',
      marginBottom: 15,
      backgroundColor: colors.secondary,
      fontSize: fontSize.sm,
      borderRadius: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      color: colors.text,
   },
})

export default EditLyricsIdModal