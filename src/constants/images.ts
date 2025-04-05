import unknownArtistImage from "@/assets/unknown_artist.jpg"
import unknownTrackImage from "@/assets/unknown_track.png"
import unknownPlaylistImage from "@/assets/unknown_playlist.png"
import { Image } from "react-native"

export const unknownArtistImageUri = Image.resolveAssetSource(unknownArtistImage).uri
export const unknownTrackImageUri = Image.resolveAssetSource(unknownTrackImage).uri
export const unknownPlaylistImageUri = Image.resolveAssetSource(unknownPlaylistImage).uri