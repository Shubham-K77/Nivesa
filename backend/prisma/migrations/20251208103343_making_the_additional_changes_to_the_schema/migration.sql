/*
  Warnings:

  - You are about to drop the column `email` on the `family_members` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `family_members` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "LoginType" AS ENUM ('USER', 'FAMILY_MEMBER');

-- DropIndex
DROP INDEX "family_members_email_key";

-- DropIndex
DROP INDEX "users_email_key";

-- AlterTable
ALTER TABLE "family_members" DROP COLUMN "email",
DROP COLUMN "password";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "email",
DROP COLUMN "password";

-- CreateTable
CREATE TABLE "login_credentials" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "LoginType" NOT NULL,
    "userId" TEXT,
    "familyMemberId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "login_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "login_credentials_userId_key" ON "login_credentials"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "login_credentials_familyMemberId_key" ON "login_credentials"("familyMemberId");

-- CreateIndex
CREATE INDEX "login_credentials_email_idx" ON "login_credentials"("email");

-- CreateIndex
CREATE UNIQUE INDEX "login_credentials_email_role_key" ON "login_credentials"("email", "role");

-- AddForeignKey
ALTER TABLE "login_credentials" ADD CONSTRAINT "login_credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_credentials" ADD CONSTRAINT "login_credentials_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES "family_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
