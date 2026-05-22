ALTER TABLE "dishes" ALTER COLUMN "scale_cm" SET DEFAULT 24;
UPDATE "dishes" SET "scale_cm" = 24 WHERE "scale_cm" IS NULL;
