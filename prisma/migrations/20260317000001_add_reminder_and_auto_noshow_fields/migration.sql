-- Add reminder tracking + auto no-show charge tracking to Appointment
ALTER TABLE "Appointment" ADD COLUMN "reminder24hSentAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN "reminder1hSentAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN "autoNoShowChargedAt" TIMESTAMP(3);
