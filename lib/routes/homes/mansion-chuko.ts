import { residentialItems } from '@/routes/suumo/residential';
import type { Data, Route } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';

import { checkSlugs, DEFAULT_LIMIT, DETAIL_BUDGET, homesFetcher, HOST, parseHomesBuyList, parseHomesDetail } from './utils';

export const handler = async (ctx): Promise<Data> => {
    const pref: string = ctx.req.param('pref');
    const city: string = ctx.req.param('city');
    checkSlugs({ pref, city });
    // `cond[sortby]=newdate` is the page's own 新着順.
    const listUrl = `${HOST}/mansion/chuko/${pref}/${city}/list/?cond%5Bsortby%5D=newdate`;
    const fetchPage = homesFetcher();
    const units = parseHomesBuyList(await fetchPage(listUrl));
    if (units.length === 0) {
        throw new Error(`homes: no listing found on ${listUrl}; the area slug may be wrong or the page structure changed`);
    }
    const limit = Math.min(getRouteLimit(ctx, DEFAULT_LIMIT), units.length);
    // The sale page keeps its 物件概要 table in #about; the recommended listings further down carry their own 住所 / 交通.
    const items = await residentialItems(units.slice(0, limit), { source: 'homes', deal_kind: 'sale' }, ctx.req.query('detail') === '0' ? null : (html) => parseHomesDetail(html, '#about'), fetchPage, { maxFetches: DETAIL_BUDGET });

    return {
        title: `LIFULL HOME'S 中古マンション (${pref}/${city})`,
        link: listUrl,
        language: 'ja',
        item: items,
    };
};

export const route: Route = {
    path: '/mansion/chuko/:pref/:city',
    name: '中古マンション',
    url: 'www.homes.co.jp',
    maintainers: ['pseudoyu'],
    handler,
    example: '/homes/mansion/chuko/tokyo/minato-city',
    parameters: {
        pref: {
            description: '都道府県 slug, e.g. `tokyo`, `kanagawa`',
        },
        city: {
            description: "市区町村 slug as LIFULL HOME'S spells it — `minato-city` for `/mansion/chuko/tokyo/minato-city/list/`",
        },
    },
    description: `中古マンション for sale on LIFULL HOME'S for one 市区町村，newest first (the page's own 新着順).

Each unit row of a building block is one item: the block gives 交通，所在地，構造，階数，築年月 and 総戸数，the row 階，価格，間取り，専有面積，主要採光面 and a 価格更新 note when the price moved (\`raw.price_updated\`). Each unit's own page is then read once (cached per listing) for 管理費等，修繕積立金，用途地域，土地権利，管理，現況，引渡し，取引態様 and the 情報公開日 / 最新情報提供日.

\`_extra\` follows the shared residential shape with \`deal_kind: 'sale'\`; \`listed_at\` is the 情報公開日.

The site sits behind AWS WAF, which starts answering a client with an empty challenge page after only a few requests: measured on 2026-10-31 at about fifteen in an hour and again at about eight in ten minutes, from one address, and lifted within the hour. The route reports that as an error naming the challenge rather than as an empty feed, and does not try to get past it. To stay under that, one poll requests at most five detail pages it has not cached yet, and stops requesting altogether once the site has challenged it; items past that keep their list fields until a later poll fills them in. A challenged list page fails the feed. Poll each area infrequently and not several areas at once, and pass \`detail=0\` to make one request per poll instead of one per item.

| Query    | Description                                                    | Default |
| -------- | -------------------------------------------------------------- | ------- |
| \`limit\`  | Units to return, at most one list page                         | 20      |
| \`detail\` | \`0\` skips the per-unit pages and returns list-page fields only | \`1\`     |`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.homes.co.jp/mansion/chuko/:pref/:city/list'],
            target: '/mansion/chuko/:pref/:city',
        },
    ],
};
