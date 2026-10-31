import { residentialItems } from '@/routes/suumo/residential';
import type { Data, Route } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';

import { athomeListUrl, checkSlugs, DEFAULT_LIMIT, fetchAthomeList, parseAthomeChintai, stateOf } from './residential-utils';

export const handler = async (ctx): Promise<Data> => {
    const pref: string = ctx.req.param('pref');
    const city: string = ctx.req.param('city');
    checkSlugs({ pref, city });
    const listUrl = athomeListUrl('chintai', pref, city);
    const units = parseAthomeChintai(stateOf(await fetchAthomeList(listUrl)));
    if (units.length === 0) {
        throw new Error(`athome: no listing found on ${listUrl}; the area slug may be wrong or the page structure changed`);
    }
    const limit = Math.min(getRouteLimit(ctx, DEFAULT_LIMIT), units.length);
    const items = await residentialItems(units.slice(0, limit), { source: 'athome', deal_kind: 'rent' }, null);

    return {
        title: `アットホーム 賃貸 (${pref}/${city})`,
        link: listUrl,
        language: 'ja',
        item: items,
    };
};

export const route: Route = {
    path: '/chintai/:pref/:city',
    name: '賃貸物件',
    url: 'www.athome.co.jp',
    maintainers: ['pseudoyu'],
    handler,
    example: '/athome/chintai/tokyo/minato-city',
    parameters: {
        pref: {
            description: '都道府県 slug, e.g. `tokyo`, `kanagawa`',
        },
        city: {
            description: '市区町村 slug as the site spells it — `minato-city`, `yokohama_naka-city`. Note the underscore in 政令指定都市 slugs.',
        },
    },
    description: `賃貸 rooms on アットホーム for one 市区町村，newest first (the page's own 新着順).

Every field comes from the list page's own SSR state, read in a browser like the 貸店舗 route (the page sits behind a self-clearing JavaScript interstitial, and a plain HTTP client is refused after a handful of requests). Each room is one item, with the building's 種目，name, 所在地，交通，階建 and 築年月 copied on and the room's 階，部屋番号 (where the site prints one), 賃料，管理費，敷金，礼金，間取り and 専有面積. The per-room pages are not visited: one browser navigation per room is what gets a client refused.

\`_extra\` follows the shared residential shape. \`address\` is printed by the site from the 区 on, without the 都道府県. \`raw.same_room_ids\` is the site's own list of listings of the same room by other agents, useful for deduplication. \`listed_at\` stays \`null\`: the 情報公開日 is only on the room's own page.

| Query   | Description                            | Default |
| ------- | -------------------------------------- | ------- |
| \`limit\` | Rooms to return, at most one list page | 20      |`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.athome.co.jp/chintai/:pref/:city/list'],
            target: '/chintai/:pref/:city',
        },
    ],
};
