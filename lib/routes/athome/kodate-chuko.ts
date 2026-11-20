import { residentialItems } from '@/routes/suumo/residential';
import type { Data, Route } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';

import { athomeListUrl, checkSlugs, DEFAULT_LIMIT, fetchAthomeList, parseAthomeBuy, stateOf } from './residential-utils';

export const handler = async (ctx): Promise<Data> => {
    const pref: string = ctx.req.param('pref');
    const city: string = ctx.req.param('city');
    checkSlugs({ pref, city });
    const listUrl = athomeListUrl('kodate/chuko', pref, city);
    const units = parseAthomeBuy(stateOf(await fetchAthomeList(listUrl)), '中古一戸建て');
    if (units.length === 0) {
        throw new Error(`athome: no listing found on ${listUrl}; the area slug may be wrong or the page structure changed`);
    }
    const limit = Math.min(getRouteLimit(ctx, DEFAULT_LIMIT), units.length);
    const items = await residentialItems(units.slice(0, limit), { source: 'athome', deal_kind: 'sale' }, null);

    return {
        title: `アットホーム 中古一戸建て (${pref}/${city})`,
        link: listUrl,
        language: 'ja',
        item: items,
    };
};

export const route: Route = {
    path: '/kodate/chuko/:pref/:city',
    name: '中古一戸建て',
    url: 'www.athome.co.jp',
    maintainers: ['pseudoyu'],
    handler,
    example: '/athome/kodate/chuko/tokyo/setagaya-city',
    parameters: {
        pref: {
            description: '都道府県 slug, e.g. `tokyo`, `kanagawa`',
        },
        city: {
            description: '市区町村 slug as the site spells it — `setagaya-city`, `yokohama_naka-city`. Note the underscore in 政令指定都市 slugs.',
        },
    },
    description: `中古一戸建て for sale on アットホーム for one 市区町村，newest first (the page's own 新着順).

Every field comes from the list page's own SSR state, read in a browser like the 貸店舗，賃貸 and 中古マンション routes; the per-house pages are not visited. Each house carries 価格，間取り，建物面積，土地面積，階建，築年月，構造，所在地，交通，土地権利，建ぺい率 and 容積率.

\`_extra\` follows the shared residential shape with \`deal_kind: 'sale'\`: \`area_m2\` is the 建物面積 and \`land_area_m2\` the 土地面積. A house whose 種目 reads more precisely than the page (中古テラスハウス，リフォーム・リノベーション) keeps that label in \`raw.syumoku\` and as a tag. The 情報公開日 is only on the house's own page and stays \`null\`.

| Query   | Description                             | Default |
| ------- | --------------------------------------- | ------- |
| \`limit\` | Houses to return, at most one list page | 20      |`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.athome.co.jp/kodate/chuko/:pref/:city/list'],
            target: '/kodate/chuko/:pref/:city',
        },
    ],
};
