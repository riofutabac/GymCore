/*
  Warnings:

  - The values [SYS_ADMIN] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `memberOfGymId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `staffOfGymId` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[managerId]` on the table `gyms` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[legacyUserId]` on the table `memberships` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('CLIENT', 'RECEPTION', 'MANAGER', 'OWNER');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'CLIENT';
COMMIT;

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_memberOfGymId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_staffOfGymId_fkey";

-- DropIndex
DROP INDEX "gyms_ownerId_key";

-- DropIndex
DROP INDEX "memberships_userId_key";

-- AlterTable
ALTER TABLE "gyms" ADD COLUMN     "managerId" TEXT;

-- AlterTable
ALTER TABLE "memberships" ADD COLUMN     "legacyUserId" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "memberOfGymId",
DROP COLUMN "staffOfGymId",
ADD COLUMN     "workingAtGymId" TEXT;

-- CreateTable
CREATE TABLE "_GymMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GymMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GymMembers_B_index" ON "_GymMembers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "gyms_managerId_key" ON "gyms"("managerId");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_legacyUserId_key" ON "memberships"("legacyUserId");

-- AddForeignKey
ALTER TABLE "gyms" ADD CONSTRAINT "gyms_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_workingAtGymId_fkey" FOREIGN KEY ("workingAtGymId") REFERENCES "gyms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_legacyUserId_fkey" FOREIGN KEY ("legacyUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GymMembers" ADD CONSTRAINT "_GymMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "gyms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GymMembers" ADD CONSTRAINT "_GymMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
