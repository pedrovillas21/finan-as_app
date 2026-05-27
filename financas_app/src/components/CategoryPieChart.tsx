import { View, StyleSheet } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { ThemedText } from './themed-text';

export type PieSlice = {
  key: string;
  label: string;
  value: number;
  color: string;
};

type Props = {
  slices: PieSlice[];
  size?: number;
  centerLabel?: string;
  centerValue?: string;
};

function polar(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
  const s = polar(cx, cy, r, end);
  const e = polar(cx, cy, r, start);
  const large = end - start > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y} Z`;
}

export function CategoryPieChart({ slices, size = 160, centerLabel, centerValue }: Props) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;
  const innerR = r * 0.6;

  let cursor = 0;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {total > 0 ? (
          <G>
            {slices.map((slice) => {
              const angle = (slice.value / total) * 360;
              const start = cursor;
              const end = cursor + angle;
              cursor = end;

              if (slices.length === 1) {
                return <Circle key={slice.key} cx={cx} cy={cy} r={r} fill={slice.color} />;
              }
              return (
                <Path
                  key={slice.key}
                  d={arcPath(cx, cy, r, start, end)}
                  fill={slice.color}
                />
              );
            })}
            <Circle cx={cx} cy={cy} r={innerR} fill="#FFFFFF" />
          </G>
        ) : (
          <>
            <Circle cx={cx} cy={cy} r={r} fill="#E5E7EB" />
            <Circle cx={cx} cy={cy} r={innerR} fill="#FFFFFF" />
          </>
        )}
      </Svg>

      <View style={styles.center} pointerEvents="none">
        {centerLabel && (
          <ThemedText type="small" themeColor="textSecondary">
            {centerLabel}
          </ThemedText>
        )}
        {centerValue && (
          <ThemedText type="smallBold" style={styles.centerValue}>
            {centerValue}
          </ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerValue: {
    marginTop: 2,
  },
});
