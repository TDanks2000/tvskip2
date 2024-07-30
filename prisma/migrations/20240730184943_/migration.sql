/*
  Warnings:

  - You are about to drop the column `tmdb_id` on the `Episode` table. All the data in the column will be lost.
  - You are about to drop the column `tmdb_id` on the `Season` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Episode" DROP COLUMN "tmdb_id";

-- AlterTable
ALTER TABLE "Season" DROP COLUMN "tmdb_id";
