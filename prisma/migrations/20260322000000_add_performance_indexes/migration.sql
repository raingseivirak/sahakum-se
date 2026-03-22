-- Performance indexes for ContentItem
-- Speeds up public posts/pages queries that filter by type+status and order by publishedAt
CREATE INDEX "content_items_type_status_idx" ON "content_items"("type", "status");
CREATE INDEX "content_items_published_at_idx" ON "content_items"("publishedAt");
CREATE INDEX "content_items_author_id_idx" ON "content_items"("authorId");

-- Performance indexes for Event
-- Speeds up upcoming/past event queries (status + time filter) and ordering by startDate
CREATE INDEX "events_status_end_date_idx" ON "events"("status", "endDate");
CREATE INDEX "events_start_date_idx" ON "events"("startDate");
CREATE INDEX "events_author_id_idx" ON "events"("authorId");

-- Performance indexes for MembershipRequest
-- Speeds up admin list filtering by status and duplicate email checks
CREATE INDEX "membership_requests_status_idx" ON "membership_requests"("status");
CREATE INDEX "membership_requests_email_idx" ON "membership_requests"("email");
