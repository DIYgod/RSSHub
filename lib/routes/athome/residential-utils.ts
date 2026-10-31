/**
 * アットホーム 賃貸 / 売買 (residential) list pages. Like 貸店舗 they are Angular Universal SSR behind
 * a self-clearing JavaScript interstitial, so they are rendered in a browser and read from the
 * settled page's `#serverApp-state`; the per-unit pages are not visited (one browser navigation per
 * unit is what gets a client refused, measured 2026-09-19).
 */
import { load } from 'cheerio';

import type { ListedUnit } from '@/routes/suumo/residential';
import { clean } from '@/routes/temposmart/utils';
import logger from '@/utils/logger';
import { getPlaywrightPage } from '@/utils/playwright';

export const HOST = 'https://www.athome.co.jp';
/** 都道府県 / 市区町村 slugs as the site spells them (tokyo, minato-city, yokohama_naka-city). */
const SLUG = /^[a-z\d_-]+$/;
export const DEFAULT_LIMIT = 20;

/** A list page in the site's own 新着順 (`sort=33`; without it the page opens in おすすめ順 / 指定なし, sort 95). */
export const athomeListUrl = (kind: string, pref: string, city: string): string => `${HOST}/${kind}/${pref}/${city}/list/?sort=33`;

export const checkSlugs = (slugs: Record<string, string>) => {
    for (const [name, value] of Object.entries(slugs)) {
        if (!SLUG.test(value)) {
            throw new Error(`Invalid ${name} "${value}", expected a lowercase site slug such as tokyo / minato-city / yokohama_naka-city`);
        }
    }
};

/** Bounded so one run fits inside RSSHub's 30s request timeout; see rent-store.ts for the measurements. */
const NAV_TIMEOUT = 12000;
const LIST_DEADLINE_MS = 26000;
/** The SSR document carries the data; scripts and API calls stay allowed so the interstitial can finish. */
const ALLOWED_RESOURCES = new Set(['document', 'script', 'xhr', 'fetch']);

/** One list page, rendered until its SSR state is attached. A page that never settles is an error, never an empty feed. */
export const fetchAthomeList = async (url: string): Promise<string> => {
    const startedAt = Date.now();
    const { page, destroy } = await getPlaywrightPage(url, {
        gotoConfig: { waitUntil: 'commit', timeout: NAV_TIMEOUT },
        onBeforeLoad: async (p) => {
            await p.route('**/*', (r) => (ALLOWED_RESOURCES.has(r.request().resourceType()) ? r.continue() : r.abort()));
        },
    });
    try {
        await page.waitForSelector('#serverApp-state', { state: 'attached', timeout: Math.max(3000, LIST_DEADLINE_MS - (Date.now() - startedAt)) });
        return await page.content();
    } catch (error) {
        let blocked = false;
        try {
            blocked = (await page.title()).includes('認証中');
        } catch {
            // The page may already be gone; the message below still names the failure.
        }
        logger.warn(`athome: ${url} failed after ${Date.now() - startedAt}ms (blocked=${blocked}): ${String(error)}`);
        throw new Error(
            blocked
                ? `athome: the site's authentication page did not resolve within ${LIST_DEADLINE_MS}ms; reduce polling frequency`
                : `athome: ${url} did not produce #serverApp-state within ${LIST_DEADLINE_MS}ms; loading did not finish or the page structure changed`,
            { cause: error }
        );
    } finally {
        await destroy();
    }
};

type State = Record<string, unknown>;

export const stateOf = (html: string): State => {
    const raw = load(html)('#serverApp-state').text();
    if (!raw) {
        throw new Error('athome: #serverApp-state is missing from the page');
    }
    return JSON.parse(raw) as State;
};

const image = (path: string | undefined): string | undefined => (path ? new URL(path, HOST).href : undefined);

/**
 * athome prints 賃料 / 価格 as a bare number of 万円 ('25.7', '1,580', '1億2,000', '2億'), so the unit
 * is appended before parsing; without it '1億2,000' would read as 1億 and 2,000円. Anything else passes through.
 */
const manYen = (text: string | undefined): string | null => {
    const s = clean(text);
    return s !== null && /^(?:\d+億)?[\d,]*(?:\.\d+)?$/.test(s) && /\d/.test(s) ? `${s}万円` : s;
};

interface RentRoom {
    bukkenNo?: string;
    roomNumber?: string;
    kai?: string;
    chinryo?: string;
    managementFee?: string;
    deposit?: string;
    keyMoney?: string;
    madori?: string;
    area?: string;
    isNewMark?: boolean;
    roomThumbnail?: string;
    heyaNayoseBukkenNoList?: string[];
}

interface RentBuilding {
    bukkenNm?: string;
    address?: string;
    syumokuNm?: string;
    kaidate?: string;
    chikunengetsu?: string;
    access?: Array<{ name?: string } | null>;
    imageList?: Array<{ imageUrl?: string } | null>;
    roomList?: RentRoom[];
}

/**
 * 賃貸 list: `first-view-ITEMS` holds one record per building with its rooms. The building name
 * carries the 階建 as a suffix ('グランパークハイツ 地上28階地下4階建'), which is cut off since it
 * has its own field. `heyaNayoseBukkenNoList` is the site's own list of listings of the same room
 * by different agents, kept as `raw.same_room_ids`.
 */
export const parseAthomeChintai = (state: State): ListedUnit[] => {
    const firstView = state['first-view-ITEMS'] as { data?: { propertyListData?: { propertyList?: RentBuilding[] } } } | undefined;
    const buildings = firstView?.data?.propertyListData?.propertyList;
    if (!Array.isArray(buildings)) {
        throw new TypeError('athome: the SSR state holds no 賃貸 listing data; the page structure may have changed');
    }
    const units: ListedUnit[] = [];
    const seen = new Set<string>();
    for (const b of buildings) {
        const name = clean(b.bukkenNm);
        const floors = clean(b.kaidate);
        const building = {
            property_type: clean(b.syumokuNm),
            building: name !== null && floors !== null && name.endsWith(floors) ? clean(name.slice(0, -floors.length)) : name,
            address: clean(b.address),
            access:
                (b.access ?? [])
                    .map((a) => clean(a?.name))
                    .filter((a): a is string => a !== null)
                    .join('\n') || null,
            floors,
            built: clean(b.chikunengetsu),
        };
        const rooms = b.roomList ?? [];
        for (const r of rooms) {
            const id = clean(r.bukkenNo);
            if (id === null || seen.has(id)) {
                continue;
            }
            seen.add(id);
            units.push({
                id,
                link: `${HOST}/chintai/${id}/`,
                raw: {
                    ...building,
                    floor: clean(r.kai),
                    room_no: clean(r.roomNumber),
                    price: manYen(r.chinryo),
                    management_fee: clean(r.managementFee),
                    deposit: clean(r.deposit),
                    key_money: clean(r.keyMoney),
                    layout: clean(r.madori),
                    area: clean(r.area),
                    same_room_ids: r.heyaNayoseBukkenNoList?.join(',') || null,
                },
                tags: r.isNewMark ? ['新着'] : [],
                image: image(r.roomThumbnail) ?? image(b.imageList?.[0]?.imageUrl),
            });
        }
    }
    return units;
};
