import { load } from 'cheerio';

import type { ListingExtra } from '@/routes/temposmart/utils';
import { clean, normalizeFloor, parseArea, parseHeavyFood, parseJpy, parseMonths, parseWalkMin, parseWard, parseYmd, summarize, tsuboUnit } from '@/routes/temposmart/utils';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

const HOST = 'https://www.athome.co.jp';
const SLUG = /^[a-z\d_-]+$/;
/** The SSR state is keyed by the internal BFF call that produced it. */
const LIST_KEY = '/bukken/list/first-view';
const DETAIL_KEY = '/bukken/detail/';
const STATE_TIMEOUT = 45000;
const DEFAULT_LIMIT = 10;
const PAGE_SIZE = 30;

/** Fields the list payload does not carry; all of them live on the detail page's own SSR payload. */
interface Detail {
    listed_at: string | null; // 情報公開日
    next_update: string | null; // 次回更新予定日
    lat: string | null;
    lng: string | null;
    location: string | null; // includes the 都道府県, unlike the list's value
    building: string | null; // 建物名 + 部屋番号
    notices: string[]; // 飲食店不可 etc.
    features: string[]; // 特徴 (19時以降も接客可, 駅徒歩５分以内, …)
    facilities: string[]; // 設備
    fixtures: string | null; // 造作譲渡
    built: string | null; // 築年月
    key_money_amortised: string | null; // 償却
    deposit_deduction: string | null; // 敷引
    other_lump_sum: string | null; // その他一時金
    fixed_term: boolean | null; // 定期借家
}

interface Bukken {
    id?: string | number;
    title?: string;
    tatemonoNm?: string;
    location?: string;
    type?: string;
    traffic?: Array<{ lineName?: string; stationName?: string; tohoJikan?: string }>;
    accessInfo?: Array<{ walkingTime?: string }>;
    contract?: { price?: string; managementFee?: string; deposit?: string; keyMoney?: string; guaranteeDeposit?: string };
    areaInfo?: { area?: string; tsubo?: string; unitPrice?: string };
    bukkenInfo?: { kaidateKai?: string; chikunengetsu?: string; construction?: string };
    /** 店舗プラス: the site's own 居抜き / スケルトン flags ('0' | '1') and previous tenant. */
    tenpoPlus?: { isInuki?: string; isSkeleton?: string; lastTenanto?: { name?: string; detail?: string } };
    mainImage?: { url?: string };
    recommendComment?: { comment?: string };
}

/**
 * The page is Angular Universal SSR behind a JS interstitial: the first paint can be an 「認証中」 screen that
 * clears itself once the browser finishes loading, and only the settled page carries `#serverApp-state`.
 * Waiting for that element is therefore both the readiness check and the interstitial check.
 *
 * The state keeps the whole HTTP response the SSR pass made (`G.text.…` keys), so the payload is three
 * layers down: the response envelope, its `body` — held as text, not an object — and that payload's `data`.
 */
const payloadOf = (html: string, keyPart: string): Record<string, unknown> | null => {
    const raw = load(html)('#serverApp-state').text();
    if (!raw) {
        throw new Error('athome: #serverApp-state is missing from the settled page');
    }
    const state: Record<string, unknown> = JSON.parse(raw);
    const key = Object.keys(state).find((k) => k.includes(keyPart));
    if (key === undefined) {
        return null;
    }
    const envelope = state[key] as { body?: unknown } | null;
    const body = envelope?.body ?? envelope;
    const parsed = typeof body === 'string' ? JSON.parse(body) : body;
    return ((parsed as { data?: unknown } | null)?.data ?? parsed) as Record<string, unknown> | null;
};

const listOf = (html: string): Bukken[] => {
    const payload = payloadOf(html, LIST_KEY);
    if (payload === null) {
        throw new Error('athome: the SSR state holds no listing response; the internal API may have been renamed');
    }
    const list = (payload as { bukkenData?: { bukkenList?: Bukken[] } }).bukkenData?.bukkenList;
    return Array.isArray(list) ? list : [];
};

interface PropertyData {
    kokaiDate?: string;
    kokaiKoshinDate?: string;
    ido?: string;
    keido?: string;
    location?: string;
    tatemonoHeyaNo?: string;
    notices?: Array<{ flagName?: string } | null>;
    tokutyou?: Array<{ name?: string } | null>;
    facility?: Array<{ items?: Array<{ flagName?: string } | null> } | null>;
    zosakuJoto?: string;
    shikibiki?: string;
    hoshokinShokyaku?: string;
    sonotaIchijikin?: string;
    teiki_shakka_fl?: boolean;
    bukkenInfo?: { chikunengetsu?: string };
}

/** The site writes 「－」 for "not stated", which must not survive as a value. */
const value = (text: string | undefined | null): string | null => {
    const s = clean(text);
    return s === null || /^[－ー—–-]+$/.test(s) ? null : s;
};

const names = (list: Array<{ flagName?: string; name?: string } | null> | undefined): string[] => (list ?? []).map((x) => clean(x?.flagName ?? x?.name)).filter((x): x is string => x !== null);

/** 情報公開日, the coordinates and the fee/feature detail exist only on the detail page's own SSR payload. */
const detailOf = (html: string): Detail => {
    const p = ((payloadOf(html, DETAIL_KEY) as { propertyData?: PropertyData } | null)?.propertyData ?? {}) as PropertyData;
    return {
        listed_at: value(p.kokaiDate),
        next_update: value(p.kokaiKoshinDate),
        lat: value(p.ido),
        lng: value(p.keido),
        location: value(p.location),
        building: value(p.tatemonoHeyaNo),
        notices: names(p.notices),
        // `tokutyou` is a sparse array: every possible 特徴 has a slot and the absent ones are null.
        features: names(p.tokutyou),
        facilities: (p.facility ?? []).flatMap((g) => names(g?.items)),
        fixtures: value(p.zosakuJoto),
        built: value(p.bukkenInfo?.chikunengetsu),
        key_money_amortised: value(p.hoshokinShokyaku),
        deposit_deduction: value(p.shikibiki),
        other_lump_sum: value(p.sonotaIchijikin),
        fixed_term: p.teiki_shakka_fl ?? null,
    };
};

/** '6階建 / 4階' → the occupied floor ('4階'); a value with no separator is taken as-is. */
const occupiedFloor = (kaidateKai: string | undefined): string | null => {
    const parts = (kaidateKai ?? '').split('/');
    return clean(parts.length > 1 ? parts.at(-1) : parts[0]);
};

const toItem = (b: Bukken, d: Detail | null): DataItem | null => {
    const id = b.id === undefined ? null : String(b.id);
    const title = clean(b.title) ?? clean(b.tatemonoNm);
    if (id === null || title === null) {
        return null;
    }
    const t = b.traffic?.[0];
    const rentJpy = parseJpy(clean(b.contract?.price));
    const { tsubo, area_m2 } = parseArea([clean(b.areaInfo?.area), clean(b.areaInfo?.tsubo)].filter(Boolean).join(' '));

    const raw: ListingExtra['raw'] = {
        location: clean(b.location),
        building: clean(b.tatemonoNm),
        price: clean(b.contract?.price),
        management_fee: clean(b.contract?.managementFee),
        deposit: clean(b.contract?.deposit),
        key_money: clean(b.contract?.keyMoney),
        guarantee_deposit: clean(b.contract?.guaranteeDeposit),
        area: clean(b.areaInfo?.area),
        tsubo: clean(b.areaInfo?.tsubo),
        unit_price: clean(b.areaInfo?.unitPrice),
        floors: clean(b.bukkenInfo?.kaidateKai),
        built: clean(b.bukkenInfo?.chikunengetsu),
        construction: clean(b.bukkenInfo?.construction),
        // tohoJikan is the bare number ('8'); accessInfo carries the same walk with its 分 unit.
        station: [clean(t?.lineName), clean(t?.stationName), clean(b.accessInfo?.[0]?.walkingTime)].filter(Boolean).join(' ') || null,
        comment: clean(b.recommendComment?.comment),
        prev_tenant: clean(b.tenpoPlus?.lastTenanto?.name),
        inuki: clean(b.tenpoPlus?.isInuki),
        skeleton: clean(b.tenpoPlus?.isSkeleton),
        type: clean(b.type),
        // Detail-page only; null when the detail fetch was skipped or failed.
        listed_at: d?.listed_at ?? null,
        next_update: d?.next_update ?? null,
        lat: d?.lat ?? null,
        lng: d?.lng ?? null,
        location_full: d?.location ?? null,
        building_room: d?.building ?? null,
        notices: d?.notices.join(' / ') || null,
        facilities: d?.facilities.join(' / ') || null,
        fixtures: d?.fixtures ?? null,
        deposit_deduction: d?.deposit_deduction ?? null,
        key_money_amortised: d?.key_money_amortised ?? null,
        other_lump_sum: d?.other_lump_sum ?? null,
        fixed_term: d?.fixed_term === null || d?.fixed_term === undefined ? null : String(d.fixed_term),
    };

    const extra: ListingExtra = {
        source: 'athome',
        listing_id: id,
        rent_jpy: rentJpy,
        tsubo,
        area_m2,
        tsubo_unit_jpy: parseJpy(raw.unit_price) ?? tsuboUnit(rentJpy, tsubo),
        floor: normalizeFloor(occupiedFloor(b.bukkenInfo?.kaidateKai)?.replaceAll('地下', 'B') ?? null),
        station: clean(t?.stationName)?.replace(/駅$/, '') ?? null,
        line: clean(t?.lineName),
        walk_min: parseWalkMin(raw.station),
        // 保証金 is the closer analogue of the other sources' deposit; 敷金 stands in when it is absent.
        deposit_months: parseMonths(raw.guarantee_deposit) ?? parseMonths(raw.deposit),
        deposit_jpy: null,
        key_money_months: parseMonths(raw.key_money),
        fixtures_transfer_jpy: parseJpy(raw.fixtures),
        // 店舗プラス carries the site's own classification, so it is read rather than guessed from prose.
        condition: b.tenpoPlus?.isInuki === '1' ? 'inuki' : b.tenpoPlus?.isSkeleton === '1' ? 'skeleton' : null,
        prev_business: raw.prev_tenant,
        // 「飲食店不可」 is published as a notice flag, so it is read rather than inferred.
        heavy_food_ok: d?.notices.includes('飲食店不可') ? false : parseHeavyFood(raw.notices),
        business_limit: raw.notices,
        listed_at: parseYmd(raw.listed_at),
        ward: parseWard(raw.location_full ?? raw.location),
        // The detail page spells the address with its 都道府県; the list omits it.
        address_hint: raw.location_full ?? raw.location,
        tags: d?.features ?? [],
        raw,
    };

    const link = `${HOST}/rent_store/${id}/`;
    return {
        title,
        link,
        guid: link,
        pubDate: extra.listed_at === null ? undefined : timezone(parseDate(extra.listed_at, 'YYYY-MM-DD'), 9),
        description: [raw.comment, summarize(extra)].filter(Boolean).join(' / '),
        image: b.mainImage?.url ? new URL(b.mainImage.url, HOST).href : undefined,
        _extra: extra,
    };
};

export const handler = async (ctx): Promise<Data> => {
    const pref: string = ctx.req.param('pref');
    const city: string = ctx.req.param('city');
    const slugs = Object.entries({ pref, city });
    for (const [name, v] of slugs) {
        if (!SLUG.test(v)) {
            throw new Error(`Invalid ${name} "${v}", expected a lowercase site slug such as tokyo / shinjuku-city / yokohama_naka-city`);
        }
    }
    const limit = Math.min(ctx.req.query('limit') ? Number(ctx.req.query('limit')) : DEFAULT_LIMIT, PAGE_SIZE);
    const listUrl = `${HOST}/rent_store/${pref}/${city}/list/`;

    // One browser for the whole run: the list page, then each detail page by navigating the same tab.
    // Opening a browser per listing would be an order of magnitude more expensive.
    const { page, destroy } = await getPlaywrightPage(listUrl, { gotoConfig: { waitUntil: 'domcontentloaded' } });
    const items: DataItem[] = [];
    try {
        await page.waitForSelector('#serverApp-state', { state: 'attached', timeout: STATE_TIMEOUT });
        const bukken = listOf(await page.content()).slice(0, limit);

        for (const b of bukken) {
            const link = `${HOST}/rent_store/${b.id}/`;
            // Cached per listing, so a monitoring poll only pays for listings it has not seen before.
            // eslint-disable-next-line no-await-in-loop -- one shared tab, so the detail pages must be visited in turn
            const detail = (await cache.tryGet(`athome:detail:${b.id}`, async () => {
                await page.goto(link, { waitUntil: 'domcontentloaded' });
                await page.waitForSelector('#serverApp-state', { state: 'attached', timeout: STATE_TIMEOUT });
                return detailOf(await page.content());
            })) as Detail | null;
            const item = toItem(b, detail);
            if (item !== null) {
                items.push(item);
            }
        }
    } catch (error) {
        logger.warn(`athome: ${listUrl} failed: ${String(error)}`);
        throw new Error('athome: the listing page did not settle — it is probably still showing the 認証中 interstitial', { cause: error });
    } finally {
        await destroy();
    }

    // The site's default order is not chronological, so the feed is sorted by 情報公開日 itself, newest first.
    items.sort((a, b) => ((b._extra as ListingExtra).listed_at ?? '').localeCompare((a._extra as ListingExtra).listed_at ?? ''));

    return {
        title: `アットホーム 貸店舗 (${city})`,
        link: listUrl,
        language: 'ja',
        item: items,
    };
};

export const route: Route = {
    path: '/rent-store/:pref/:city',
    name: '貸店舗',
    url: 'www.athome.co.jp',
    maintainers: ['pseudoyu'],
    handler,
    example: '/athome/rent-store/tokyo/shinjuku-city',
    parameters: {
        pref: {
            description: '都道府県 slug, e.g. `tokyo`, `kanagawa`',
        },
        city: {
            description: '市区町村 slug as the site spells it — `shinjuku-city`, `minato-city`, `yokohama_naka-city`. Note the underscore in 政令指定都市 slugs; a hyphen there 404s.',
        },
    },
    description: `貸店舗 listings on アットホーム for one 市区町村，newest first.

This route needs a browser. The page is Angular Universal SSR sitting behind a JavaScript interstitial, so its first paint can be an 「認証中」 screen that clears itself once the browser finishes loading; only the settled page carries the \`#serverApp-state\` payload the route reads. The route waits for that element and **throws if it never appears**, so an unsettled page surfaces as an error rather than as a silently empty feed. Expect it to be slower and less reliable than the plain-HTML listing routes, and cache it generously.

情報公開日，the coordinates and the fee detail exist only on each listing's own page, so the route visits them — reusing one browser tab rather than opening a browser per listing, and caching per listing so a repeated poll only pays for listings it has not seen before. That is why \`limit\` defaults to 10 rather than the full page of 30.

**The site's own ordering is not chronological**, so the feed is re-sorted by 情報公開日，newest first. Without that a newly published listing could sit well down the list and never reach a monitor watching the first page.

\`_extra\` follows the shared listing shape: \`listed_at\` and \`pubDate\` from 情報公開日，\`heavy_food_ok\` and \`business_limit\` from the published notice flags (「飲食店不可」 etc.), \`fixtures_transfer_jpy\` from 造作譲渡，\`tags\` from the site's 特徴 list, and \`condition\` / \`prev_business\` from the 店舗プラス block (\`isInuki\` / \`isSkeleton\` / \`lastTenanto\`) rather than guessed from prose — though most listings leave those two unset. \`deposit_months\` prefers 保証金 and falls back to 敷金.

\`raw\` additionally carries what the shared contract has no field for: \`lat\` / \`lng\`, the full 所在地 including its 都道府県，建物名 + 部屋番号，設備，築年月，敷引，償却，その他一時金 and the 定期借家 flag.

| Query   | Description                                               | Default |
| ------- | --------------------------------------------------------- | ------- |
| \`limit\` | Listings to enrich (one detail page each, cached), max 30 | 10      |`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportRadar: true,
    },
    radar: [
        {
            source: ['www.athome.co.jp/rent_store/:pref/:city/list'],
            target: '/rent-store/:pref/:city',
        },
    ],
};
