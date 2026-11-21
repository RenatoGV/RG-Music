import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg'
import { StyleSheet } from 'react-native'

type SegmentedGlassBorderProps = {
  width: number
  height: number
  borderRadius: number
  tintColor?: string
}

export const SegmentedGlassBorder = ({ width, height, borderRadius, tintColor = '#FFFFFF' }: SegmentedGlassBorderProps) => {
  if (width <= 0 || height <= 0) return null

  const inset = 0.5
  const radius = Math.max(0, Math.min(borderRadius, width / 2, height / 2) - inset)
  if (radius <= 0) return null

  const topStart = { x: inset + radius, y: inset }
  const topEnd = { x: inset, y: inset + radius }
  const bottomStart = { x: width - inset, y: height - inset - radius }
  const bottomEnd = { x: width - inset - radius, y: height - inset }

  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <LinearGradient id="glassBorderTopLeft" x1={topStart.x} y1={topStart.y} x2={topEnd.x} y2={topEnd.y} gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor={tintColor} stopOpacity={0} />
          <Stop offset="50%" stopColor={tintColor} stopOpacity={0.82} />
          <Stop offset="100%" stopColor={tintColor} stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id="glassBorderBottomRight" x1={bottomStart.x} y1={bottomStart.y} x2={bottomEnd.x} y2={bottomEnd.y} gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor={tintColor} stopOpacity={0} />
          <Stop offset="50%" stopColor={tintColor} stopOpacity={0.82} />
          <Stop offset="100%" stopColor={tintColor} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path
        d={`M ${topStart.x} ${topStart.y} A ${radius} ${radius} 0 0 0 ${topEnd.x} ${topEnd.y}`}
        fill="none"
        stroke="url(#glassBorderTopLeft)"
        strokeWidth={1}
      />
      <Path
        d={`M ${bottomStart.x} ${bottomStart.y} A ${radius} ${radius} 0 0 1 ${bottomEnd.x} ${bottomEnd.y}`}
        fill="none"
        stroke="url(#glassBorderBottomRight)"
        strokeWidth={1}
      />
    </Svg>
  )
}
