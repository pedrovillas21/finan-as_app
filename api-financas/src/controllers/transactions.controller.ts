import { Request, Response } from 'express';
import prisma from '../config/prisma';

export async function list(req: Request, res: Response) {
  const month = req.query.month ? Number(req.query.month) : undefined;
  const year  = req.query.year  ? Number(req.query.year)  : undefined;

  const dateFilter =
    month !== undefined && year !== undefined
      ? {
          gte: new Date(year, month - 1, 1),
          lt:  new Date(year, month, 1),
        }
      : undefined;

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: req.userId,
      ...(dateFilter ? { date: dateFilter } : {}),
    },
    include: { category: true },
    orderBy: { date: 'desc' },
  });

  res.json(transactions);
}

export async function create(req: Request, res: Response) {
  const { description, value, type, date, categoryId } = req.body;

  const transaction = await prisma.transaction.create({
    data: {
      description,
      value,
      type,
      date: new Date(date),
      userId: req.userId,
      categoryId,
    },
    include: { category: true },
  });

  res.status(201).json(transaction);
}

export async function update(req: Request, res: Response) {
  const id = req.params.id as string;
  const existing = await prisma.transaction.findUnique({ where: { id } });

  if (!existing) {
    res.status(404).json({ error: 'Transação não encontrada' });
    return;
  }
  if (existing.userId !== req.userId) {
    res.status(403).json({ error: 'Sem permissão' });
    return;
  }

  const { description, value, type, date, categoryId } = req.body;

  const updateData: {
    description?: string;
    value?: number;
    type?: string;
    date?: Date;
    categoryId?: string;
  } = {};
  if (description !== undefined) updateData.description = description;
  if (value       !== undefined) updateData.value       = value;
  if (type        !== undefined) updateData.type        = type;
  if (date        !== undefined) updateData.date        = new Date(date);
  if (categoryId  !== undefined) updateData.categoryId  = categoryId;

  const transaction = await prisma.transaction.update({
    where: { id },
    data:  updateData,
    include: { category: true },
  });

  res.json(transaction);
}

export async function remove(req: Request, res: Response) {
  const id = req.params.id as string;
  const existing = await prisma.transaction.findUnique({ where: { id } });

  if (!existing) {
    res.status(404).json({ error: 'Transação não encontrada' });
    return;
  }
  if (existing.userId !== req.userId) {
    res.status(403).json({ error: 'Sem permissão' });
    return;
  }

  await prisma.transaction.delete({ where: { id } });
  res.status(204).send();
}
