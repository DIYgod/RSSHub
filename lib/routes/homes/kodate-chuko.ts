import { residentialItems } from '@/routes/suumo/residential';
import type { Data, Route } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';

import { checkSlugs, DEFAULT_LIMIT, DETAIL_BUDGET, HOMES_SALE_DETAIL_SCOPE, homesFetcher, HOST, parseHomesBuyList, parseHomesDetail } from './utils';

export const handler = async (ctx): Promise<Data> => {
    const pref: string = ctx.req.param('pref');
    const city: string = ctx.req.param('city');
    checkSlugs({ pref, city });
    // `cond[sortby]=newdate` is the page's own 新着順.
    const listUrl = `${HOST}/kodate/chuko/${pref}/${city}/list/?cond%5Bsortby%5D=newdate`;
    const fetchPage = homesFetcher();
    const units = parseHomesBuyList(await fetchPage(listUrl));
    if (units.length === 0) {
        throw new Error(`homes: no listing found on ${listUrl}; the area slug may be wrong or the page structure changed`);
    }
    const limit = Math.min(getRouteLimit(ctx, DEFAULT_LIMIT), units.length);
    const items = await residentialItems(units.slice(0, limit), { source: 'homes', deal_kind: 'sale' }, ctx.req.query('detail') === '0' ? null : (html) => parseHomesDetail(html, HOMES_SALE_DETAIL_SCOPE), fetchPage, {
        maxFetches: DETAIL_BUDGET,
    });

    return {
        title: `LIFULL HOME'S 中古一戸建て (${pref}/${city})`,
        link: listUrl,
        language: 'ja',
        item: items,
    };
};

export const route: Route = {
    path: '/kodate/chuko/:pref/:city',
    name: '中古一戸建て',
    url: 'www.homes.co.jp',
    maintainers: ['pseudoyu'],
    handler,
    example: '/homes/kodate/chuko/tokyo/setagaya-city',
    parameters: {
        pref: {
            description: '都道府県 slug, e.g. `tokyo`, `kanagawa`',
        },
        city: {
            description: "市区町村 slug as LIFULL HOME'S spells it — `setagaya-city` for `/kodate/chuko/tokyo/setagaya-city/list/`",
        },
    },
    description: `中古一戸建て for sale on LIFULL HOME'S for one 市区町村，newest first (the page's own 新着順).

Each house block of the list page is one item: 交通，所在地，建築年，現況 and 主要採光面 from the block, 価格，間取り，土地面積 and 建物面積 from its row, and a 価格更新 note when the price moved (\`raw.price_updated\`). Each house's own page is then read once (cached per listing) for 建物構造，接道状況，都市計画，用途地域，建ぺい率，容積率，土地権利，引渡し，取引態様 and the 情報公開日 / 最新情報提供日.

\`_extra\` follows the shared residential shape with \`deal_kind: 'sale'\`: \`area_m2\` is the 建物面積，\`land_area_m2\` the 土地面積 and \`listed_at\` the 情報公開日.

The site sits behind AWS WAF, which starts answering a client with an empty challenge page after only a few requests: measured on 2026-10-31 at about fifteen in an hour and again at about eight in ten minutes, from one address, and lifted within the hour. The route reports that as an error naming the challenge rather than as an empty feed, and does not try to get past it. To stay under that, one poll requests at most five detail pages it has not cached yet, and stops requesting altogether once the site has challenged it; items past that keep their list fields until a later poll fills them in. A challenged list page fails the feed. Poll each area infrequently and not several areas at once, and pass \`detail=0\` to make one request per poll instead of one per item.

| Query    | Description                                                     | Default |
| -------- | --------------------------------------------------------------- | ------- |
| \`limit\`  | Houses to return, at most one list page                         | 20      |
| \`detail\` | \`0\` skips the per-house pages and returns list-page fields only | \`1\`     |`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.homes.co.jp/kodate/chuko/:pref/:city/list'],
            target: '/kodate/chuko/:pref/:city',
        },
    ],
};
