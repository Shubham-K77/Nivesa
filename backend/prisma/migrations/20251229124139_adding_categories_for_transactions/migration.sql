/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `family_members` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionCategory" ADD VALUE 'FREELANCE';
ALTER TYPE "TransactionCategory" ADD VALUE 'TRAVEL';

-- CreateIndex
CREATE UNIQUE INDEX "family_members_userId_name_key" ON "family_members"("userId", "name");
