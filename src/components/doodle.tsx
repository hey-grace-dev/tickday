import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

// Hand-drawn style characters. Shapes are deliberately a little lopsided, and the
// outline is traced twice (main stroke + faint offset stroke) for a pencil feel.

export const CHARACTERS = ['mochi', 'cat', 'bunny', 'bear', 'chick', 'ghost', 'sprout', 'drop'] as const;
export type Character = (typeof CHARACTERS)[number];
export type Mood = 'idle' | 'happy' | 'sleepy';

export const CHARACTER_NAMES: Record<Character, string> = {
  mochi: '말랑이',
  cat: '고양이',
  bunny: '토끼',
  bear: '곰돌이',
  chick: '병아리',
  ghost: '유령',
  sprout: '새싹이',
  drop: '물방울',
};

const INK = '#2E2A33';
const BLUSH = '#FF8FA3';
const MOUTH = '#F0645A';

type Shape = {
  /** Parts drawn behind the body (ears etc.), filled with the character color */
  back?: string[];
  body: string;
  /** Extra ink lines drawn on top (tufts, stems) */
  lines?: string[];
  /** Extra filled shapes on top (leaves), filled with `accentFill` */
  front?: string[];
  faceY: number;
};

const SHAPES: Record<Character, Shape> = {
  mochi: {
    body: 'M13.5 41 C12 27 20.5 16 32.5 15.5 C45 15 53 25 51.5 40 C50.5 50.5 43 53.5 32 53.5 C20.5 53.5 14.5 50.5 13.5 41 Z',
    faceY: 36,
  },
  cat: {
    back: ['M16 30 L15 11.5 L28.5 20 Z', 'M36 19.5 L48.5 11 L48.5 30 Z'],
    body: 'M13 40 C12.5 27 21 18.5 32.5 18.5 C44 18 52 27 51.5 40 C51 50.5 43.5 54 32 54 C20.5 54 13.5 50 13 40 Z',
    lines: ['M8 39 L16.5 40', 'M8.5 44.5 L16.5 43', 'M56 38.5 L47.5 40', 'M55.5 44 L47.5 43'],
    faceY: 37,
  },
  bunny: {
    back: [
      'M21.5 24 C18 14 18.5 4.5 23.5 4.5 C28.5 4.5 29 14 27.5 23 Z',
      'M36.5 23 C35.5 13.5 37 5 41.5 5.5 C46 6 45.5 15 42 24.5 Z',
    ],
    body: 'M14 41 C13 29 21 20.5 32 20.5 C43.5 20.5 51 29 50.5 41 C50 50.5 43 54 32 54 C21 54 14.5 50.5 14 41 Z',
    lines: ['M24 9.5 C23.5 13 24 17 24.5 20', 'M41 10 C41 13.5 40.5 17 40 20.5'],
    faceY: 38,
  },
  bear: {
    back: [
      'M11.5 21.5 C11 16 14.5 12 19.5 12.5 C24 13 27 16.5 26.5 21.5 C26 25.5 22.5 27.5 18.5 27 C14.5 26.5 12 25 11.5 21.5 Z',
      'M37.5 21 C37.5 16 41 12.5 45.5 12.5 C50.5 12.5 53 16.5 52.5 21.5 C52 25.5 49 27.5 45 27 C41 26.5 37.5 25 37.5 21 Z',
    ],
    body: 'M12.5 39 C12 26.5 20.5 17 32 17 C44 17 52.5 26.5 51.5 39.5 C51 50.5 43 54 32 54 C20.5 54 13 50 12.5 39 Z',
    front: ['M25.5 42.5 C25.5 38.5 28.5 37 32 37 C36 37 38.5 39 38.5 42.5 C38.5 46.5 35.5 48 32 48 C28 48 25.5 46 25.5 42.5 Z'],
    faceY: 35,
  },
  chick: {
    body: 'M14 41.5 C13 28.5 21 18 32.5 18 C44.5 18 51.5 28 50.5 41.5 C49.5 51 42.5 54 32 54 C21 54 15 51 14 41.5 Z',
    lines: ['M31 18 C29.5 13.5 30.5 10.5 32.5 11 C33 13.5 33 15.5 33 18', 'M33 17.5 C34.5 13.5 37 12.5 38 14'],
    faceY: 37,
  },
  ghost: {
    body: 'M15.5 50.5 L15.5 31 C15.5 20.5 23 13.5 32 13.5 C41.5 13.5 48.5 20.5 48.5 31 L48.5 50.5 C45.5 47.5 43 47.5 40.5 50.5 C37.5 53.5 35 53.5 32.5 50.5 C29.5 47.5 27 47.5 24 50.5 C21 53.5 18.5 53.5 15.5 50.5 Z',
    faceY: 32,
  },
  sprout: {
    body: 'M13.5 42 C12.5 30 20.5 21 32 21 C44 21 51.5 30 50.5 42 C49.5 51 42.5 54 32 54 C21.5 54 14.5 51 13.5 42 Z',
    lines: ['M32 21 C31.5 17 32 14 32.5 11.5'],
    front: [
      'M32.5 13 C29 7 22.5 6.5 20.5 8.5 C22.5 13 28 15 32.5 13 Z',
      'M32.5 12.5 C35.5 6.5 42 5.5 44 7.5 C42.5 12 37 14.5 32.5 12.5 Z',
    ],
    faceY: 38,
  },
  drop: {
    body: 'M32.5 9.5 C38 19.5 48.5 27.5 48 39.5 C47.5 48.5 41 54 32 54 C23 54 16 48.5 16 39.5 C16 28 26.5 20 32.5 9.5 Z',
    faceY: 38,
  },
};

type DoodleProps = {
  character: Character;
  color: string;
  mood?: Mood;
  size?: number;
  /** Little arms waving, for the mascot */
  arms?: boolean;
  /** Growth level (1-4); higher levels add sparkles, a flower, then a crown */
  level?: number;
};

export function Doodle({ character, color, mood = 'idle', size = 48, arms, level = 1 }: DoodleProps) {
  const shape = SHAPES[character];
  const y = shape.faceY;
  const stroke = { stroke: INK, strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  const sketch = { ...stroke, strokeWidth: 1, opacity: 0.35, fill: 'none' } as const;

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {arms && (
        <G {...stroke} fill="none">
          <Path d="M14.5 37 C9.5 33 8 28.5 9.5 25" />
          <Path d="M49.5 37 C54.5 33 56 28.5 54.5 25" />
        </G>
      )}
      {shape.back?.map((d) => (
        <Path key={d} d={d} fill={color} {...stroke} />
      ))}
      <Path d={shape.body} fill={color} {...stroke} />
      <Path d={shape.body} {...sketch} transform="translate(0.8 -0.6)" />
      {/* highlight */}
      <Path
        d={`M${20} ${y - 12} C${21.5} ${y - 15} ${24} ${y - 16.5} ${26.5} ${y - 17}`}
        stroke="#ffffff"
        strokeOpacity={0.8}
        strokeWidth={2.2}
        strokeLinecap="round"
        fill="none"
      />
      {shape.front?.map((d) => (
        <Path key={d} d={d} fill={character === 'bear' ? '#ffffffaa' : '#7BC67E'} {...stroke} />
      ))}
      {shape.lines?.map((d) => (
        <Path key={d} d={d} fill="none" {...stroke} />
      ))}
      <Face y={y} mood={mood} />
      {level >= 2 && <Sparkles />}
      {level === 3 && <Flower />}
      {level >= 4 && <Crown />}
    </Svg>
  );
}

function Face({ y, mood }: { y: number; mood: Mood }) {
  const line = { stroke: INK, strokeWidth: 2.2, strokeLinecap: 'round', fill: 'none' } as const;
  return (
    <G>
      <Ellipse cx={21.5} cy={y + 4.5} rx={3.2} ry={1.9} fill={BLUSH} opacity={0.7} />
      <Ellipse cx={42.5} cy={y + 4.5} rx={3.2} ry={1.9} fill={BLUSH} opacity={0.7} />
      {mood === 'idle' && (
        <>
          <Circle cx={26} cy={y} r={2.3} fill={INK} />
          <Circle cx={38.5} cy={y - 0.3} r={2.3} fill={INK} />
          <Circle cx={26.7} cy={y - 0.8} r={0.7} fill="#ffffff" />
          <Circle cx={39.2} cy={y - 1.1} r={0.7} fill="#ffffff" />
          <Path d={`M29.5 ${y + 4.5} Q32 ${y + 7} 34.8 ${y + 4.3}`} {...line} />
        </>
      )}
      {mood === 'happy' && (
        <>
          <Path d={`M23.3 ${y + 1} Q26 ${y - 2.8} 28.7 ${y + 0.8}`} {...line} />
          <Path d={`M35.8 ${y + 0.8} Q38.5 ${y - 3} 41.2 ${y + 0.6}`} {...line} />
          <Path
            d={`M28.3 ${y + 4} Q32 ${y + 4.6} 35.9 ${y + 3.8} Q35 ${y + 9.5} 32 ${y + 9.4} Q29 ${y + 9.4} 28.3 ${y + 4} Z`}
            fill={MOUTH}
            stroke={INK}
            strokeWidth={2}
            strokeLinejoin="round"
          />
        </>
      )}
      {mood === 'sleepy' && (
        <>
          <Path d={`M23.5 ${y} Q26 ${y + 1.6} 28.5 ${y}`} {...line} />
          <Path d={`M36 ${y - 0.2} Q38.5 ${y + 1.4} 41 ${y - 0.2}`} {...line} />
          <Circle cx={32} cy={y + 6} r={1.6} fill={INK} />
        </>
      )}
    </G>
  );
}

const YELLOW = '#FFD25E';
const PINK = '#FF9CC6';

/** Four-point twinkle */
function star(cx: number, cy: number, r: number) {
  return `M${cx} ${cy - r} Q${cx} ${cy} ${cx + r} ${cy} Q${cx} ${cy} ${cx} ${cy + r} Q${cx} ${cy} ${cx - r} ${cy} Q${cx} ${cy} ${cx} ${cy - r} Z`;
}

function Sparkles() {
  const props = { fill: YELLOW, stroke: INK, strokeWidth: 1.4, strokeLinejoin: 'round' } as const;
  return (
    <G>
      <Path d={star(56, 22, 5)} {...props} />
      <Path d={star(7.5, 30, 3.8)} {...props} />
    </G>
  );
}

function Flower() {
  const cx = 14;
  const cy = 13;
  const petals = [0, 72, 144, 216, 288].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + Math.cos(rad) * 4, y: cy + Math.sin(rad) * 4 };
  });
  return (
    <G stroke={INK} strokeWidth={1.4}>
      {petals.map((p) => (
        <Circle key={`${p.x}-${p.y}`} cx={p.x} cy={p.y} r={3.4} fill={PINK} />
      ))}
      <Circle cx={cx} cy={cy} r={2.6} fill={YELLOW} />
    </G>
  );
}

function Crown() {
  return (
    <Path
      d="M39.5 13.5 L40.5 4.5 L45.5 9 L49.5 2.5 L52 9.5 L57 6 L55 15 C50 13 44.5 12.5 39.5 13.5 Z"
      fill={YELLOW}
      stroke={INK}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
  );
}
