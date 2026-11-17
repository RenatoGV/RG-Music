import { Lyrics } from '@/components/player/Lyrics'
import type { Track } from '@/helpers/types'
import { View } from 'react-native'

interface PlayerLyricsViewProps {
   track: Track
}

const PlayerLyricsView = ({ track }: Readonly<PlayerLyricsViewProps>) => (
   <View style={{ flex: 1, paddingBottom: 20 }}>
      <Lyrics
         trackUrl={track.url}
         artist={track.artist}
         track={track.title}
         lyricId={track.lyric_id}
      />
   </View>
)

export default PlayerLyricsView
