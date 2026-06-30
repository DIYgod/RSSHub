# Route: Viki Drama Series

← [INDEX](INDEX.md) | Setup: [RSSHUB_SETUP.md](RSSHUB_SETUP.md)

## File Location

`lib/v2/viki/drama-series.ts`

## Route Path

`/viki/series/:showId`

## Parameters

| Param    | Type                  | Example  | Source                                                               |
| -------- | --------------------- | -------- | -------------------------------------------------------------------- |
| `showId` | string (alphanumeric) | `37500c` | `viki.com/tv/37500c-crash-landing-on-you` — take ID before first `-` |

## Radar Rules

```typescript
radar: [
    {
        source: ['viki.com/tv/:showId*'],
        target: (params) => {
            const id = params.showId?.split('-')[0];
            return id ? `/viki/series/${id}` : null;
        },
    },
];
```

## Data Source: Viki Internal API

Viki's frontend uses an internal JSON API (no OAuth required for public shows).

### Show metadata endpoint

```
GET https://api.viki.io/v4/containers/{showId}.json?app=100005a&locale=en
```

### Episode list endpoint

```
GET https://api.viki.io/v4/containers/{showId}/episodes.json
    ?app=100005a&locale=en&sort=desc&per_page=20
```

### Response shape (episode object)

```typescript
{
  id: string,                     // episode ID (e.g. "1234567v")
  number: number,                 // episode number
  titles: { en: string, ko: string },
  descriptions: { en: string, ko: string },
  images: {
    thumbnail: { url: string },
    cover: { url: string },
  },
  duration: number,               // seconds
  created_at: string,             // ISO 8601
  on_air_start: string,           // scheduled air time
  is_locked: boolean,             // true = Viki Pass required
}
```

### Required Headers

```typescript
{
  'User-Agent': 'Mozilla/5.0 ...',
  'Origin': 'https://www.viki.com',
  'Referer': 'https://www.viki.com/',
}
```

## `_extra` payload shape

```typescript
{
  type: 'drama_episode',
  platform: 'viki',
  showId: string,
  episodeId: string,
  episodeNumber: number,
  thumbnail: string,
  showTitle: string,
  showPoster: string,
  genres: string[],
  country: string,
  duration: number,              // seconds
  isFree: boolean,               // !is_locked
  sourceLocale: 'ko',
}
```

## Cache Strategy

| Data               | Key                         | TTL    |
| ------------------ | --------------------------- | ------ |
| Show metadata      | `viki:series:meta:{showId}` | 3600s  |
| Individual episode | `viki:ep:{episodeId}`       | 86400s |
| Episode list       | Not cached                  | —      |

## Viki Pass vs Free

`is_locked: true` in the API response means the episode requires Viki Pass.
Map to `is_free = !is_locked` and show the appropriate badge in the card.
Episodes that are geo-restricted will return `is_locked: true` regardless of pass.

## Episode URL Pattern

```
https://www.viki.com/videos/{episodeId}v
```

Note the `v` suffix — Viki appends it in their URLs.
