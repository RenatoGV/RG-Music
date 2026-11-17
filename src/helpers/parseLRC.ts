interface LyricLine {
   time: number
   content: string
}

export const parseLRC = (lrcText: string): LyricLine[] => {
   lrcText = "[00:00.00] \n" + lrcText
   const lines = lrcText.split('\n')
   const lyricLines: LyricLine[] = []

   lines.forEach(line => {
      const timeMatch = /\[(\d{2}):(\d{2})\.(\d{2})\]/.exec(line)
      if (timeMatch) {
         const minutes = Number.parseInt(timeMatch[1])
         const seconds = Number.parseInt(timeMatch[2])
         const centiseconds = Number.parseInt(timeMatch[3])
         const time = minutes * 60 + seconds + centiseconds / 100
         const content = line.replace(/\[\d{2}:\d{2}\.\d{2}\]/g, '').trim()

         const text = content || '♪'
         const previousLine = lyricLines.at(-1)

         if(text === '♪' && previousLine?.content === '♪') return
         
         lyricLines.push({ time, content: text })
      }
   })

   return lyricLines.filter((line, index) => {
      if(line.content !== '♪') return true

      const nextLine = lyricLines[index + 1]

      // Si es la última línea, su duración depende del final del track
      if(!nextLine) return true

      const durationMs = Math.round((nextLine.time - line.time) * 1000)

      return durationMs >= 5000
   })
}