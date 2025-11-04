/*
  Warnings:

  - You are about to drop the column `field` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `newValue` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `oldValue` on the `Log` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Log" DROP COLUMN "field",
DROP COLUMN "newValue",
DROP COLUMN "oldValue";
