import { type CheerioAPI, load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { renderDescription } from './templates/description';

const itemField = {
    images: 4,
    slug: 6,
    price: 10,
    token: 13,
};

type Area = {
    AreaID: number;
    Country: string;
    Description: string;
    Hostname: string;
};

type Category = {
    Abbreviation: string;
    CategoryID: number;
    Description: string;
};

type ItemField = [number, ...Array<string | number>];

// [postingIdOffset, postedDateOffset, categoryId, price, location, imageRenditionCode, ...taggedFields]
type SearchItem = [number, number, number, number, string, string | number, ...Array<string | number | ItemField>];

type SearchDecode = {
    locationDescriptions: Array<string | number>;
    minPostedDate: number;
    minPostingId: number;
};

type SearchResponse = {
    data: {
        canonicalUrl: string;
        /**
         * 0 when the search has no results
         */
        decode: SearchDecode | 0;
        items: SearchItem[];
        pageTitle: string;
    };
    errors: Array<{ message: string }>;
};

export const route: Route = {
    path: '/:location/:type/:query?',
    categories: ['shopping'],
    example: '/craigslist/sfbay/sso',
    parameters: {
        location: 'Craigslist site, the subdomain of the site you browse, e.g. `sfbay` for `sfbay.craigslist.org`',
        type: 'Search type, the category abbreviation that follows `/search/` in the Craigslist search URL, e.g. `sso` (sale by owner), `apa` (apartments / housing for rent), `cta` (cars & trucks), `jjj` (all jobs), `sss` (all for sale)',
        query: 'Search keywords',
    },
    name: 'Search',
    maintainers: ['TonyRL'],
    handler,
};

const isItemField = (field: SearchItem[number]): field is ItemField => Array.isArray(field);
const findField = (fields: ItemField[], code: number) => fields.find((f) => f[0] === code);
const getPostingTime = ($: CheerioAPI, label: string) =>
    $('.postinginfo')
        .filter((_, element) => $(element).text().startsWith(label))
        .find('time')
        .attr('datetime');

async function handler(ctx): Promise<Data> {
    const { location, type, query } = ctx.req.param();
    const limit = getRouteLimit(ctx, 30);

    const searchBatchSize = 360;
    const referenceUrl = 'https://reference.craigslist.org';
    const searchApiUrl = 'https://sapi.craigslist.org/web/v8/postings/search/full';

    const [areas, categories] = await Promise.all([cache.tryGet('craigslist:areas', () => ofetch<Area[]>(`${referenceUrl}/Areas`)), cache.tryGet('craigslist:categories', () => ofetch<Category[]>(`${referenceUrl}/Categories`))]);

    const area = areas.find((candidate) => candidate.Hostname.toLowerCase() === location.toLowerCase());
    if (!area) {
        throw new InvalidParameterError(`Unknown Craigslist site "${location}". Use the subdomain of the site, e.g. "sfbay" for sfbay.craigslist.org.`);
    }
    const categoryNames = new Map(categories.map((c) => [c.CategoryID, c.Description]));

    const response = await ofetch<SearchResponse>(searchApiUrl, {
        query: {
            batch: `${area.AreaID}-0-${searchBatchSize}-0-0`,
            cc: area.Country,
            lang: 'en',
            searchPath: type,
            ...(query && { query }),
        },
        ignoreResponseError: true,
    });
    if (response.errors.length) {
        throw new Error(`Craigslist search failed: ${response.errors.map((error) => error.message).join('; ')}`);
    }

    const { canonicalUrl, decode, items: searchItems, pageTitle } = response.data;
    const title = pageTitle.replaceAll(/\s+/g, ' ');
    if (!decode) {
        throw new Error(`No Craigslist postings match: ${title}`);
    }

    const postings = searchItems.slice(0, limit).map((item) => {
        const [, dateOffset, categoryId, , location, , ...rest] = item;
        const fields = rest.filter((field) => isItemField(field));
        const slug = findField(fields, itemField.slug)![1];
        const token = findField(fields, itemField.token)![1];
        const descriptionIndex = Number(location.split('~', 1)[0].split(':', 2)[1]);
        const locationDescription = decode.locationDescriptions[descriptionIndex];

        return {
            title: rest.find((field): field is string => typeof field === 'string')!,
            link: `https://www.craigslist.org/view/d/${slug}/${token}`,
            pubDate: parseDate(decode.minPostedDate + dateOffset, 'X'),
            category: categoryNames.get(categoryId),
            price: findField(fields, itemField.price)?.[1],
            location: typeof locationDescription === 'string' ? locationDescription : undefined,
            images: (findField(fields, itemField.images)?.slice(1) ?? []).map((image) => `https://images.craigslist.org/${String(image).split(':').at(-1)}_1200x900.jpg`),
        };
    });

    const items = await Promise.all(
        postings.map((posting) =>
            cache.tryGet(posting.link, async (): Promise<DataItem> => {
                const response = await ofetch(posting.link);
                const $ = load(response);

                const body = $('#postingbody');
                body.find('.print-information').remove();

                const attributes = $('.attrgroup .attr')
                    .toArray()
                    .map((element) => {
                        const attribute = $(element);
                        const label = attribute.find('.labl').text().replace(/:$/, '');
                        const value = (attribute.find('.valu').text() || attribute.text()).trim();
                        return { label, value };
                    })
                    .filter((attribute) => attribute.value);

                const posted = getPostingTime($, 'posted');
                const updated = getPostingTime($, 'updated');

                return {
                    title: posting.title,
                    link: posting.link,
                    pubDate: posted ? parseDate(posted) : posting.pubDate,
                    updated: updated ? parseDate(updated) : undefined,
                    category: posting.category,
                    description: renderDescription({
                        images: posting.images,
                        price: posting.price,
                        location: posting.location,
                        address: $('.street-address').text(),
                        attributes,
                        body: body.html(),
                    }),
                };
            })
        )
    );

    return {
        title,
        link: `https:${canonicalUrl}`,
        language: 'en',
        item: items,
    };
}
