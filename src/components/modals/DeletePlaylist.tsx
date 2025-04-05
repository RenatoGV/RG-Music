import { colors, fontSize } from '@/constants/tokens'
import { showToast } from '@/helpers/toast'
import { Playlist } from '@/helpers/types'
import { usePlaylistStore } from '@/store/playlist'
import React, { useState } from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

type Props = {
   selectedPlaylist: Playlist | null
   setSelectedPlaylist: React.Dispatch<React.SetStateAction<Playlist | null>>
}

export const DeletePlaylist = ({selectedPlaylist, setSelectedPlaylist} : Props) => {
	const { removePlaylist } = usePlaylistStore()

   const handleSave = () => {
      if(selectedPlaylist !== null) {
         removePlaylist(selectedPlaylist)
         showToast(`Playlist ${selectedPlaylist.name} eliminado`)
      }
      setSelectedPlaylist(null)
   }

   const handleCancel = () => {
      setSelectedPlaylist(null)
   }

  return (
      <Modal
         animationType="fade"
         transparent={true}
         visible={(selectedPlaylist !== null)}
         onRequestClose={() => {
            setSelectedPlaylist(null)
         }}
      >
         <View style={styles.centeredView}>
            <View style={styles.modalView}>
               <Text style={styles.modalTitle}>Eliminar Playlist</Text>
               <Text style={styles.modalSubtitle}>¿Seguro que desea eliminar la Playlist {selectedPlaylist?.name}?</Text>
               <View style={styles.modalButtons}>
                  <TouchableOpacity
                     style={[styles.button]}
                     onPress={handleCancel}
                  >
                     <Text style={styles.cancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                     style={[styles.button, styles.buttonSave]}
                     onPress={handleSave}
                  >
                     <Text style={styles.confirmText}>Eliminar</Text>
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
      shadowColor: '#000',
      shadowOffset: {
         width: 0,
         height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
   },
   modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between'
   },
   button: {
      borderRadius: 20,
      padding: 10,
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
   cancelText: {
      color: colors.primary,
      fontWeight: 'bold',
      textAlign: 'center',
   },
   confirmText: {
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
   },
   modalTitle: {
      marginBottom: 10,
      color: colors.primary,
      fontWeight: '500',
      fontSize: fontSize.sm,
   },
   modalSubtitle: {
      color: '#FFF',
      marginBottom: 15,
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