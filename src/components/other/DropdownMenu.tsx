import React, { useRef, useEffect, useState, ReactNode, useContext } from 'react'
import { View, Modal, StyleSheet, TouchableWithoutFeedback, TouchableOpacity } from 'react-native'
import { LiquidGlassSurface } from '@/components/glass/LiquidGlassSurface'
import { LiquidGlassBlurTargetRefContext } from '@/components/glass/LiquidGlassBlurTarget'

interface DropdownMenuProps {
  visible: boolean
  handleClose: () => void
  handleOpen: () => void
  trigger: React.ReactNode
  children: React.ReactNode
  dropdownWidth?: number
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  visible,
  handleOpen,
  handleClose,
  trigger,
  children,
  dropdownWidth = 150,
}) => {
  const triggerRef = useRef<React.ComponentRef<typeof View> | null>(null)
  const blurTarget = useContext(LiquidGlassBlurTargetRefContext)
  const [position, setPosition] = useState({x: 0, y: 0, width: 0})

  useEffect(() => {
    if (triggerRef.current && visible) {
      triggerRef.current.measure((fx, fy, width, height, px, py) => {
        setPosition({
          x: px,
          y: py,
          width: width,
        })
      })
    }
  }, [visible])

  return (
    <View>
      <TouchableWithoutFeedback onPress={handleOpen}>
        <View ref={triggerRef}>{trigger}</View>
      </TouchableWithoutFeedback>
      {visible && (
        <Modal
          transparent={true}
          visible={visible}
          animationType="fade"
          onRequestClose={handleClose}
          >
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={styles.modalOverlay}>
              <LiquidGlassSurface
                intensity={15}
                borderRadius={7}
                blurTarget={blurTarget ?? undefined}
                style={[
                  styles.menu,
                  {
                    top: position.y - 20,
                    left: position.x - (dropdownWidth + 5),
                    width: dropdownWidth,
                  },
                ]}>
                {children}
              </LiquidGlassSurface>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  )
}

export const MenuOption = ({
  onSelect,
  children,
  separatorBefore = false,
}: {
  onSelect: () => void
  children: ReactNode
  separatorBefore?: boolean
}) => {
    return (
        <TouchableOpacity onPress={onSelect} style={[styles.menuOption, separatorBefore && styles.menuOptionWithSeparator]}>
            {children}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      backgroundColor: 'transparent',
    },
    menu: {
      position: 'absolute',
      paddingVertical: 2,
      paddingHorizontal: 4,
      backgroundColor: 'rgba(14,18,21,0.08)',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.32,
      shadowRadius: 18,
      elevation: 14,
    },
    menuOption: {
      minHeight: 46,
      paddingHorizontal: 10,
      paddingVertical: 9,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    menuOptionWithSeparator: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: 'rgba(255,255,255,0.55)',
      marginTop: 5,
      paddingTop: 13,
    }
  });
