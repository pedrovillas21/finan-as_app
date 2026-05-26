export const DEFAULT_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Lazer',
] as const;

export type DefaultCategory = (typeof DEFAULT_CATEGORIES)[number];

export const CATEGORY_COLORS: Record<string, string> = {
  Alimentação: '#FF6B6B',
  Transporte: '#4ECDC4',
  Moradia: '#45B7D1',
  Saúde: '#96CEB4',
  Lazer: '#FFEAA7',
  Renda: '#A29BFE',
};

const DEFAULT_COLOR = '#DDA0DD';

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? DEFAULT_COLOR;
}
