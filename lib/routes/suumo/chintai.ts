import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';

import { residentialItems } from './residential';
import { areaSlug, checkSlugs, DEFAULT_LIMIT, HOST, parseChintaiDetail, parseChintaiList } from './utils';

export const handler = async (ctx): Promise<Data> => {
    const pref: string = ctx.req.param('pref');
    const city = areaSlug(ctx.req.param('city'));
    checkSlugs({ pref, city });
    // `po1=09` is the page's own 新着順; the default おすすめ順 puts sponsored listings first.
    const listUrl = `${HOST}/chintai/${pref}/sc_${city}/?po1=09`;
    const units = parseChintaiList(await ofetch<string>(listUrl));
    if (units.length === 0) {
        throw new Error(`suumo: no listing found on ${listUrl}; the area slug may be wrong or the page structure changed`);
    }
    const limit = Math.min(getRouteLimit(ctx, DEFAULT_LIMIT), units.length);
    const items = await residentialItems(units.slice(0, limit), { source: 'suumo', deal_kind: 'rent' }, ctx.req.query('detail') === '0' ? null : parseChintaiDetail);

    return {
        title: `SUUMO 賃貸 (${pref}/${city})`,
        link: listUrl,
        language: 'ja',
        item: items,
    };
};

export const route: Route = {
    path: '/chintai/:pref/:city',
    name: '賃貸物件',
    url: 'suumo.jp',
    maintainers: ['pseudoyu'],
    handler,
    example: '/suumo/chintai/tokyo/minato',
    parameters: {
        pref: {
            description: '都道府県 slug, e.g. `tokyo`, `kanagawa`',
        },
        city: {
            description: '市区町村 slug as SUUMO spells it after `sc_` in its area path — `minato` for `/chintai/tokyo/sc_minato/`',
        },
    },
    description: `賃貸 rooms on SUUMO for one 市区町村，newest first (the page's own 新着順).

Each room row of the list page is one item; the building's 種目，name, 所在地，交通 and 階建 are copied onto it. Each room's own page is then read once for what the list does not show — 築年月，構造，契約期間，保証会社，損保，取引態様，情報更新日 — and cached per listing, while the list's own values (賃料 and the rest) are read fresh on every poll.

\`_extra\` follows the shared residential shape: \`price_jpy\` is the monthly 賃料，\`deposit_jpy\` / \`key_money_jpy\` the 敷金 / 礼金 as SUUMO quotes them (in yen), and \`listed_at\` stays \`null\` because SUUMO publishes no 情報公開日 — \`updated_at\` carries its 情報更新日 instead.

| Query    | Description                                                    | Default |
| -------- | -------------------------------------------------------------- | ------- |
| \`limit\`  | Rooms to return, at most one list page                         | 20      |
| \`detail\` | \`0\` skips the per-room pages and returns list-page fields only | \`1\`     |`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['suumo.jp/chintai/:pref/:city'],
            target: '/chintai/:pref/:city',
        },
    ],
};
