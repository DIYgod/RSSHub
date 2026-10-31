import { residentialItems } from '@/routes/suumo/residential';
import type { Data, Route } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';

import { athomeListUrl, checkSlugs, DEFAULT_LIMIT, fetchAthomeList, parseAthomeBuy, stateOf } from './residential-utils';

export const handler = async (ctx): Promise<Data> => {
    const pref: string = ctx.req.param('pref');
    const city: string = ctx.req.param('city');
    checkSlugs({ pref, city });
    const listUrl = athomeListUrl('mansion/chuko', pref, city);
    const units = parseAthomeBuy(stateOf(await fetchAthomeList(listUrl)), '中古マンション');
    if (units.length === 0) {
        throw new Error(`athome: no listing found on ${listUrl}; the area slug may be wrong or the page structure changed`);
    }
    const limit = Math.min(getRouteLimit(ctx, DEFAULT_LIMIT), units.length);
    const items = await residentialItems(units.slice(0, limit), { source: 'athome', deal_kind: 'sale' }, null);

    return {
        title: `アットホーム 中古マンション (${city})`,
        link: listUrl,
        language: 'ja',
        item: items,
    };
};

export const route: Route = {
    path: '/mansion/chuko/:pref/:city',
    name: '中古マンション',
    url: 'www.athome.co.jp',
    maintainers: ['pseudoyu'],
    handler,
    example: '/athome/mansion/chuko/tokyo/minato-city',
    parameters: {
        pref: {
            description: '都道府県 slug, e.g. `tokyo`, `kanagawa`',
        },
        city: {
            description: '市区町村 slug as the site spells it — `minato-city`, `yokohama_naka-city`. Note the underscore in 政令指定都市 slugs.',
        },
    },
    description: `中古マンション for sale on アットホーム for one 市区町村，newest first (the page's own 新着順).

Every field comes from the list page's own SSR state, read in a browser like the 貸店舗 and 賃貸 routes; the per-unit pages are not visited. Each unit carries its building name and 部屋番号 (split from the site's title), 価格，間取り，専有面積，所在階 / 階建，築年月，構造，所在地，交通 and 土地権利，plus what the site publishes for investors: \`raw.yield\` (表面利回り) and an オーナーチェンジ tag when the unit is sold with a tenant in it.

\`_extra\` follows the shared residential shape with \`deal_kind: 'sale'\`. The building plot (\`tochiMs\`) is the whole building's 敷地面積 and is kept in \`raw.site_area\`, never in \`land_area_m2\`. A unit whose 種目 reads 「リフォーム・リノベーション」 keeps that label in \`raw.syumoku\` and as a tag. 管理費，修繕積立金 and the 情報公開日 are only on the unit's own page and stay \`null\`.

| Query   | Description                            | Default |
| ------- | -------------------------------------- | ------- |
| \`limit\` | Units to return, at most one list page | 20      |`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.athome.co.jp/mansion/chuko/:pref/:city/list'],
            target: '/mansion/chuko/:pref/:city',
        },
    ],
};
