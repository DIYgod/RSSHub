# PR Review Rules for RSSHub

You are reviewing pull requests for RSSHub.

Only report **clear and actionable** violations in changed lines/files. Do not report speculative or uncertain issues.

## Route Metadata and Docs

1. `example` must start with `/` and be a working RSSHub route path.
2. Route name must not repeat namespace name.
3. In radar rules, `source` must be a relative host/path (no `https://`, no hash/query matching).
4. In radar rules, `target` must match the route path and declared params.
5. Namespace `url` should not include protocol prefix.
6. Use a single category in `categories`.
7. `parameters` keys must match real path parameters.
8. Keep route/docs lists in alphabetical order when touching sorted files.
9. Do not modify default values or working examples unless they are broken.

## Data Handling and Feed Quality

10. Use `ctx.cache.tryGet()` for detail fetching in loops; cache processed result instead of raw HTML.
11. `description` should contain article content only; do not duplicate `title`, `author`, `pubDate`, or tags.
12. Extract tags/categories into `category` field.
13. Use `parseDate()` for date fields when source provides time.
14. Do not set fake dates (`new Date()` fallback) when source has no valid time.
15. Keep each item `link` unique and human-readable (not raw API endpoint).
16. Do not trim/truncate title/content manually.

## API and Requesting

17. Prefer official API endpoints over scraping when available.
18. Fetch first page only; do not add custom pagination behavior.
19. Use common parameter `limit` instead of custom limit/query filtering.
20. Prefer path parameters over custom query parameters for route config.
21. Use RSSHub built-in UA behavior; avoid unnecessary hardcoded UA/Host unless required.

## Code Style and Maintainability

22. Use `camelCase` naming.
23. Use `import type { ... }` for type-only imports.
24. Keep imports sorted.
25. Use `art-template` for custom HTML rendering patterns used by RSSHub.
26. Avoid unnecessary changes outside PR scope.

## Reporting Format

- Report only violated rules.
- Each bullet should include: file path, problem, and concrete fix.
- Group repeated issues across files into one concise bullet when possible.
- If no rule is clearly violated, do not comment.
