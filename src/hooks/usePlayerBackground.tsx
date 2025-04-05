import { unknownTrackImageUri } from "@/constants/images"
import { colors } from "@/constants/tokens"
import { useEffect, useState } from "react"
import { getColors } from 'react-native-image-colors'
import { AndroidImageColors } from "react-native-image-colors/build/types"

export const usePlayerBackground = (imageUrl: string) => {
	const [imageColors, setImageColors] = useState<AndroidImageColors | null>(null)

	useEffect(() => {
        if(imageUrl === unknownTrackImageUri) return

        if(!imageUrl) return

		getColors(imageUrl, {
			fallback: colors.background,
			cache: true,
			key: imageUrl,
		}).then((colors) => setImageColors(colors as AndroidImageColors))
	}, [imageUrl])

	return { imageColors }
}

// export const usePlayerBackground = (imageUrl : string) => {
//     const [imageColors, setImageColors] = useState<AndroidImageColors | null>(null)

//     useEffect(() => {
//         if(imageUrl === unknownTrackImageUri) return

//         if(!imageUrl) return

//         let isMounted = true

//         const fetchColors = async () => {
//             try {
//                 const result = await getColors(imageUrl, {
//                     fallback: colors.background,
//                     cache: true,
//                     key: imageUrl
//                 })

//                 if(isMounted) setImageColors(result as AndroidImageColors)
//             } catch (error) {
//                 console.error("Error al extraer los colores de la imagen:", error);
//                 if (isMounted) {
//                 setImageColors(null)
//                 }
//             }
//         }

//         fetchColors()

//         return () => {
//             isMounted = false
//         }
//     }, [imageUrl])
    
//     return {
//         imageColors
//     }
// }