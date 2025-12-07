/*
  Warnings:

  - You are about to drop the column `userId` on the `budgets` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `budgets` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(10,2)`.
  - A unique constraint covering the columns `[accountId]` on the table `budgets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountId` to the `budgets` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `category` on the `transactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TransactionCategory" AS ENUM ('FOOD', 'TRANSPORT', 'HOUSING', 'UTILITIES', 'ENTERTAINMENT', 'HEALTHCARE', 'EDUCATION', 'SHOPPING', 'INVESTMENT', 'SALARY', 'BUSINESS', 'OTHER');

-- AlterEnum
ALTER TYPE "AccountType" ADD VALUE 'FAMILY';

-- DropForeignKey
ALTER TABLE "budgets" DROP CONSTRAINT "budgets_userId_fkey";

-- DropIndex
DROP INDEX "budgets_userId_idx";

-- AlterTable
ALTER TABLE "budgets" DROP COLUMN "userId",
ADD COLUMN     "accountId" TEXT NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "familyMemberId" TEXT,
DROP COLUMN "category",
ADD COLUMN     "category" "TransactionCategory" NOT NULL;

-- CreateTable
CREATE TABLE "family_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT,
    "accountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_budgets" (
    "id" TEXT NOT NULL,
    "familyMemberId" TEXT NOT NULL,
    "lastAlertSent" TIMESTAMP(3),
    "amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "family_members_id_key" ON "family_members"("id");

-- CreateIndex
CREATE UNIQUE INDEX "family_members_email_key" ON "family_members"("email");

-- CreateIndex
CREATE UNIQUE INDEX "family_members_phoneNumber_key" ON "family_members"("phoneNumber");

-- CreateIndex
CREATE INDEX "family_members_accountId_idx" ON "family_members"("accountId");

-- CreateIndex
CREATE INDEX "family_members_id_idx" ON "family_members"("id");

-- CreateIndex
CREATE INDEX "family_members_userId_idx" ON "family_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "family_members_accountId_name_key" ON "family_members"("accountId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "family_budgets_familyMemberId_key" ON "family_budgets"("familyMemberId");

-- CreateIndex
CREATE INDEX "family_budgets_familyMemberId_idx" ON "family_budgets"("familyMemberId");

-- CreateIndex
CREATE INDEX "family_budgets_id_idx" ON "family_budgets"("id");

-- CreateIndex
CREATE INDEX "accounts_id_idx" ON "accounts"("id");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_accountId_key" ON "budgets"("accountId");

-- CreateIndex
CREATE INDEX "budgets_accountId_idx" ON "budgets"("accountId");

-- CreateIndex
CREATE INDEX "budgets_id_idx" ON "budgets"("id");

-- CreateIndex
CREATE INDEX "transactions_familyMemberId_idx" ON "transactions"("familyMemberId");

-- CreateIndex
CREATE INDEX "transactions_id_idx" ON "transactions"("id");

-- CreateIndex
CREATE INDEX "users_id_idx" ON "users"("id");

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_budgets" ADD CONSTRAINT "family_budgets_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES "family_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES "family_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
