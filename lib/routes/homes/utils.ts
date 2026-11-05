import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';

import type { ListedUnit } from '@/routes/suumo/residential';
import { collectPairs, photoUrl } from '@/routes/suumo/residential';
import { clean } from '@/routes/temposmart/utils';
import ofetch from '@/utils/ofetch';

export const HOST = 'https://www.homes.co.jp';
/** 都道府県 / 市区町村 slugs as the site spells them in its area paths (tokyo, minato-city). */
export const SLUG = /^[a-z\d_-]+$/;
export const DEFAULT_LIMIT = 20;

export const checkSlugs = (slugs: Record<string, string>) => {
    for (const [name, value] of Object.entries(slugs)) {
        if (!SLUG.test(value)) {
            throw new Error(`Invalid ${name} "${value}", expected a lowercase LIFULL HOME'S area slug such as tokyo / minato-city`);
        }
    }
};

/**
 * The site sits behind AWS WAF, which answers a client it has flagged with an empty 202 and an
 * `x-amzn-waf-action: challenge` header (seen 2026-10-31 after ~15 plain requests in an hour, and
 * again after ~8 in ten minutes).
 * That page is named as what it is rather than parsed as "no listings"; the route does not try
 * to get past the challenge.
 */
export const fetchHomesPage = async (url: string): Promise<string> => {
    const res = await ofetch.raw(url, { responseType: 'text' });
    if (res.headers.get('x-amzn-waf-action') !== null || (res.status === 202 && !res._data)) {
        throw new HomesChallenged(url);
    }
    return res._data ?? '';
};

class HomesChallenged extends Error {
    constructor(url: string) {
        super(`homes: the site's bot protection (AWS WAF) is challenging this client at ${url}; poll less often or pass ?detail=0`);
    }
}

/**
 * At most this many uncached detail pages per run: with the list page that keeps one poll under the
 * ~8 requests that drew a challenge in ten minutes. The rest are read on later polls as the cache fills.
 */
export const DETAIL_BUDGET = 5;

/**
 * Where a 賃貸 detail page keeps its labelled fields. The page's own dialogs (初期費用 and the like)
 * sit outside #main and carry labels of their own, so reading the whole page would let the first of
 * them win if the site ever moved one above the spec.
 */
export const HOMES_RENT_DETAIL_SCOPE = '#main';

/**
 * Where a 売買 detail page keeps its 物件概要. A unit one agent lists has it in #about; a unit several
 * agents list (「取扱う会社が N 社あります」) gets an older layout with the header block
 * (.mod-detailTopSale: 価格, 管理費等, 修繕積立金, 情報公開日) and a spec table (.mod-bukkenSpecDetail).
 * The recommended listings further down carry their own 住所 and 交通, so the page is never read whole.
 */
export const HOMES_SALE_DETAIL_SCOPE = '#about, .mod-detailTopSale, .mod-bukkenSpecDetail';

/**
 * `fetchHomesPage` for one run: once the site has challenged it, every later request of the same run
 * fails at once instead of being sent, since each one sent while flagged only extends the flag.
 */
export const homesFetcher = (): ((url: string) => Promise<string>) => {
    let challenged: HomesChallenged | null = null;
    return async (url) => {
        if (challenged !== null) {
            throw challenged;
        }
        try {
            return await fetchHomesPage(url);
        } catch (error) {
            if (error instanceof HomesChallenged) {
                challenged = error;
            }
            throw error;
        }
    };
};

const texts = ($: CheerioAPI, els: Cheerio<Element>): string[] =>
    els
        .toArray()
        .map((el) => clean($(el).text()))
        .filter((t): t is string => t !== null);

/** A cell's lines, split at its <br>s. */
const lines = ($: CheerioAPI, el: Element | undefined): string[] =>
    el === undefined
        ? []
        : ($(el).html() ?? '')
              .split(/<br\s*\/?>/i)
              .map((h) => clean(load(h, null, false).text()))
              .filter((t): t is string => t !== null);

/** 'A / B / C' → its parts, each cleaned; a missing part is null. */
const parts = (text: string | undefined, n: number): Array<string | null> => {
    const ps = (text ?? '').split(/\s*[/／]\s*/);
    return Array.from({ length: n }, (_, i) => clean(ps[i]));
};

/**
 * 賃貸 list: one `.mod-mergeBuilding--rent…` block per building, one `tr.prg-roomInfo` per room.
 * The sponsored rows at the top of the page sit outside those blocks and are not read. The room
 * row carries 階 and (sometimes) 部屋番号, 賃料 / 管理費等 over 敷金 / 礼金 / 保証金 / 敷引・償却,
 * 間取り over 専有面積, and a 定期借家 badge; its feature labels are on the row right after it.
 */
export const parseHomesChintaiList = (html: string): ListedUnit[] => {
    const $ = load(html);
    const units: ListedUnit[] = [];
    const seen = new Set<string>();
    for (const block of $('[class*="mod-mergeBuilding--rent"]').toArray()) {
        const b = $(block);
        const building = {
            property_type: clean(b.find('.bType').first().text()),
            building: clean(b.find('.bukkenName').first().text()),
            ...collectPairs($, b.find('.bukkenSpec')),
        };
        const image = photoUrl(b.find('.bukkenPhoto img').attr('data-original'), HOST);

        for (const tr of b.find('tr.prg-roomInfo').toArray()) {
            const row = $(tr);
            const anchor = row.find('a.prg-detailAnchor').first();
            const id = anchor.attr('href')?.match(/\/chintai\/room\/([0-9a-f]+)\//)?.[1];
            if (id === undefined || seen.has(id)) {
                continue;
            }
            seen.add(id);
            const [rentLine, feeLine] = lines($, row.find('td.price')[0]);
            const [price, managementFee] = parts(rentLine, 2);
            const [deposit, keyMoney, guaranteeDeposit, deduction] = parts(feeLine, 4);
            const [layout, area] = lines($, row.find('td.layout')[0]);
            units.push({
                id,
                link: `${HOST}/chintai/room/${id}/`,
                raw: {
                    ...building,
                    bid: anchor.attr('data-bid') ?? null,
                    floor: clean(row.find('li.roomKaisuu').text()),
                    room_no: clean(row.find('li.roomNumber').text()),
                    price,
                    management_fee: managementFee,
                    deposit,
                    key_money: keyMoney,
                    guarantee_deposit: guaranteeDeposit,
                    deposit_deduction: deduction,
                    layout: layout ?? null,
                    area: area ?? null,
                    // Only the badge's presence says anything; its absence is not 普通借家.
                    contract_type: row.find('.teikishakkaIcon').length > 0 ? '定期借家' : null,
                    freshness: clean(row.find('.newIcon').text()),
                },
                tags: texts($, row.next('tr.prg-relatedKeywordsRow').find('.relatedKeyword')),
                image,
            });
        }
    }
    return units;
};

/**
 * Detail page label pairs within `scope`, plus the dates the sale page prints as running text
 * (「情報公開日：2026/09/24」) rather than as a labelled cell. A date that is not found is left out
 * rather than set to null, so a page with no field at all comes back empty and is never cached.
 */
export const parseHomesDetail = (html: string, scope = 'body'): Record<string, string | null> => {
    const $ = load(html);
    const raw = collectPairs($, scope);
    const text = $('body').text();
    const listed = text.match(/情報公開日[：:]\s*(\d{4}\/\d{1,2}\/\d{1,2})/)?.[1] ?? null;
    const provided = text.match(/最新情報提供日[：:]\s*(\d{4}\/\d{1,2}\/\d{1,2})/)?.[1] ?? null;
    const listedAt = raw.listed_at ?? listed;
    const updatedAt = raw.updated_at ?? provided;
    return { ...raw, ...(listedAt !== null && { listed_at: listedAt }), ...(updatedAt !== null && { updated_at: updatedAt }) };
};

/**
 * 売買 list (中古マンション / 中古一戸建て): one `.mod-mergeBuilding--sale…` block per building, one
 * `tr.raSpecRow` per unit. The block gives 交通 / 所在地, 構造 / 階数, 築年月 and 総戸数; the row gives
 * the unit's 階, 価格, 間取り, 専有面積, 主要採光面 and a 価格更新 note when the price moved.
 */
export const parseHomesBuyList = (html: string): ListedUnit[] => {
    const $ = load(html);
    const units: ListedUnit[] = [];
    const seen = new Set<string>();
    for (const block of $('[class*="mod-mergeBuilding--sale"]').toArray()) {
        const b = $(block);
        const building = {
            property_type: clean(b.find('.bType').first().text()),
            building: clean(b.find('.bukkenName').first().text()),
            ...collectPairs($, b.find('.bukkenSpec')),
        };
        const buildingTags = texts($, b.find('.relatedKeywordsDataBuiding li'));
        const image = photoUrl(b.find('.bukkenPhoto img').attr('data-original'), HOST);

        for (const tr of b.find('tr.raSpecRow').toArray()) {
            const row = $(tr);
            const href = row.find('a[href*="/b-"]').attr('href');
            const id = href?.match(/\/(b-\d+)\//)?.[1];
            if (href === undefined || id === undefined || seen.has(id)) {
                continue;
            }
            seen.add(id);
            const floor = clean(row.find('.statusIcons > span').not('.itemPriceUpdated, .visitedIcon').first().text());
            units.push({
                id,
                link: new URL(href, HOST).href,
                raw: {
                    ...building,
                    floor: floor?.includes('階') ? floor : null,
                    price_updated: clean(row.find('.itemPriceUpdated').text()),
                    ...collectPairs($, row.find('td.info')),
                },
                tags: [...texts($, row.find('.relatedKeywordsData li')), ...buildingTags],
                image: photoUrl(row.find('.displayPic img').attr('data-original'), HOST) ?? image,
            });
        }
    }
    return units;
};
