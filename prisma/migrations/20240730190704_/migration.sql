/*
  Warnings:

  - You are about to drop the column `tmdb_id` on the `Tv` table. All the data in the column will be lost.
  - You are about to drop the `Movie` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Tv" DROP COLUMN "tmdb_id";

-- DropTable
DROP TABLE "Movie";
