-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_gymId_fkey";

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "status" "ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "gymId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "gyms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
