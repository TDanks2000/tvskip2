/*
  Warnings:

  - You are about to drop the `item` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Season" DROP CONSTRAINT "Season_item_id_fkey";

-- DropTable
DROP TABLE "item";

-- CreateTable
CREATE TABLE "Movie" (
    "id" SERIAL NOT NULL,
    "tmdb_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "release_date" TIMESTAMP(3),

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tv" (
    "id" SERIAL NOT NULL,
    "tmdb_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "first_air_date" TIMESTAMP(3),

    CONSTRAINT "Tv_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Tv"("id") ON DELETE SET NULL ON UPDATE CASCADE;
