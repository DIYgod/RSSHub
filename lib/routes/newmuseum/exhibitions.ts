import { load } from 'cheerio';
import { escapeUTF8 } from 'entities/escape';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/exhibitions/:state?',
    categories: ['travel'],
    example: '/newmuseum/exhibitions',
    parameters: {
        state: {
            description: 'Exhibition status from the exhibition overview',
            default: 'current',
            options: [
                { value: 'current', label: 'Current exhibitions and long-term commissions' },
                { value: 'upcoming', label: 'Upcoming exhibitions' },
                { value: 'past', label: 'Past exhibitions' },
                { value: 'online', label: 'Online exhibitions' },
            ],
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Exhibitions',
    maintainers: ['chazeon'],
    handler,
};

interface MuseumImage {
    sourceUrl: string;
    altText?: string;
    caption?: string;
}

interface MuseumBlock {
    name?: string;
    attributesJSON?: string;
    saveContent?: string;
    exhibitions?: Exhibition[];
}

interface Exhibition {
    title: string;
    link: string;
    dateGmt?: string;
    modifiedGmt?: string;
    exhibitionIntro?: string;
    featuredImage?: { node?: MuseumImage };
    heroAsset?: { desktop?: MuseumImage };
    exhibitionType?: { nodes?: Array<{ name: string }> };
    blocks?: MuseumBlock[];
}

interface MuseumData {
    props?: { pageProps?: { __TEMPLATE_QUERY_DATA__?: { page?: { blocks?: MuseumBlock[] }; exhibition?: Exhibition } } };
}

function getPageData(html: string) {
    const $ = load(html);
    const data: MuseumData = JSON.parse($('#__NEXT_DATA__').text());
    const pageData = data.props?.pageProps?.__TEMPLATE_QUERY_DATA__;
    if (!pageData) {
        throw new Error('New Museum page data is unavailable');
    }
    return pageData;
}

const collections = {
    current: new Set(['Current Exhibitions', 'Long-Term View Commissions']),
    upcoming: new Set(['Upcoming Exhibitions']),
    past: new Set(['PAST Exhibitions']),
    online: new Set(['ONLINE Exhibitions']),
};
const articleBlocks = new Set(['new-museum-blocks/two-column-content', 'new-museum-blocks/artists-bios', 'new-museum-blocks/video-columns']);

async function handler(ctx) {
    const state = ctx.req.param('state') ?? 'current';
    if (!Object.hasOwn(collections, state)) {
        throw new Error(`Unsupported exhibition status: ${state}. Use current, upcoming, past, or online.`);
    }
    const link = 'https://www.newmuseum.org/exhibitions/';

    const pageData = getPageData(await ofetch<string>(link));
    const list = (pageData.page?.blocks ?? [])
        .filter((block) => block.exhibitions && collections[state].has(JSON.parse(block.attributesJSON || '{}').title))
        .flatMap((block) => block.exhibitions ?? [])
        .filter((exhibition) => exhibition.title && exhibition.link);
    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`${item.link}:exhibition-body`, async () => {
                const exhibition = getPageData(await ofetch<string>(item.link)).exhibition;
                if (!exhibition) {
                    throw new Error(`New Museum exhibition data is unavailable: ${item.link}`);
                }
                const image = exhibition.heroAsset?.desktop ?? exhibition.featuredImage?.node;
                return {
                    description:
                        (image?.sourceUrl ? `<figure><img src="${escapeUTF8(image.sourceUrl)}" alt="${escapeUTF8(image.altText || '')}">${image.caption ? `<figcaption>${image.caption}</figcaption>` : ''}</figure>` : '') +
                        (exhibition.exhibitionIntro ? `<div>${exhibition.exhibitionIntro}</div>` : '') +
                        (exhibition.blocks ?? [])
                            .filter((block) => block.name && articleBlocks.has(block.name))
                            .map((block) => block.saveContent || '')
                            .join(''),
                    pubDate: exhibition.dateGmt ? parseDate(`${exhibition.dateGmt}Z`) : undefined,
                    updated: exhibition.modifiedGmt ? parseDate(`${exhibition.modifiedGmt}Z`) : undefined,
                };
            });
            return { title: item.title, link: item.link, image: item.featuredImage?.node?.sourceUrl, category: item.exhibitionType?.nodes?.map((type) => type.name), ...detail };
        },
        { concurrency: 3 }
    );
    return {
        title: 'New Museum - Exhibitions',
        link,
        item: items,
    };
}
