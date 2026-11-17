import { AnimatedSubtitle } from '@/components/lyrics/AnimatedSubtitle'
import { AnimatedTitle } from '@/components/lyrics/AnimatedTitle'
import { PlayerControlsLyrics } from '@/components/lyrics/PlayerControlsLyrics'
import { Lyrics } from '@/components/player/Lyrics'
import { PlayerProgressbar } from '@/components/player/PlayerProgressbar'
import type { Track } from '@/helpers/types'
import { TouchableOpacity, View } from 'react-native'

interface PlayerLyricsViewProps {
   track: Track
   onArtistPress: () => void
}

const PlayerLyricsView = ({ track, onArtistPress }: Readonly<PlayerLyricsViewProps>) => {
   return (
      <View style={{flex: 1, justifyContent: 'space-between', paddingBottom: 20}}>
         <View style={{marginBottom: 30}}>
            <AnimatedTitle text={track.title ?? ''} />
            <TouchableOpacity  onPress={onArtistPress}>
                  <AnimatedSubtitle text={track.artist ?? ''} />
            </TouchableOpacity>
         </View>

         <Lyrics
            trackUrl={track.url}
            artist={track.artist}
            track={track.title}
            lyricId={track.lyric_id}
         />

         <View style={{marginTop: 30}}>
            <PlayerProgressbar />
            <PlayerControlsLyrics />
         </View>
      </View>
   )
}

export default PlayerLyricsView