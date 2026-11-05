import { load } from 'cheerio';

import { clean } from '@/routes/temposmart/utils';

import type { ListedUnit } from './residential';
import { collectPairs, photoUrl } from './residential';

export const HOST = 'https://suumo.jp';
/** 都道府県 / 市区町村 slugs as the site spells them in its area paths (tokyo, minato, yokohamashinaka). */
export const SLUG = /^[a-z\d_-]+$/;
export const DEFAULT_LIMIT = 20;

/** The 市区町村 slug without the `sc_` the site prints in its paths, so a Radar-matched `sc_minato` works too. */
export const areaSlug = (city: string): string => city.replace(/^sc_/, '');

export const checkSlugs = (slugs: Record<string, string>) => {
    for (const [name, value] of Object.entries(slugs)) {
        if (!SLUG.test(value)) {
            throw new Error(`Invalid ${name} "${value}", expected a lowercase SUUMO area slug such as tokyo / minato`);
        }
    }
};

/**
 * The title SUUMO prints for a building whose agent gave no 物件名: its first station, height and age
 * ('<線> <駅>駅 5階建 築43年'). It names no building, and two buildings by one station can share it,
 * so it is kept as `site_title` and never read as the building name.
 */
const GENERATED_NAME = /^\S+\s+[^\s駅]+駅\s+(?:地上)?\d+階(?:地下\d+階)?建\s+(?:築\d+年|新築)$/;

/**
 * 賃貸 list: one `.cassetteitem` per building, one `tr.js-cassette_link` per room. The building's
 * 種目, name, 所在地, 交通, 築年数 and 階建 are copied onto each room; the room's own 階, 賃料,
 * 管理費, 敷金, 礼金, 間取り and 専有面積 come from its row only.
 */
export const parseChintaiList = (html: string): ListedUnit[] => {
    const $ = load(html);
    const units: ListedUnit[] = [];
    const seen = new Set<string>();
    const texts = (els: ReturnType<typeof $>) =>
        els
            .toArray()
            .map((el) => clean($(el).text()))
            .filter((t): t is string => t !== null);

    for (const block of $('.cassetteitem').toArray()) {
        const b = $(block);
        const col3 = texts(b.find('.cassetteitem_detail-col3 div'));
        const title = clean(b.find('.cassetteitem_content-title').text());
        const generated = title !== null && GENERATED_NAME.test(title.normalize('NFKC'));
        const building = {
            property_type: clean(b.find('.cassetteitem_content-label').text()),
            building: generated ? null : title,
            ...(generated && { site_title: title }),
            address: clean(b.find('.cassetteitem_detail-col1').text()),
            access: texts(b.find('.cassetteitem_detail-col2 .cassetteitem_detail-text')).join('\n') || null,
            age: col3.find((t) => t.startsWith('築')) ?? null,
            floors: col3.find((t) => t.includes('階建')) ?? null,
        };
        const image = photoUrl(b.find('.cassetteitem_object-item img').attr('rel'), HOST);

        for (const tr of b.find('tr.js-cassette_link').toArray()) {
            const row = $(tr);
            const id = row
                .find('a.js-cassette_link_href')
                .attr('href')
                ?.match(/jnc_\d+/)?.[0];
            if (id === undefined || seen.has(id)) {
                continue;
            }
            seen.add(id);
            units.push({
                id,
                link: `${HOST}/chintai/${id}/`,
                raw: {
                    ...building,
                    floor: clean(row.children('td').eq(2).text()),
                    price: clean(row.find('.cassetteitem_price--rent').text()),
                    management_fee: clean(row.find('.cassetteitem_price--administration').text()),
                    deposit: clean(row.find('.cassetteitem_price--deposit').text()),
                    key_money: clean(row.find('.cassetteitem_price--gratuity').text()),
                    layout: clean(row.find('.cassetteitem_madori').text()),
                    area: clean(row.find('.cassetteitem_menseki').text()),
                },
                tags: texts(row.find('.cassetteitem-tag')),
                image,
            });
        }
    }
    return units;
};

/** 賃貸 detail: the summary table and the 物件概要 table; everything else on the page is navigation or forms. */
export const parseChintaiDetail = (html: string) => collectPairs(load(html), '.property_view_table, .table_gaiyou');

/**
 * 売買 list (中古マンション / 中古一戸建て): one `.property_unit` card per unit, its fields as dt/dd
 * label pairs. The card heading is the agent's catch copy, not the building name, so it is not read.
 * A card links to its unit several times (photos, heading), hence the dedupe on the nc_ id.
 */
export const parseBuyList = (html: string, propertyType: string): ListedUnit[] => {
    const $ = load(html);
    const units: ListedUnit[] = [];
    const seen = new Set<string>();
    for (const card of $('.property_unit').toArray()) {
        const c = $(card);
        const href = c.find('a[href*="/nc_"]').attr('href');
        const id = href?.match(/nc_\d+/)?.[0];
        if (href === undefined || id === undefined || seen.has(id)) {
            continue;
        }
        seen.add(id);
        units.push({
            id,
            link: new URL(href, HOST).href,
            raw: { ...collectPairs($, c), property_type: propertyType },
            tags: [],
            image: photoUrl(c.find('.property_unit-object img').attr('rel'), HOST),
        });
    }
    return units;
};

/** 売買 detail: the header block (情報提供日) and the 物件概要 tables; the inquiry form has no `bdGrayT`. */
export const parseBuyDetail = (html: string) => collectPairs(load(html), '#topContents, table.bdGrayT');
