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
    const listUrl = `${HOST}/chukoikkodate/${pref}/sc_${city}/?po=1&pj=2`;
    const units = parseBuyList(await ofetch<string>(listUrl), '中古一戸建て');
    if (units.length === 0) {
        throw new Error(`suumo: no listing found on ${listUrl}; the area slug may be wrong or the page structure changed`);
    }
    const limit = Math.min(getRouteLimit(ctx, DEFAULT_LIMIT), units.length);
    const items = await residentialItems(units.slice(0, limit), { source: 'suumo', deal_kind: 'sale' }, ctx.req.query('detail') === '0' ? null : parseBuyDetail);

    return {
        title: `SUUMO 中古一戸建て (${pref}/${city})`,
        link: listUrl,
        language: 'ja',
        item: items,
    };
};

export const route: Route = {
    path: '/chukoikkodate/:pref/:city',
    name: '中古一戸建て',
    url: 'suumo.jp',
    maintainers: ['pseudoyu'],
    handler,
    example: '/suumo/chukoikkodate/tokyo/setagaya',
    parameters: {
        pref: {
            description: '都道府県 slug, e.g. `tokyo`, `kanagawa`',
        },
        city: {
            description: '市区町村 slug as SUUMO spells it after `sc_` in its area path — `setagaya` for `/chukoikkodate/tokyo/sc_setagaya/`',
        },
    },
    description: `中古一戸建て for sale on SUUMO for one 市区町村，newest first (the page's own 新着・更新順).

Each property card of the list page is one item, carrying 物件名，販売価格，所在地，沿線・駅，土地面積，建物面積，間取り and 築年月. Each house's own page is then read once (cached per listing) for 構造・工法，土地の権利形態，私道負担・道路，建ぺい率・容積率，引渡可能時期 and the 情報提供日.

\`_extra\` follows the shared residential shape with \`deal_kind: 'sale'\`: \`area_m2\` is the 建物面積 and \`land_area_m2\` the 土地面積. SUUMO publishes no 情報公開日，so \`listed_at\` stays \`null\` and \`updated_at\` carries the 情報提供日.

| Query    | Description                                                     | Default |
| -------- | --------------------------------------------------------------- | ------- |
| \`limit\`  | Houses to return, at most one list page                         | 20      |
| \`detail\` | \`0\` skips the per-house pages and returns list-page fields only | \`1\`     |`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['suumo.jp/chukoikkodate/:pref/:city'],
            target: '/chukoikkodate/:pref/:city',
        },
    ],
};
