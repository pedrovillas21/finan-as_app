import { Request, Response } from 'express';
import prisma from '../config/prisma';

export async function list(req: Request, res: Response) {
  const categories = await prisma.category.findMany({
    where: {
      OR: [{ userId: null }, { userId: req.userId }],
    },
    orderBy: { name: 'asc' },
  });
  res.json(categories);
}

export async function create(req: Request, res: Response) {
  const { name, displayName, icon, background, isIncome } = req.body;

  const category = await prisma.category.create({
    data: {
      name,
      displayName,
      icon,
      background,
      isIncome,
      userId: req.userId,
    },
  });

  res.status(201).json(category);
}
