import { load } from 'cheerio';

import type { ListingExtra } from '@/routes/temposmart/utils';
import { clean, normalizeFloor, parseArea, parseJpy, parseMonths, parseWalkMin, parseWard, summarize, tsuboUnit } from '@/routes/temposmart/utils';
import type { Data, DataItem, Route } from '@/types';
import { getPlaywrightPage } from '@/utils/playwright';

const HOST = 'https://www.athome.co.jp';
const SLUG = /^[a-z\d_-]+$/;
/** The SSR state is keyed by the internal BFF call that produced it. */
const LIST_KEY = '/bukken/list/first-view';
const STATE_TIMEOUT = 45000;

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
 * Waiting for that element is therefore both the readiness check and the interstitial check — if it never
 * attaches the route throws, so an unsettled page surfaces as an error rather than as an empty feed.
 */
const fetchState = async (url: string): Promise<string> => {
    const { page, destroy } = await getPlaywrightPage(url, { gotoConfig: { waitUntil: 'domcontentloaded' } });
    try {
        await page.waitForSelector('#serverApp-state', { state: 'attached', timeout: STATE_TIMEOUT });
        return await page.content();
    } catch (error) {
        throw new Error('athome: the listing page did not settle — it is probably still showing the 認証中 interstitial', { cause: error });
    } finally {
        // Release the browser as soon as the HTML is in hand; parsing happens outside it.
        await destroy();
    }
};

const listOf = (html: string): Bukken[] => {
    const raw = load(html)('#serverApp-state').text();
    if (!raw) {
        throw new Error('athome: #serverApp-state is missing from the settled page');
    }
    const state: Record<string, unknown> = JSON.parse(raw);
    const key = Object.keys(state).find((k) => k.includes(LIST_KEY));
    if (key === undefined) {
        throw new Error('athome: the SSR state holds no listing response; the internal API may have been renamed');
    }
    // The state keeps the whole HTTP response the SSR pass made (`G.text.…` keys), so unwrap three layers:
    // the response envelope, its `body` — held as text, not an object — and that payload's `data`.
    const envelope = state[key] as { body?: unknown } | null;
    const body = envelope?.body ?? envelope;
    const parsed = typeof body === 'string' ? JSON.parse(body) : body;
    const payload = (parsed as { data?: unknown } | null)?.data ?? parsed;
    const list = (payload as { bukkenData?: { bukkenList?: Bukken[] } } | null)?.bukkenData?.bukkenList;
    return Array.isArray(list) ? list : [];
};

/** '6階建 / 4階' → the occupied floor ('4階'); a value with no separator is taken as-is. */
const occupiedFloor = (kaidateKai: string | undefined): string | null => {
    const parts = (kaidateKai ?? '').split('/');
    return clean(parts.length > 1 ? parts.at(-1) : parts[0]);
};

const toItem = (b: Bukken): DataItem | null => {
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
        // 造作価格 is not published on this site.
        fixtures_transfer_jpy: null,
        // 店舗プラス carries the site's own classification, so it is read rather than guessed from prose.
        condition: b.tenpoPlus?.isInuki === '1' ? 'inuki' : b.tenpoPlus?.isSkeleton === '1' ? 'skeleton' : null,
        prev_business: raw.prev_tenant,
        heavy_food_ok: null,
        business_limit: null,
        // 情報公開日 lives on the detail page only, which this route does not open.
        listed_at: null,
        ward: parseWard(raw.location),
        address_hint: raw.location,
        tags: [],
        raw,
    };

    const link = `${HOST}/rent_store/${id}/`;
    return {
        title,
        link,
        guid: link,
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
    const listUrl = `${HOST}/rent_store/${pref}/${city}/list/`;

    const items = listOf(await fetchState(listUrl))
        .map((b) => toItem(b))
        .filter((i): i is DataItem => i !== null);

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
    description: `貸店舗 listings on アットホーム for one 市区町村 (first page, 30 listings).

This route needs a browser. The page is Angular Universal SSR sitting behind a JavaScript interstitial, so its first paint can be an 「認証中」 screen that clears itself once the browser finishes loading; only the settled page carries the \`#serverApp-state\` payload the route reads. The route waits for that element and **throws if it never appears**, so an unsettled page surfaces as an error rather than as a silently empty feed. Expect it to be slower and less reliable than the plain-HTML listing routes, and cache it generously.

\`_extra\` follows the shared listing shape. \`condition\` and \`prev_business\` come from the site's own 店舗プラス block (\`isInuki\` / \`isSkeleton\` / \`lastTenanto\`) rather than being guessed from prose, though most listings leave those unset. 造作価格 is not published here, so \`fixtures_transfer_jpy\` is always \`null\`, and \`deposit_months\` prefers 保証金 with 敷金 as the fallback. \`address_hint\` reaches the 丁目，and \`listed_at\` is \`null\` because 情報公開日 is published only on the detail page, which this route does not open.`,
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
