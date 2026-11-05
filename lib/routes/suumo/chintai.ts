import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';

import { residentialItems } from './residential';
import { areaSlug, checkSlugs, DEFAULT_LIMIT, HOST, parseChintaiDetail, parseChintaiList } from './utils';

export const handler = async (ctx): Promise<Data> => {
    const pref: string = ctx.req.param('pref');
    const city = areaSlug(ctx.req.param('city'));
    checkSlugs({ pref, city });
    // A path segment, not a query: the route cache keys on the path, so `?page=2` would be served page 1.
    const page: string = ctx.req.param('page') ?? '1';
    if (!/^[1-9]\d*$/.test(page)) {
        throw new InvalidParameterError(`page must be a whole number from 1, not "${page}"`);
    }
    // `po1=09` is the page's own 新着順; the default おすすめ順 puts sponsored listings first. Later
    // pages keep it, so pages 1, 2, 3 follow on from each other.
    const listUrl = `${HOST}/chintai/${pref}/sc_${city}/?po1=09${page === '1' ? '' : `&page=${page}`}`;
    const units = parseChintaiList(await ofetch<string>(listUrl));
    // A page past the last is served as a page with no room; only an empty first page means a wrong slug.
    if (units.length === 0 && page === '1') {
        throw new Error(`suumo: no listing found on ${listUrl}; the area slug may be wrong or the page structure changed`);
    }
    const limit = Math.min(getRouteLimit(ctx, DEFAULT_LIMIT), units.length);
    const items = await residentialItems(units.slice(0, limit), { source: 'suumo', deal_kind: 'rent' }, ctx.req.query('detail') === '0' ? null : parseChintaiDetail);

    return {
        title: `SUUMO 賃貸 (${pref}/${city})`,
        link: listUrl,
        language: 'ja',
        item: items,
        // An empty page 1 has already failed above; only a page past the last gets here empty.
        allowEmpty: true,
    };
};

export const route: Route = {
    path: '/chintai/:pref/:city/:page?',
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
        page: {
            description: 'List page to read, from 1, in the same 新着順; a page past the last returns no item',
            default: '1',
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
