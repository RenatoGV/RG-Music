const parseHexChannels = (hex: string) => {
   const value = hex.replace('#', '').trim()
   const normalized = value.length === 3
      ? value.split('').map((channel) => channel + channel).join('')
      : value

   if (!/^[\da-f]{6}$/i.test(normalized)) return null
   return [0, 2, 4].map((index) => Number.parseInt(normalized.slice(index, index + 2), 16))
}

const toHex = (channels: number[]) => `#${channels
   .map((channel) => Math.round(channel).toString(16).padStart(2, '0'))
   .join('')}`

export const lightenHexTone = (hex: string, amount = 0.25) => {
   const channels = parseHexChannels(hex)
   if (!channels) return hex

   const [red, green, blue] = channels.map((channel) => channel / 255)
   const maximum = Math.max(red, green, blue)
   const minimum = Math.min(red, green, blue)
   const delta = maximum - minimum
   const lightness = (maximum + minimum) / 2

   let hue = 0
   let saturation = 0

   if (delta !== 0) {
      saturation = delta / (1 - Math.abs(2 * lightness - 1))
      if (maximum === red) hue = ((green - blue) / delta + (green < blue ? 6 : 0)) / 6
      else if (maximum === green) hue = ((blue - red) / delta + 2) / 6
      else hue = ((red - green) / delta + 4) / 6
   }

   const normalizedAmount = Math.max(0, Math.min(1, amount))
   const lighter = Math.min(1, lightness + (1 - lightness) * normalizedAmount)
   const chroma = (1 - Math.abs(2 * lighter - 1)) * saturation
   const hueSection = hue * 6
   const secondary = chroma * (1 - Math.abs(hueSection % 2 - 1))
   const offset = lighter - chroma / 2
   const rgb = hueSection < 1 ? [chroma, secondary, 0]
      : hueSection < 2 ? [secondary, chroma, 0]
         : hueSection < 3 ? [0, chroma, secondary]
            : hueSection < 4 ? [0, secondary, chroma]
               : hueSection < 5 ? [secondary, 0, chroma]
                  : [chroma, 0, secondary]

   return toHex(rgb.map((channel) => (channel + offset) * 255))
}

export const darkenHex = (hex: string, amount = 0.25) => {
   const value = hex.replace('#', '')
   const factor = 1 - amount

   const channels = [0, 2, 4].map((index) => Math.round(Number.parseInt(value.slice(index, index + 2), 16) * factor)
      .toString(16)
      .padStart(2, '0')
   )

   return `#${channels.join('')}`
}
