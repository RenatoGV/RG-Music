export const lightenHex = (hex: string, amount = 0.25) => {
   const value = hex.replace("#", "")
   const channels = [0, 2, 4].map((i) => Number.parseInt(value.slice(i, i + 2), 16))

   return (
      "#" +
      channels
         .map((channel) =>
         Math.round(channel + (255 - channel) * amount)
            .toString(16)
            .padStart(2, "0")
         )
         .join("")
   )
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