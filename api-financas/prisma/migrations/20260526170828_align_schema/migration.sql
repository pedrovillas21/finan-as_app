/*
  Warnings:

  - You are about to drop the column `color` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `background` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `displayName` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isIncome` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "background" TEXT NOT NULL,
    "isIncome" BOOLEAN NOT NULL,
    "userId" TEXT,
    CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Category" ("id", "name", "userId") SELECT "id", "name", "userId" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("categoryId", "date", "description", "id", "type", "userId") SELECT "categoryId", "date", "description", "id", "type", "userId" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
