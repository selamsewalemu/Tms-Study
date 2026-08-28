# TMS API Versioning Policy

## Version format

Public API versions use URL segments such as `/api/v1/courses` and `/api/v2/courses`. URL-segment versioning is the default because it is visible in logs, browser requests, and incident reports. A client may remain on a supported version while it migrates.

## Breaking changes

A change is breaking when an existing valid client can no longer interpret or successfully send the same request. Examples include removing or renaming a response field, changing a status code or response shape, tightening validation, changing the meaning of a field, or changing a default sort order. Breaking changes require a new major API version.

## Additive changes

Adding an optional response field, a new endpoint, or an optional query parameter is non-breaking. Additive changes must not make an existing field required or alter the meaning of an existing response.

## Deprecation and sunset

V1 remains available for at least six months after V2 is released. Deprecated V1 responses carry `Deprecation: true`, a UTC `Sunset` date, and a `Link` header with `rel="successor-version"` pointing to V2. The shutdown date is announced before the sunset date and is not moved earlier than the published six-month window.

## Communication

When V2 ships, the team updates the changelog, sends notice to every team holding an API key, and schedules a calendar reminder for the V1 shutdown. The deprecation headers are present from the first V2 release so clients can discover the migration path programmatically.

## Skipping versions

Clients may move directly from V1 to V3 when V3 is the appropriate target. Clients are never required to adopt every intermediate version, provided the target version documents the complete contract and migration notes.
