import { z } from 'zod';

export const transactionSchema = z.object({
  description: z.string().min(1, 'Descrição obrigatória'),
  value:       z.number().positive('Valor deve ser positivo'),
  type:        z.enum(['income', 'expense']),
  date:        z.string().datetime({ message: 'Data inválida (use formato ISO)' }),
  categoryId:  z.string().min(1, 'Categoria obrigatória'),
});

export const transactionUpdateSchema = transactionSchema.partial();
