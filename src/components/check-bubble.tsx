import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';

const INK = '#2E2A33';

/** Hand-drawn check circle: wobbly outline, filled with the habit color when checked */
export function CheckBubble({
  checked,
  color,
  size = 34,
}: {
  checked: boolean;
  color: string;
  size?: number;
}) {
  const theme = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36">
      <Path
        d="M18.5 3.5 C27 3 33 9.5 32.5 18 C32.5 26.5 26.5 32.5 18 32.5 C9.5 32.5 3.5 27 3.5 18.5 C3.5 9.5 10 3.5 18.5 3.5 Z"
        fill={checked ? color : 'none'}
        stroke={checked ? INK : theme.textSecondary}
        strokeOpacity={checked ? 1 : 0.5}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
      {checked && (
        <Path
          d="M11 18.5 C13 20 14.5 21.8 16 23.8 C18.5 19 21.5 15 25.5 12"
          fill="none"
          stroke={INK}
          strokeWidth={2.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </Svg>
  );
}
