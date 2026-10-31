import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';

import { residentialItems } from './residential';
import { areaSlug, checkSlugs, DEFAULT_LIMIT, HOST, parseBuyDetail, parseBuyList } from './utils';

export const handler = async (ctx): Promise<Data> => {
    const pref: string = ctx.req.param('pref');
    const city = areaSlug(ctx.req.param('city'));
    checkSlugs({ pref, city });
    // `po=1&pj=2` is the page's own 新着・更新順.
    const listUrl = `${HOST}/ms/chuko/${pref}/sc_${city}/?po=1&pj=2`;
    const units = parseBuyList(await ofetch<string>(listUrl), '中古マンション');
    if (units.length === 0) {
        throw new Error(`suumo: no listing found on ${listUrl}; the area slug may be wrong or the page structure changed`);
    }
    const limit = Math.min(getRouteLimit(ctx, DEFAULT_LIMIT), units.length);
    const items = await residentialItems(units.slice(0, limit), { source: 'suumo', deal_kind: 'sale' }, ctx.req.query('detail') === '0' ? null : parseBuyDetail);

    return {
        title: `SUUMO 中古マンション (${pref}/${city})`,
        link: listUrl,
        language: 'ja',
        item: items,
    };
};

export const route: Route = {
    path: '/ms/chuko/:pref/:city',
    name: '中古マンション',
    url: 'suumo.jp',
    maintainers: ['pseudoyu'],
    handler,
    example: '/suumo/ms/chuko/tokyo/minato',
    parameters: {
        pref: {
            description: '都道府県 slug, e.g. `tokyo`, `kanagawa`',
        },
        city: {
            description: '市区町村 slug as SUUMO spells it after `sc_` in its area path — `minato` for `/ms/chuko/tokyo/sc_minato/`',
        },
    },
    description: `中古マンション for sale on SUUMO for one 市区町村，newest first (the page's own 新着・更新順).

Each property card of the list page is one item, carrying 物件名，販売価格，所在地，沿線・駅，専有面積，間取り，バルコニー and 築年月. Each unit's own page is then read once (cached per listing) for 管理費，修繕積立金，所在階，構造・階建，向き，総戸数，敷地の権利形態，用途地域，引渡可能時期 and the 情報提供日.

\`_extra\` follows the shared residential shape with \`deal_kind: 'sale'\` and \`price_jpy\` the asking price in yen. SUUMO publishes no 情報公開日，so \`listed_at\` stays \`null\` and \`updated_at\` carries the 情報提供日.

| Query    | Description                                                    | Default |
| -------- | -------------------------------------------------------------- | ------- |
| \`limit\`  | Units to return, at most one list page                         | 20      |
| \`detail\` | \`0\` skips the per-unit pages and returns list-page fields only | \`1\`     |`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['suumo.jp/ms/chuko/:pref/:city'],
            target: '/ms/chuko/:pref/:city',
        },
    ],
};
