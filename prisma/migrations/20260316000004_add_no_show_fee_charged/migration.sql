-- Add noShowFeeCharged flag to Appointment to safely track no-show fee state
ALTER TABLE "Appointment" ADD COLUMN "noShowFeeCharged" BOOLEAN NOT NULL DEFAULT false;
