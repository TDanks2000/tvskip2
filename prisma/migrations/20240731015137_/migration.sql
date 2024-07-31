-- AlterTable
ALTER TABLE "SkipTime" ADD COLUMN     "down_votes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "movieId" INTEGER,
ADD COLUMN     "up_votes" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Movie" (
    "id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "release_date" TIMESTAMP(3),

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Movie_id_key" ON "Movie"("id");

-- AddForeignKey
ALTER TABLE "SkipTime" ADD CONSTRAINT "SkipTime_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE SET NULL ON UPDATE CASCADE;
