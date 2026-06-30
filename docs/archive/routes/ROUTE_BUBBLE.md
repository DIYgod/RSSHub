# Route: Bubble Artist Notifications

← [INDEX](INDEX.md) | Setup: [RSSHUB_SETUP.md](RSSHUB_SETUP.md)

## Context

Bubble is a paid fan-messaging platform (per-artist subscription, ~$4-5/month).
Full message content is behind a paywall. This route provides **notify-only**
functionality: it detects new messages and creates a feed item that links to
the Bubble app.

## File Location

`lib/v2/bubble/artist-notify.ts`

## Route Path

`/bubble/artist/:artistSlug`

## Parameters

| Param        | Type   | Example  | Source                              |
| ------------ | ------ | -------- | ----------------------------------- |
| `artistSlug` | string | `bts-rm` | `bubble-official.com/artist/{slug}` |

## Approach: Three Tiers

### Tier 1: Public page notify (implemented)

Scrape `bubble-official.com/artist/{slug}` for the visible preview text and
timestamp. Generates a "New message available" item with a deep link.
No auth required. Returns minimal data.

### Tier 2: Manual import (Sunbi feature, not RSSHub)

A text area in the Sunbi extension where users paste a Bubble message.
Sunbi runs Bibim on the text. This is the most valuable tier for language
learning. No ToS issues. Implemented in the extension, not here.

### Tier 3: Session cookie (future, power users only)

If `BUBBLE_COOKIE` is set in `.env`, use Bubble's internal API to fetch
full message content. ToS-grey zone — defer until user demand is confirmed.

## Public Page Scraping

Bubble's public artist page structure (as of 2026):

```
bubble-official.com/artist/{slug}
  → Profile image, artist name
  → "Latest message" preview (visible before login, ~20-30 chars)
  → Timestamp of last message
```

Target these conservatively with structural selectors (Bubble also uses
CSS Modules):

```typescript
const profileImg = $('img[class*="profile"], img[class*="avatar"]').first().attr('src');
const artistName = $('h1, [class*="artist-name"]').first().text().trim();
const previewText = $('[class*="message-preview"], [class*="latest-message"]').first().text().trim().slice(0, 100);
const lastActive = $('[class*="last-active"], time').first().attr('datetime') ?? $('[class*="last-active"], time').first().text().trim();
```

## `_extra` payload shape

```typescript
{
  type: 'bubble_notification',
  platform: 'bubble',
  artistSlug: string,
  artistName: string,
  previewText: string | null,
  requiresSubscription: true,
  deepLink: string,              // 'bubble://artist/{artistSlug}'
}
```

## Feed Deduplication

Bubble doesn't provide per-message IDs on the public page. Use the
`lastActive` timestamp as the guid. If the timestamp hasn't changed since
the last fetch, no new item is created.

```typescript
// Use timestamp as guid to prevent duplicate notifications
const guid = `bubble:${artistSlug}:${lastActive}`;
```

## Card Behaviour in Sunbi

See [CARDS.md](CARDS.md) — BubbleCard section.
The card shows:

- Artist profile photo
- "New message available" headline
- Preview snippet (if scraped)
- "Open in Bubble →" CTA button with deep link

The CTA should attempt `bubble://` scheme first, fall back to
`https://bubble-official.com/artist/{artistSlug}` if the app is not installed.
