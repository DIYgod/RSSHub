# RSSHub Route: Naver Webtoon Series

Repo: `sunbi-rsshub` ← [INDEX](INDEX.md)

## File Location

`lib/routes/naver/webtoon-series.ts`

## Route Path

\`/naver/webtoon/series/:titleId\`

## Parameters

| Param       | Type   | Required | Example    | Source                                            |
| ----------- | ------ | -------- | ---------- | ------------------------------------------------- |
| \`titleId\` | string | ✅       | \`845271\` | \`m.comic.naver.com/webtoon/list?titleId=845271\` |

## Mobile-First Strategy

**Target**: \`m.comic.naver.com\` (desktop site cascades/slices images)  
**Why**: Server-rendered HTML, clean selectors, same image CDN as desktop

## Live Validation (Apr 2026)

```
Series: https://m.comic.naver.com/webtoon/list?titleId=845271 (먹는 인생2)
Status: 200 OK
Episodes detected: 24+
Episode 36 hash: 6ecf0112aa90b8b95f67009c0328326f (27 pages)
Episode 37 hash: 31638864ed9bc9c5a78f6c94a293acf4 (29 pages)
[code_file:164]
```

## Selector Reference (Structural + Fallbacks)

| Data          | Primary                         | Fallback                      | Mobile selector |
| ------------- | ------------------------------- | ----------------------------- | --------------- |
| Series title  | \`h1.title\`                    | \`meta[property="og:title"]\` | ✓               |
| Episode link  | \`a[href*="webtoon/detail"]\`   | —                             | ✓               |
| Episode title | \`strong.title, span.title\`    | —                             | ✓               |
| Episode date  | \`span.date, .date\`            | —                             | ✓               |
| Episode thumb | \`img[src*="comic.naver.com"]\` | series OG image               | ✓               |
| Free badge    | \`.ico_free, [class*="free"]\`  | —                             | ✓               |

## Cache Strategy

| Data            | Key                                 | TTL    |
| --------------- | ----------------------------------- | ------ |
| Series metadata | \`naver:webtoon:meta:{titleId}\`    | 900s   |
| Episode detail  | \`naver:webtoon:ep:{titleId}:{no}\` | 86400s |

## Headers (Required)

```typescript
const HEADERS = {
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.5',
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)...',
    Referer: 'https://m.comic.naver.com/',
};
```

## Full Route Implementation

```typescript
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

const BASE_MOBILE = 'https://m.comic.naver.com';

export const route: Route = {
  path: '/webtoon/series/:titleId',
  name: 'Naver Webtoon Series (Mobile)',
  maintainers: ['ianhoffmanx'],
  radar: [
    {
      source: ['m.comic.naver.com/webtoon/list?titleId=*'],
      target: (params, url) => new URL(url).searchParams.get('titleId'),
    },
  ],
  handler,
};

async function handler(ctx) {
  const { titleId } = ctx.req.param();
  const listUrl = `${BASE_MOBILE}/webtoon/list?titleId=${titleId}`;

  // 1. Series metadata (cached)
  const seriesMeta = await cache.tryGet(
    `naver-m:meta:${titleId}`,
    async () => {
      const html = await ofetch(listUrl, { headers: HEADERS });
      const $ = load(html);
      return {
        title: $('h1.title, meta[property="og:title"]').first().text().trim(),
        thumb: $('meta[property="og:image"]').attr('content') ?? '',
      };
    },
    900
  );

  // 2. Episode list (fresh)
  const html = await ofetch(listUrl, { headers: HEADERS });
  const $ = load(html);

  const episodes = $('div.episode_list li a, div.section_episode li a')
    .toArray()
    .map((el) => {
      const $el = $(el);
      const href = $el.attr('href') ?? '';
      const noMatch = href.match(/no=(\d+)/);
      const no = noMatch?.[1] ?? '';

      return {
        title: $el.find('strong.title, span.title').first().text().trim(),
        link: href.startsWith('http') ? href : `${BASE_MOBILE}${href}`,
        no,
        dateStr: $el.find('span.date, .date').first().text().trim(),
        thumb: $el.find('img[src*="comic.naver.com"]').first().attr('src') ?? seriesMeta.thumb,
        isFree: $el.find('.ico_free, [class*="free"]').length > 0,
      };
    });

  // 3. Episode enrichment (hash extraction)
  const items = await Promise.all(
    episodes.slice(0, 10).map((ep) =>  // newest 10
      cache.tryGet(`naver-m:ep:${titleId}:${ep.no}`, async () => {
        const epUrl = ep.link;
        const epHtml = await ofetch(epUrl, { headers: HEADERS });

        // Extract episode hash for OCR pipeline
        const hashMatch = epHtml.match(/image-comic\.pstatic\.net.*?\/(\w+)_\d+\.jpg/);
        const episodeHash = hashMatch?.[1] ?? null;

        // Count images on page (total pages)
        const $ep = load(epHtml);
        const pageImages = $ep.find('img[src*="image-comic.pstatic.net"]').length;

        return {
          title: ep.title,
          link: epUrl,
          pubDate: parseDate(ep.dateStr, ['YY.MM.DD']),
          description: buildEpisodeHtml(ep, seriesMeta),
          extra: {
            type: 'webtoon_episode',
            platform: 'naver',
            titleId,
            episodeNo: ep.no,
            episodeHash,
            totalPages: pageImages,
            thumbnail: ep.thumb,
            seriesTitle: seriesMeta.title,
            isFree: ep.isFree,
            sourceLocale: 'ko',
            ocrReady: !!episodeHash,
          },
        };
      }, 86400)
    )
  );

  return {
    title: \`네이버 웹툰: \${seriesMeta.title}\`,
    link: listUrl,
    image: seriesMeta.thumb,
    item: items,
  };
}
```

## extra Fields for Sunbi

```typescript
{
  type: 'webtoon_episode',
  platform: 'naver',
  titleId: '845271',
  episodeNo: '36',
  episodeHash: '6ecf0112aa90b8b95f67009c0328326f',  ← OCR key!
  totalPages: 27,                          ← from img count
  thumbnail: string,
  seriesTitle: string,
  isFree: boolean,
  ocrReady: boolean,                       ← !!episodeHash
}
```
