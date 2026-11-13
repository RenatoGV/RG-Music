import { useEffect, useRef } from "react"
import TrackPlayer, { Capability, RepeatMode } from "@/helpers/track-player-compat"

const setupPlayer = async() => {
    await TrackPlayer.setupPlayer({
        maxCacheSize: 1024 * 10
    })

    await TrackPlayer.updateOptions({
        capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious
        ]
    })

    await TrackPlayer.setVolume(1)
    await TrackPlayer.setRepeatMode(RepeatMode.Queue)
}

export const useSetupTrackPlayer = ({
	onLoad,
}: {
	onLoad?: (playerReady: boolean) => void | Promise<void>
}) => {
	const setupPromise = useRef<Promise<boolean> | null>(null)
	const onLoadRef = useRef(onLoad)
	const onLoadCalled = useRef(false)
	onLoadRef.current = onLoad

	useEffect(() => {
		let isActive = true

		if (!setupPromise.current) {
			setupPromise.current = setupPlayer()
				.then(() => true)
				.catch((error) => {
					console.error('Error setting up Track Player', error)
					return false
				})
		}

		void setupPromise.current.then(async (playerReady) => {
			if (!isActive || onLoadCalled.current) return

			onLoadCalled.current = true
			try {
				await onLoadRef.current?.(playerReady)
			} catch (error) {
				console.error('Error during app startup', error)
			}
		})

		return () => {
			isActive = false
		}
	}, [])
}
