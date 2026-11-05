import { FetchError } from 'ofetch';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import { residentialItems } from '@/routes/suumo/residential';
import type { Data, Route } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';

import { checkSlugs, DEFAULT_LIMIT, DETAIL_BUDGET, HOMES_RENT_DETAIL_SCOPE, homesFetcher, HOST, parseHomesChintaiList, parseHomesDetail } from './utils';

export const handler = async (ctx): Promise<Data> => {
    const pref: string = ctx.req.param('pref');
    const city: string = ctx.req.param('city');
    checkSlugs({ pref, city });
    // A path segment, not a query: the route cache keys on the path, so `?page=2` would be served page 1.
    const page: string = ctx.req.param('page') ?? '1';
    if (!/^[1-9]\d*$/.test(page)) {
        throw new InvalidParameterError(`page must be a whole number from 1, not "${page}"`);
    }
    // `cond[sortby]=newdate` is the page's own 新着順; the default おすすめ順 mixes in older rooms.
    // Later pages keep it, so pages 1, 2, 3 follow on from each other.
    const listUrl = `${HOST}/chintai/${pref}/${city}/list/?cond%5Bsortby%5D=newdate${page === '1' ? '' : `&page=${page}`}`;
    const fetchPage = homesFetcher();
    let html: string;
    try {
        html = await fetchPage(listUrl);
    } catch (error) {
        // The site answers a page past the last with 404 or 422 (港区 page 999 and page 9999 on
        // 2026-11-01); that page simply has no room. Page 1 has no such excuse.
        if (page === '1' || !(error instanceof FetchError) || (error.status !== 404 && error.status !== 422)) {
            throw error;
        }
        html = '';
    }
    const units = parseHomesChintaiList(html);
    // Only an empty first page means a wrong slug.
    if (units.length === 0 && page === '1') {
        throw new Error(`homes: no listing found on ${listUrl}; the area slug may be wrong or the page structure changed`);
    }
    const limit = Math.min(getRouteLimit(ctx, DEFAULT_LIMIT), units.length);
    const items = await residentialItems(units.slice(0, limit), { source: 'homes', deal_kind: 'rent' }, ctx.req.query('detail') === '0' ? null : (html) => parseHomesDetail(html, HOMES_RENT_DETAIL_SCOPE), fetchPage, {
        maxFetches: DETAIL_BUDGET,
    });

    return {
        title: `LIFULL HOME'S 賃貸 (${pref}/${city})`,
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
    url: 'www.homes.co.jp',
    maintainers: ['pseudoyu'],
    handler,
    example: '/homes/chintai/tokyo/minato-city',
    parameters: {
        pref: {
            description: '都道府県 slug, e.g. `tokyo`, `kanagawa`',
        },
        city: {
            description: "市区町村 slug as LIFULL HOME'S spells it — `minato-city` for `/chintai/tokyo/minato-city/list/`",
        },
        page: {
            description: 'List page to read, from 1, in the same 新着順; a page past the last returns no item',
            default: '1',
        },
    },
    description: `賃貸 rooms on LIFULL HOME'S for one 市区町村，newest first (the page's own 新着順).

Each room row of a building block is one item; the building's 種目，name, 所在地，交通 and 階数 are copied onto it, and the row adds 階，部屋番号 where the site prints one, 賃料，管理費等，敷金 / 礼金 / 保証金 / 敷引・償却，間取り，専有面積 and the 定期借家 badge. The sponsored rows at the top of the page are not read. Each room's own page is then read once (cached per listing) for 築年月，構造，総戸数，現況，入居可能時期，契約期間，更新料，保証会社 and the 情報公開日 / 情報更新日.

\`_extra\` follows the shared residential shape. LIFULL HOME'S quotes 敷金 / 礼金 either in months or in yen, and each lands in its own field (\`deposit_months\` or \`deposit_jpy\`), never converted. \`listed_at\` is the 情報公開日.

The site sits behind AWS WAF, which starts answering a client with an empty challenge page after only a few requests: measured on 2026-10-31 at about fifteen in an hour and again at about eight in ten minutes, from one address, and lifted within the hour. The route reports that as an error naming the challenge rather than as an empty feed, and does not try to get past it. To stay under that, one poll requests at most five detail pages it has not cached yet, and stops requesting altogether once the site has challenged it; items past that keep their list fields until a later poll fills them in. A challenged list page fails the feed. Poll each area infrequently and not several areas at once, and pass \`detail=0\` to make one request per poll instead of one per item.

| Query    | Description                                                    | Default |
| -------- | -------------------------------------------------------------- | ------- |
| \`limit\`  | Rooms to return, at most one list page                         | 20      |
| \`detail\` | \`0\` skips the per-room pages and returns list-page fields only | \`1\`     |`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.homes.co.jp/chintai/:pref/:city/list'],
            target: '/chintai/:pref/:city',
        },
    ],
};
