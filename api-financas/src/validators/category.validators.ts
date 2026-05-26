import { z } from 'zod';

export const categorySchema = z.object({
  name:        z.string().min(1, 'Nome obrigatório'),
  displayName: z.string().min(1, 'Nome de exibição obrigatório'),
  icon:        z.string().min(1, 'Ícone obrigatório'),
  background:  z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida (use formato #RRGGBB)'),
  isIncome:    z.boolean(),
});
