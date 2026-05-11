ALTER TABLE "generation_jobs" ADD COLUMN "external_task_id" text;
ALTER TABLE "generation_jobs" ADD COLUMN "progress" integer DEFAULT 0 NOT NULL;
