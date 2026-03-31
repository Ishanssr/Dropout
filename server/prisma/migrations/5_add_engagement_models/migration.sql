-- Migration: Add engagement models, drop notifications, and missing columns
-- This brings the DB in sync with the current Prisma schema

-- CreateTable: Like (replaces the old likes integer column on Drop)
CREATE TABLE IF NOT EXISTS "Like" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dropId" TEXT NOT NULL,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Like_userId_dropId_key" ON "Like"("userId", "dropId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'Like_userId_fkey'
    ) THEN
        ALTER TABLE "Like"
        ADD CONSTRAINT "Like_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'Like_dropId_fkey'
    ) THEN
        ALTER TABLE "Like"
        ADD CONSTRAINT "Like_dropId_fkey"
        FOREIGN KEY ("dropId") REFERENCES "Drop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable: Follow
CREATE TABLE IF NOT EXISTS "Follow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Follow_userId_brandId_key" ON "Follow"("userId", "brandId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'Follow_userId_fkey'
    ) THEN
        ALTER TABLE "Follow"
        ADD CONSTRAINT "Follow_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'Follow_brandId_fkey'
    ) THEN
        ALTER TABLE "Follow"
        ADD CONSTRAINT "Follow_brandId_fkey"
        FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable: DropEntry
CREATE TABLE IF NOT EXISTS "DropEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dropId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'entered',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DropEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DropEntry_userId_dropId_key" ON "DropEntry"("userId", "dropId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'DropEntry_userId_fkey'
    ) THEN
        ALTER TABLE "DropEntry"
        ADD CONSTRAINT "DropEntry_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'DropEntry_dropId_fkey'
    ) THEN
        ALTER TABLE "DropEntry"
        ADD CONSTRAINT "DropEntry_dropId_fkey"
        FOREIGN KEY ("dropId") REFERENCES "Drop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable: DropNotification
CREATE TABLE IF NOT EXISTS "DropNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dropId" TEXT NOT NULL,
    "emailed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DropNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DropNotification_userId_dropId_key" ON "DropNotification"("userId", "dropId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'DropNotification_userId_fkey'
    ) THEN
        ALTER TABLE "DropNotification"
        ADD CONSTRAINT "DropNotification_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'DropNotification_dropId_fkey'
    ) THEN
        ALTER TABLE "DropNotification"
        ADD CONSTRAINT "DropNotification_dropId_fkey"
        FOREIGN KEY ("dropId") REFERENCES "Drop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AlterTable: Add missing columns to Drop
ALTER TABLE "Drop" ADD COLUMN IF NOT EXISTS "notifiedAt" TIMESTAMP(3);
ALTER TABLE "Drop" ADD COLUMN IF NOT EXISTS "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Drop" ADD COLUMN IF NOT EXISTS "accessType" TEXT NOT NULL DEFAULT 'open';
ALTER TABLE "Drop" ADD COLUMN IF NOT EXISTS "maxQuantity" INTEGER;

-- Drop the old integer likes column if it exists (replaced by Like table)
ALTER TABLE "Drop" DROP COLUMN IF EXISTS "likes";
