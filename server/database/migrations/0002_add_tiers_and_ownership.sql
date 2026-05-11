-- Replace isPayingUser boolean with accountTier text
ALTER TABLE "users" ADD COLUMN "account_tier" text DEFAULT 'free' NOT NULL;
ALTER TABLE "users" DROP COLUMN IF EXISTS "is_paying_user";

-- Add owner_id to restaurants for user ownership
ALTER TABLE "restaurants" ADD COLUMN "owner_id" uuid;
