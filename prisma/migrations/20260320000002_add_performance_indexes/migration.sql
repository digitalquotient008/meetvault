-- Appointment: index for cleanup cron (status + createdAt)
CREATE INDEX "Appointment_status_createdAt_idx" ON "Appointment"("status", "createdAt");

-- Payment: index for webhook lookup by stripePaymentIntentId
CREATE INDEX "Payment_stripePaymentIntentId_idx" ON "Payment"("stripePaymentIntentId");

-- AuditLog: index for retention cleanup by createdAt
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
