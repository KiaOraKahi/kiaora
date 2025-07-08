/*
  Warnings:

  - The values [NOT_STARTED,ENABLED] on the enum `StripeAccountStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StripeAccountStatus_new" AS ENUM ('PENDING', 'RESTRICTED', 'ACTIVE', 'REJECTED');
ALTER TABLE "Celebrity" ALTER COLUMN "stripeAccountStatus" DROP DEFAULT;
ALTER TABLE "Celebrity" ALTER COLUMN "stripeAccountStatus" TYPE "StripeAccountStatus_new" USING ("stripeAccountStatus"::text::"StripeAccountStatus_new");
ALTER TYPE "StripeAccountStatus" RENAME TO "StripeAccountStatus_old";
ALTER TYPE "StripeAccountStatus_new" RENAME TO "StripeAccountStatus";
DROP TYPE "StripeAccountStatus_old";
ALTER TABLE "Celebrity" ALTER COLUMN "stripeAccountStatus" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "Celebrity" ALTER COLUMN "stripeAccountStatus" SET DEFAULT 'PENDING';
