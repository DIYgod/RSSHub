import { escapeUTF8 } from 'entities/escape';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

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
    dateGmt: string;
    modifiedGmt: string;
    exhibitionIntro?: string;
    featuredImage: { node: MuseumImage };
    heroAsset: { desktop: MuseumImage };
    exhibitionType: { nodes: Array<{ name: string }> };
    blocks: MuseumBlock[];
}

function getPageData(html: string) {
    const nextData = /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s.exec(html)?.[1];
    if (!nextData) {
        throw new Error('New Museum page data is unavailable');
    }
    return JSON.parse(nextData).props.pageProps.__TEMPLATE_QUERY_DATA__;
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

    const response = await ofetch<string>(link);
    const blocks: MuseumBlock[] = getPageData(response).page.blocks;
    const list = blocks.filter((block) => block.exhibitions && collections[state].has(JSON.parse(block.attributesJSON || '{}').title)).flatMap((block) => block.exhibitions ?? []);
    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`${item.link}:exhibition-body`, async () => {
                const detailResponse = await ofetch<string>(item.link);
                const exhibition: Exhibition = getPageData(detailResponse).exhibition;
                const image = exhibition.heroAsset.desktop;
                return {
                    description:
                        `<figure><img src="${escapeUTF8(image.sourceUrl)}" alt="${escapeUTF8(image.altText || '')}">${image.caption ? `<figcaption>${image.caption}</figcaption>` : ''}</figure>` +
                        (exhibition.exhibitionIntro ? `<div>${exhibition.exhibitionIntro}</div>` : '') +
                        exhibition.blocks
                            .filter((block) => block.name && articleBlocks.has(block.name))
                            .map((block) => block.saveContent)
                            .join(''),
                    pubDate: parseDate(`${exhibition.dateGmt}Z`),
                    updated: parseDate(`${exhibition.modifiedGmt}Z`),
                };
            });
            return { title: item.title, link: item.link, image: item.featuredImage.node.sourceUrl, category: item.exhibitionType.nodes.map((type) => type.name), ...detail };
        },
        { concurrency: 3 }
    );
    return {
        title: 'New Museum - Exhibitions',
        link,
        item: items,
    };
}
