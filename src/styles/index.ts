import { colors, fontSize } from "@/constants/tokens"
import { StyleSheet } from "react-native"

export const defaultStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background
    },
    text: {
        fontSize: fontSize.base,
        color: colors.text
    }
})

export const utilsStyles = StyleSheet.create({
    centeredRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    slider: {
        height: 7,
        borderRadius: 16
    },
    emptyContentText: {
        ...defaultStyles.text,
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.primary,
        textAlign: 'center',
        marginBottom: 20
    },
    emptyContentImage: {
        width: 200,
        height: 200,
        alignSelf: 'center',
        marginTop: 40,
        opacity: 0.8,
        borderRadius: 10,
        marginBottom: 20
    }
})