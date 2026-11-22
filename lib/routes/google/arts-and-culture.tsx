import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/arts-and-culture',
    categories: ['design'],
    example: '/google/arts-and-culture',
    name: 'Arts & Culture featured stories',
    maintainers: ['DIYgod'],
    radar: [{ source: ['artsandculture.google.com'], target: '/arts-and-culture' }],
    handler,
};

async function handler() {
    const link = 'https://artsandculture.google.com/';
    const response = await ofetch(link);
    const $ = load(response);
    const items = $('a[data-gacategory="editorial"][href]')
        .toArray()
        .filter((element) => {
            const card = $(element);
            return /^\/(?:story|theme|project|exhibit)\//.test(card.attr('href')!) && card.attr('data-gaeditorialname') !== 'SimpleStack' && card.attr('title');
        })
        .map((element) => {
            const card = $(element);
            return {
                title: card.attr('title')!,
                link: new URL(card.attr('href')!, link).href,
                image: card.find('[data-bgsrc]').attr('data-bgsrc'),
            };
        });
    const details = await pMap(
        items,
        async ({ image, ...item }) => {
            const metadata = await cache.tryGet<Partial<Pick<DataItem, 'title' | 'author' | 'summary'>>>(`google:arts-and-culture:content:${item.link}`, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                const structuredData: StoryMetadata = JSON.parse($('script[type="application/ld+json"]:contains("WebPage")').text());
                const title = $('h1').text() || structuredData.name;
                return {
                    ...(title && { title }),
                    author: structuredData.creator?.name,
                    summary: structuredData.headline || $('meta[name="description"]').attr('content'),
                };
            });
            return { ...item, ...metadata, description: renderDescription(image, metadata.summary) };
        },
        { concurrency: 3 }
    );
    return { title: 'Google Arts & Culture - Featured stories', link, item: details };
}

interface StoryMetadata {
    name?: string;
    headline?: string;
    creator?: { name?: string };
}

const renderDescription = (image: string | undefined, summary: string | undefined) =>
    renderToString(
        <>
            {image && <img src={image} alt="" />}
            {summary && <p>{summary}</p>}
        </>
    );
