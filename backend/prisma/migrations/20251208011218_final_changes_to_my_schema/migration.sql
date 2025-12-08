/*
  Warnings:

  - A unique constraint covering the columns `[invitationToken]` on the table `family_members` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "family_members" ADD COLUMN     "invitationExpiry" TIMESTAMP(3),
ADD COLUMN     "invitationToken" TEXT,
ADD COLUMN     "password" TEXT,
ALTER COLUMN "isActive" SET DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "family_members_invitationToken_key" ON "family_members"("invitationToken");
