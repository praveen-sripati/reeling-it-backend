-- CreateEnum
CREATE TYPE "kind" AS ENUM ('movie', 'series', 'season', 'episode', 'movieseries');

-- CreateTable
CREATE TABLE "access_log" (
    "time" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "client_ip" INET,
    "page" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "runtime" DOUBLE PRECISION
);

-- CreateTable
CREATE TABLE "casts" (
    "movie_id" BIGINT NOT NULL,
    "person_id" BIGINT NOT NULL,
    "job_id" BIGINT NOT NULL,
    "role" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "casts_pkey" PRIMARY KEY ("movie_id","person_id","job_id","role","position")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" BIGINT NOT NULL,
    "parent_id" BIGINT,
    "root_id" BIGINT,
    "name" TEXT,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_names" (
    "category_id" BIGINT NOT NULL,
    "name" TEXT,
    "language" TEXT NOT NULL,

    CONSTRAINT "category_names_pkey" PRIMARY KEY ("category_id","language")
);

-- CreateTable
CREATE TABLE "image_ids" (
    "id" BIGINT NOT NULL,
    "object_id" BIGINT,
    "object_type" TEXT,
    "image_version" INTEGER,

    CONSTRAINT "image_ids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image_licenses" (
    "image_id" BIGINT NOT NULL,
    "source" TEXT,
    "license_id" BIGINT,
    "author" TEXT,

    CONSTRAINT "image_licenses_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "job_names" (
    "job_id" BIGINT NOT NULL,
    "name" TEXT,
    "language" TEXT NOT NULL,

    CONSTRAINT "job_names_pkey" PRIMARY KEY ("job_id","language")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" BIGINT NOT NULL,
    "name" TEXT,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movie_abstracts_de" (
    "movie_id" BIGINT NOT NULL,
    "abstract" TEXT,

    CONSTRAINT "movie_abstracts_de_pkey" PRIMARY KEY ("movie_id")
);

-- CreateTable
CREATE TABLE "movie_abstracts_en" (
    "movie_id" BIGINT NOT NULL,
    "abstract" TEXT,

    CONSTRAINT "movie_abstracts_en_pkey" PRIMARY KEY ("movie_id")
);

-- CreateTable
CREATE TABLE "movie_abstracts_es" (
    "movie_id" BIGINT NOT NULL,
    "abstract" TEXT,

    CONSTRAINT "movie_abstracts_es_pkey" PRIMARY KEY ("movie_id")
);

-- CreateTable
CREATE TABLE "movie_abstracts_fr" (
    "movie_id" BIGINT NOT NULL,
    "abstract" TEXT,

    CONSTRAINT "movie_abstracts_fr_pkey" PRIMARY KEY ("movie_id")
);

-- CreateTable
CREATE TABLE "movie_aliases_iso" (
    "movie_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "official_translation" INTEGER NOT NULL,

    CONSTRAINT "movie_aliases_iso_pkey" PRIMARY KEY ("movie_id","name","language","official_translation")
);

-- CreateTable
CREATE TABLE "movie_categories" (
    "movie_id" BIGINT NOT NULL,
    "category_id" BIGINT NOT NULL,

    CONSTRAINT "movie_categories_pkey" PRIMARY KEY ("movie_id","category_id")
);

-- CreateTable
CREATE TABLE "movie_countries" (
    "movie_id" BIGINT NOT NULL,
    "country" TEXT NOT NULL,

    CONSTRAINT "movie_countries_pkey" PRIMARY KEY ("movie_id","country")
);

-- CreateTable
CREATE TABLE "movie_keywords" (
    "movie_id" BIGINT NOT NULL,
    "category_id" BIGINT NOT NULL,

    CONSTRAINT "movie_keywords_pkey" PRIMARY KEY ("movie_id","category_id")
);

-- CreateTable
CREATE TABLE "movie_languages" (
    "movie_id" BIGINT NOT NULL,
    "language" TEXT NOT NULL,

    CONSTRAINT "movie_languages_pkey" PRIMARY KEY ("movie_id","language")
);

-- CreateTable
CREATE TABLE "movie_links" (
    "source" TEXT,
    "key" TEXT NOT NULL,
    "movie_id" BIGINT NOT NULL,
    "language" TEXT NOT NULL,

    CONSTRAINT "movie_links_pkey" PRIMARY KEY ("movie_id","language","key")
);

-- CreateTable
CREATE TABLE "movie_references" (
    "movie_id" BIGINT NOT NULL,
    "referenced_id" BIGINT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "movie_references_pkey" PRIMARY KEY ("movie_id","referenced_id","type")
);

-- CreateTable
CREATE TABLE "movies" (
    "id" BIGINT NOT NULL,
    "name" TEXT,
    "parent_id" BIGINT,
    "date" DATE,
    "series_id" BIGINT,
    "kind" "kind",
    "runtime" INTEGER,
    "budget" DECIMAL,
    "revenue" DECIMAL,
    "homepage" TEXT,
    "vote_average" DECIMAL,
    "votes_count" BIGINT,

    CONSTRAINT "movies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "people" (
    "id" BIGINT NOT NULL,
    "name" TEXT,
    "birthday" DATE,
    "deathday" DATE,
    "gender" INTEGER,

    CONSTRAINT "people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "people_aliases" (
    "person_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "people_aliases_pkey" PRIMARY KEY ("person_id","name")
);

-- CreateTable
CREATE TABLE "people_links" (
    "source" TEXT,
    "key" TEXT NOT NULL,
    "person_id" BIGINT NOT NULL,
    "language" TEXT NOT NULL,

    CONSTRAINT "people_links_pkey" PRIMARY KEY ("person_id","language","key")
);

-- CreateTable
CREATE TABLE "trailers" (
    "trailer_id" BIGINT NOT NULL,
    "key" TEXT,
    "movie_id" BIGINT NOT NULL,
    "language" TEXT,
    "source" TEXT,

    CONSTRAINT "trailers_pkey" PRIMARY KEY ("movie_id","trailer_id")
);

-- AddForeignKey
ALTER TABLE "casts" ADD CONSTRAINT "casts_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "casts" ADD CONSTRAINT "casts_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "casts" ADD CONSTRAINT "casts_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_root_id_fkey" FOREIGN KEY ("root_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "category_names" ADD CONSTRAINT "category_names_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "image_licenses" ADD CONSTRAINT "image_licenses_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "image_ids"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_names" ADD CONSTRAINT "job_names_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movie_abstracts_de" ADD CONSTRAINT "movie_abstracts_de_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movie_abstracts_en" ADD CONSTRAINT "movie_abstracts_en_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movie_abstracts_es" ADD CONSTRAINT "movie_abstracts_es_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movie_abstracts_fr" ADD CONSTRAINT "movie_abstracts_fr_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movie_aliases_iso" ADD CONSTRAINT "movie_aliases_iso_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movie_categories" ADD CONSTRAINT "movie_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movie_categories" ADD CONSTRAINT "movie_categories_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movie_countries" ADD CONSTRAINT "movie_countries_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movie_keywords" ADD CONSTRAINT "movie_keywords_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movie_keywords" ADD CONSTRAINT "movie_keywords_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movie_languages" ADD CONSTRAINT "movie_languages_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movie_links" ADD CONSTRAINT "movie_links_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movie_references" ADD CONSTRAINT "movie_references_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movie_references" ADD CONSTRAINT "movie_references_referenced_id_fkey" FOREIGN KEY ("referenced_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movies" ADD CONSTRAINT "movies_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movies" ADD CONSTRAINT "movies_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "people_aliases" ADD CONSTRAINT "people_aliases_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "people_links" ADD CONSTRAINT "people_links_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trailers" ADD CONSTRAINT "trailers_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
