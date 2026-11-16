import { colors, fontSize } from "@/constants/tokens"
import { FontAwesome6 } from "@expo/vector-icons"
import { useState } from "react"
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"

interface CreatePlaylistModalProps {
   visible: boolean
   onClose: () => void
   onCreate: (name: string) => boolean
}

const CreatePlaylistModal = ({ visible, onClose, onCreate }: Readonly<CreatePlaylistModalProps>) => {
   const [playlistName, setPlaylistName] = useState('')
   const trimmedName = playlistName.trim()
   const isDisabled = trimmedName.length === 0

   const handleClose = () => {
      setPlaylistName('')
      onClose()
   }

   const handleSave = () => {
      if (isDisabled) return

      if (onCreate(trimmedName)) handleClose()
   }

   return (
      <Modal
         animationType="slide"
         transparent={true}
         visible={visible}
         onRequestClose={handleClose}
      >
         <View style={styles.centeredView}>
            <View style={styles.modalView}>
               <TouchableOpacity onPress={handleClose} style={styles.buttonClose}>
                  <FontAwesome6 name="circle-xmark" size={22} color={colors.primary} />
               </TouchableOpacity>
               <Text style={styles.modalText}>Crear Playlist</Text>
               <TextInput
                  value={playlistName}
                  style={styles.modalInput}
                  placeholder="Ingrese el nombre de la Playlist"
                  selectionColor={colors.primary}
                  placeholderTextColor={colors.textMuted}
                  onChangeText={setPlaylistName}
               />
               <TouchableOpacity
                  disabled={isDisabled}
                  style={[styles.button, styles.buttonSave, { opacity: isDisabled ? 0.5 : 1 }]}
                  onPress={handleSave}
               >
                  <Text style={styles.textStyle}>Agregar</Text>
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

export default CreatePlaylistModal