import { unknownTrackImageUri } from "@/constants/images"
import { colors } from "@/constants/tokens"
import { useEffect, useState } from "react"
import { getColors } from 'react-native-image-colors'
import { AndroidImageColors } from "react-native-image-colors/build/types"
import FastImage from 'react-native-fast-image'

const playerArtworkColors = new Map<string, AndroidImageColors>()
const pendingColorRequests = new Map<string, Promise<AndroidImageColors | null>>()
const MAX_CACHED_ARTWORK_COLORS = 64

export const preloadPlayerArtwork = (imageUrl?: string) => {
	if (!imageUrl || imageUrl === unknownTrackImageUri) return Promise.resolve(null)

	try {
		void FastImage.preload([{ uri: imageUrl, priority: FastImage.priority.high }]).catch((error) => {
			console.warn('[PLAYER] No se pudo precargar el artwork', error)
		})
	} catch (error) {
		console.warn('[PLAYER] No se pudo precargar el artwork', error)
	}

	const cachedColors = playerArtworkColors.get(imageUrl)
	if (cachedColors) return Promise.resolve(cachedColors)

	const pendingRequest = pendingColorRequests.get(imageUrl)
	if (pendingRequest) return pendingRequest

	const request = Promise.resolve()
		.then(() => getColors(imageUrl, {
			fallback: colors.background,
			cache: true,
			key: imageUrl,
		}))
		.then((result) => {
			const imageColors = result as AndroidImageColors
			playerArtworkColors.set(imageUrl, imageColors)
			if (playerArtworkColors.size > MAX_CACHED_ARTWORK_COLORS) {
				const oldestImageUrl = playerArtworkColors.keys().next().value
				if (oldestImageUrl) playerArtworkColors.delete(oldestImageUrl)
			}
			return imageColors
		})
		.catch((error) => {
			console.warn('[PLAYER] No se pudieron extraer colores del artwork', error)
			return null
		})
		.finally(() => pendingColorRequests.delete(imageUrl))

	pendingColorRequests.set(imageUrl, request)
	return request
}

export const usePlayerBackground = (imageUrl: string) => {
	const [result, setResult] = useState(() => ({
		imageUrl,
		imageColors: playerArtworkColors.get(imageUrl) ?? null,
	}))

	useEffect(() => {
		let isCurrent = true

		if (!imageUrl || imageUrl === unknownTrackImageUri) {
			setResult({ imageUrl, imageColors: null })
			return () => { isCurrent = false }
		}

		const cachedColors = playerArtworkColors.get(imageUrl)
		if (cachedColors) setResult({ imageUrl, imageColors: cachedColors })

		void preloadPlayerArtwork(imageUrl).then((imageColors) => {
			if (isCurrent && imageColors) setResult({ imageUrl, imageColors })
		})

		return () => { isCurrent = false }
	}, [imageUrl])

	return {
		imageColors: result.imageUrl === imageUrl
			? result.imageColors
			: playerArtworkColors.get(imageUrl) ?? null,
	}
}
