# Architecture
- Keep authenticated equipment and donation CRUD in typed, object-oriented services using the existing managed client; this avoids duplicating connection configuration.
- Link donations to equipment through a composite equipment/owner foreign key with cascading deletion; this prevents cross-owner associations and orphan donations.
- Keep the new CRUD service separate from the existing local listing/chat store until UI integration is requested; this preserves current flows.