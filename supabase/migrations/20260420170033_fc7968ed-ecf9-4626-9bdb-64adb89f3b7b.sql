-- Restrict Realtime channel subscriptions to authenticated users only.
-- This matches the existing app-wide policy: all business tables are shared
-- among authenticated users, so Realtime events follow the same scope.
-- Anonymous users are denied any Realtime subscription.

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can receive realtime" ON realtime.messages;
CREATE POLICY "Authenticated can receive realtime"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated can send realtime" ON realtime.messages;
CREATE POLICY "Authenticated can send realtime"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (true);
