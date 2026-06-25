-- CreateIndex
CREATE INDEX "device_sessions_expires_at_idx" ON "device_sessions"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_provider_provider_subscription_id_key" ON "subscriptions"("provider", "provider_subscription_id");
