import { load } from 'cheerio';

import type { ListingExtra } from '@/routes/temposmart/utils';
import { clean, normalizeFloor, parseArea, parseJpy, parseWalkMin, parseWard, parseYmd, summarize, tsuboUnit } from '@/routes/temposmart/utils';
import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const HOST = 'https://www.inshokuten.com';

/** Region is the first path segment; the 首都圏 sub-areas are an extra `local-*` segment after `list/`. */
const AREAS = [
    { slug: 'kanto', label: '首都圏', path: 'kanto/bukkens/list' },
    { slug: '23ward', label: '東京23区', path: 'kanto/bukkens/list/local-23ward' },
    { slug: '23ward_out', label: '東京都下', path: 'kanto/bukkens/list/local-23ward_out' },
    { slug: 'yokohama_kawasaki', label: '神奈川', path: 'kanto/bukkens/list/local-yokohama_kawasaki' },
    { slug: 'chiba', label: '千葉', path: 'kanto/bukkens/list/local-chiba' },
    { slug: 'saitama', label: '埼玉', path: 'kanto/bukkens/list/local-saitama' },
    { slug: 'kansai', label: '関西', path: 'kansai/bukkens/list' },
    { slug: 'tokai', label: '東海', path: 'tokai/bukkens/list' },
    { slug: 'kyushu', label: '九州', path: 'kyushu/bukkens/list' },
];

/** The list h1 reads '【9月最新】新宿区の店舗物件…', so the area name is what precedes 「の店舗物件」 once the 【…】 badge is dropped. */
const areaLabel = (html: string, fallback: string): string => {
    const h1 = clean(load(html)('h1').first().text())?.replace(/^【[^】]*】/, '');
    const name = h1?.split('の店舗物件', 1)[0];
    return name !== undefined && name !== h1 ? name : fallback;
};

/**
 * List page cards (`a.bukkenItem`, 20 per page, server-rendered):
 *   title .bukkenItem__title, id input.js-bukkenKeyId, rows table.bukkenItem__detailTable th → td:
 *   賃料／坪単価 '60万円／28,749円', 階数／面積 '地上2階／20.87坪(69.0m2)', 最寄り駅 '東京メトロ南北線 六本木一丁目 徒歩 3分',
 *   所在地 '港区六本木4', 前テナント／希望譲渡額 'コンカフェ／0万円' | '喫茶店／相談' | '飲食店／',
 *   現況 .bukkenItem__inukiIcon--inuki | --skeleton, 出店可能業態 .bukkenItem__openableBusinessTypeCategory,
 *   登録日 '登録日：2026-09-13', tags .bukkenItem__newIcon / .bukkenItem__restaurantNotOpenableIcon
 * 保証金 / 礼金 are members-only on the detail page, so no detail page is fetched.
 */
const parseList = (html: string): DataItem[] => {
    const $ = load(html);
    return $('a.bukkenItem')
        .toArray()
        .map((el): DataItem | null => {
            const $el = $(el);
            const href = $el.attr('href');
            const title = clean($el.find('.bukkenItem__title').text());
            const id = $el.find('input.js-bukkenKeyId').attr('value') ?? href?.match(/\/bukkens\/(\d+)/)?.[1];
            if (!href || !title || !id) {
                return null;
            }
            const cell = (label: string): string | null => clean($el.find(`th:contains("${label}")`).first().next('td').text());

            const raw: ListingExtra['raw'] = {
                rent: cell('賃料／坪単価'),
                floor_area: cell('階数／面積'),
                station: cell('最寄り駅'),
                address: cell('所在地'),
                transfer: cell('希望譲渡額'),
                business_types: clean(
                    $el
                        .find('.bukkenItem__openableBusinessTypeCategory')
                        .toArray()
                        .map((t) => clean($(t).text()))
                        .filter(Boolean)
                        .join(', ')
                ),
                listed_at: clean($el.find('div:contains("登録日：")').last().text())?.replace(/^登録日[:：]\s*/, '') ?? null,
                comment: clean($el.find('.bukkenItem__shortComment').text()),
            };

            const [rentText, tsuboUnitText] = (raw.rent ?? '').split('／', 2);
            const [floorText, areaText] = (raw.floor_area ?? '').split('／', 2);
            const [prevBusiness, fixturesText] = (raw.transfer ?? '').split('／', 2);
            // '東京メトロ南北線 六本木一丁目 徒歩 3分' → line, station (whitespace already collapsed by clean)
            const stationParts = raw.station?.split(' ') ?? [];
            const walkIndex = stationParts.findIndex((p) => p.startsWith('徒歩'));
            const notOpenable = $el.find('.bukkenItem__restaurantNotOpenableIcon').length > 0;
            const tags = [$el.find('.bukkenItem__newIcon').length > 0 ? 'NEW' : null, notOpenable ? '飲食店不可' : null].filter((t): t is string => t !== null);

            const rentJpy = parseJpy(clean(rentText));
            const { tsubo, area_m2 } = parseArea(clean(areaText));
            const extra: ListingExtra = {
                source: 'inshokuten',
                listing_id: id,
                rent_jpy: rentJpy,
                tsubo,
                area_m2,
                tsubo_unit_jpy: parseJpy(clean(tsuboUnitText)) ?? tsuboUnit(rentJpy, tsubo),
                floor: normalizeFloor(clean(floorText)?.replaceAll('地下', 'B').replaceAll('地上', '') ?? null),
                station: walkIndex > 1 ? stationParts.slice(1, walkIndex).join(' ') : null,
                line: walkIndex > 1 ? stationParts[0] : null,
                walk_min: parseWalkMin(raw.station),
                deposit_months: null,
                deposit_jpy: null,
                key_money_months: null,
                fixtures_transfer_jpy: parseJpy(clean(fixturesText)),
                condition: $el.find('.bukkenItem__inukiIcon--inuki').length > 0 ? 'inuki' : $el.find('.bukkenItem__inukiIcon--skeleton').length > 0 ? 'skeleton' : null,
                prev_business: clean(prevBusiness),
                heavy_food_ok: notOpenable ? false : raw.business_types === null ? null : raw.business_types.includes('重飲食'),
                business_limit: notOpenable ? '飲食店不可' : raw.business_types,
                listed_at: parseYmd(raw.listed_at),
                ward: parseWard(raw.address),
                address_hint: raw.address,
                tags,
                raw,
            };
            const link = new URL(href, HOST).href;
            const image = $el.find('img.bukkenItem__picture').attr('src');
            return {
                title,
                link,
                guid: link,
                pubDate: extra.listed_at === null ? undefined : timezone(parseDate(extra.listed_at, 'YYYY-MM-DD'), 9),
                description: [raw.comment, summarize(extra)].filter(Boolean).join(' / '),
                image: image && !image.includes('no_image') ? image : undefined,
                _extra: extra,
            };
        })
        .filter((item): item is DataItem => item !== null);
};

export const handler = async (ctx): Promise<Data> => {
    const slug: string = ctx.req.param('area') ?? 'kanto';
    const area = AREAS.find((a) => a.slug === slug);
    if (!area) {
        throw new Error(`Unknown area "${slug}", expected one of ${AREAS.map((a) => a.slug).join(', ')}`);
    }
    // 区市 ids are the site's own numbering, not JIS codes, and exist only under the `local-*` sub-areas.
    // The site 404s an unknown id or a region on a region-less area, so a wrong value fails loudly rather
    // than quietly returning the parent area's listings.
    const region: string | undefined = ctx.req.param('region');
    if (region !== undefined) {
        if (!/^\d+$/.test(region)) {
            throw new Error(`Invalid region "${region}", expected 飲食店.COM's numeric 区市 id such as 7 (新宿区)`);
        }
        if (!area.path.includes('local-')) {
            throw new Error(
                `Area "${slug}" has no 区市 breakdown; region is only valid for ${AREAS.filter((a) => a.path.includes('local-'))
                    .map((a) => a.slug)
                    .join(', ')}`
            );
        }
    }
    const listUrl = `${HOST}/bukken/${area.path}${region === undefined ? '' : `/region-${region}`}/?mode=latest`;

    const html: string = await ofetch(listUrl);
    return {
        title: `飲食店.COM 新着物件 (${areaLabel(html, area.label)})`,
        link: listUrl,
        language: 'ja',
        item: parseList(html),
    };
};

export const route: Route = {
    path: '/bukken/:area?/:region?',
    name: '新着物件',
    url: 'www.inshokuten.com',
    maintainers: ['pseudoyu'],
    handler,
    example: '/inshokuten/bukken/23ward',
    parameters: {
        area: {
            description: 'Region or 首都圏 sub-area',
            default: 'kanto',
            options: AREAS.map((a) => ({ value: a.slug, label: a.label })),
        },
        region: {
            description:
                "Optional 区市, as 飲食店.COM's own numeric id — **not** a JIS code (新宿区 `7`, 港区 `4`, 横浜市中区 `63`). Only valid for the `local-*` sub-areas (`23ward`, `23ward_out`, `yokohama_kawasaki`, `chiba`, `saitama`); omit for the whole area.",
        },
    },
    description: `New restaurant-property listings on 飲食店.COM sorted by 登録日 (first page, 20 listings) — for a whole area, or for one 区市 when \`region\` is given. Each item's \`_extra\` carries the structured listing fields (賃料，坪，坪単価，階，最寄駅，造作譲渡料，現況，前業態，出店可能業態，登録日，…); unknown values are \`null\`. 保証金 and 礼金 are members-only on the site and therefore always \`null\`.

\`region\` is 飲食店.COM's own numeric 区市 id, **not** a JIS code, and applies only to the \`local-*\` sub-areas — \`/inshokuten/bukken/23ward/7\` is 新宿区 and \`/inshokuten/bukken/yokohama_kawasaki/63\` is 横浜市中区。東京 23 区 runs 1–23 and 横浜・川崎 runs 51–72; the site answers an unknown id with a 404, so a wrong value fails loudly instead of silently returning the parent area.`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.inshokuten.com/bukken/:region/bukkens/list', 'www.inshokuten.com/bukken/:region/bukkens/list/local-:area'],
            target: (params) => `/bukken/${params.area ?? params.region}`,
        },
    ],
};
