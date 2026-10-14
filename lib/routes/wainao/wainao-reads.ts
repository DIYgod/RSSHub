import { raw } from 'hono/html';
import { jsx } from 'hono/jsx';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { fetchEmbeddedStory } from './topics';

export const route: Route = {
    path: '/wainao-reads',
    categories: ['new-media'],
    example: '/wainao/wainao-reads',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    url: 'www.wainao.me',
    name: '读',
    maintainers: ['lucky13820'],
    radar: [
        {
            source: ['www.wainao.me', 'www.wainao.me/wainao-reads'],
            target: '/wainao-reads',
        },
    ],
    handler,
};

type ContentElement = {
    type: string;
    content?: string;
    url?: string;
    caption?: string;
    alt_text?: string;
    content_elements?: ContentElement[];
    citation?: { content?: string };
    embed?: { config?: { shorthandScript?: string; url?: string } };
};

type Story = {
    headlines: { basic: string };
    description?: { basic?: string };
    canonical_url: string;
    publish_date?: string;
    credits?: { by?: Array<{ name: string }> };
    taxonomy?: { primary_section?: { name?: string }; tags?: Array<{ text: string }> };
    content_elements?: ContentElement[];
    promo_items?: {
        basic?: { url?: string };
        wainao_video?: {
            streams?: Array<{ stream_type: string; url: string }>;
            promo_items?: { basic?: { url?: string } };
        };
    };
};

function renderContent(elements: ContentElement[]) {
    return elements.map((element) => {
        if (element.type === 'text') {
            return element.content ? jsx('p', {}, raw(element.content)) : undefined;
        }
        if (element.type === 'raw_html') {
            return raw(element.content ?? '');
        }
        if (element.type === 'quote') {
            return jsx('blockquote', {}, renderContent(element.content_elements ?? []), element.citation?.content ? jsx('cite', {}, raw(element.citation.content)) : undefined);
        }
        if (element.type === 'gallery') {
            return renderContent(element.content_elements ?? []);
        }
        if (element.type === 'image' && element.url) {
            return jsx('figure', {}, jsx('img', { src: element.url, alt: element.alt_text }), element.caption ? jsx('figcaption', {}, raw(element.caption)) : undefined);
        }
        return;
    });
}

async function fetchStoryBody(uri: string): Promise<Pick<DataItem, 'description'>> {
    const story = await ofetch<Story>('https://www.wainao.me/pf/api/v3/content/fetch/content-api', {
        query: {
            query: JSON.stringify({ uri, website_url: uri, 'arc-site': 'wainao' }),
            _website: 'wainao',
        },
    });
    if (!story.content_elements) {
        throw new Error(`Wainao story API has no body: ${uri}`);
    }
    const embedded = story.content_elements.find((element) => element.type === 'custom_embed')?.embed?.config;
    if (embedded?.shorthandScript) {
        return { description: (await fetchEmbeddedStory(embedded.shorthandScript)).description };
    }
    if (embedded?.url) {
        return { description: renderToString([story.description?.basic ? jsx('p', {}, story.description.basic) : undefined, jsx('iframe', { src: embedded.url, title: 'Article embed' })]) };
    }
    const video = story.promo_items?.wainao_video;
    const stream = video?.streams?.find((stream) => stream.stream_type === 'mp4');
    return {
        description: renderToString([stream ? jsx('video', { controls: true, poster: video?.promo_items?.basic?.url }, jsx('source', { src: stream.url })) : undefined, ...renderContent(story.content_elements)]),
    };
}

function parseSourceTime(value: unknown) {
    if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !value.trim())) {
        return;
    }
    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? date : undefined;
}

async function handler() {
    const apiUrl = 'https://www.wainao.me/pf/api/v3/content/fetch/content-api-collections?query={"content_alias":"wainao-hero"}&_website=wainao';
    const baseUrl = 'https://www.wainao.me';

    const data = await ofetch<{ content_elements: Story[] }>(apiUrl);

    const items = await pMap(
        data.content_elements,
        async (item) => ({
            title: item.headlines.basic,
            ...(await cache.tryGet<Pick<DataItem, 'description'>>(`wainao:reads-main:${item.canonical_url}`, () => fetchStoryBody(item.canonical_url))),
            link: baseUrl + item.canonical_url,
            pubDate: parseSourceTime(item.publish_date),
            author: item.credits?.by?.map((author) => ({ name: author.name })),
            category: [...new Set([item.taxonomy?.primary_section?.name, ...(item.taxonomy?.tags?.map((tag) => tag.text) ?? [])].filter((category): category is string => Boolean(category)))],
            image: item.promo_items?.basic?.url || '',
        }),
        { concurrency: 3 }
    );

    return {
        title: '歪脑读 - 歪脑',
        link: baseUrl,
        item: items,
    };
}
