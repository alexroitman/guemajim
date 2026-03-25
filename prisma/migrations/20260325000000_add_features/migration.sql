-- AlterTable: Add dniImageUrl to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "dniImageUrl" TEXT;

-- AlterTable: Add responseMessage to Request
ALTER TABLE "Request" ADD COLUMN IF NOT EXISTS "responseMessage" TEXT;

-- CreateTable: GemachRequest
CREATE TABLE IF NOT EXISTS "GemachRequest" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "gemachId" TEXT NOT NULL,
    "message" TEXT,
    "responseMessage" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GemachRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GemachRequest" ADD CONSTRAINT "GemachRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GemachRequest" ADD CONSTRAINT "GemachRequest_gemachId_fkey" FOREIGN KEY ("gemachId") REFERENCES "Gemach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: Item - replace imageUrl with imageUrls array, add date range
ALTER TABLE "Item" ADD COLUMN IF NOT EXISTS "imageUrls" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "Item" ADD COLUMN IF NOT EXISTS "availableFrom" TIMESTAMP(3);
ALTER TABLE "Item" ADD COLUMN IF NOT EXISTS "availableTo" TIMESTAMP(3);
UPDATE "Item" SET "imageUrls" = ARRAY["imageUrl"] WHERE "imageUrl" IS NOT NULL;
ALTER TABLE "Item" DROP COLUMN IF EXISTS "imageUrl";
