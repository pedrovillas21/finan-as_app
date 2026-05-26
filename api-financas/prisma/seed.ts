import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: 'food',      displayName: 'Alimentação', icon: 'restaurant',   background: '#FF6B6B', isIncome: false },
  { name: 'transport', displayName: 'Transporte',  icon: 'directions_car', background: '#4ECDC4', isIncome: false },
  { name: 'housing',   displayName: 'Moradia',     icon: 'home',          background: '#45B7D1', isIncome: false },
  { name: 'health',    displayName: 'Saúde',       icon: 'favorite',      background: '#96CEB4', isIncome: false },
  { name: 'leisure',   displayName: 'Lazer',       icon: 'sports_esports', background: '#FFEAA7', isIncome: false },
  { name: 'income',    displayName: 'Renda',       icon: 'attach_money',  background: '#A29BFE', isIncome: true  },
];

async function main() {
  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where:  { id: `global-${cat.name}` },
      update: { displayName: cat.displayName, icon: cat.icon, background: cat.background, isIncome: cat.isIncome },
      create: { id: `global-${cat.name}`, ...cat, userId: null },
    });
  }
  console.log('Seed concluído: 6 categorias padrão criadas.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
