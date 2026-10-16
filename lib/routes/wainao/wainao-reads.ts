import { load } from 'cheerio';
import { raw } from 'hono/html';
import { jsx } from 'hono/jsx';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';

import { fetchEmbeddedStory } from './topics';

export const route: Route = {
    path: '/wainao-reads',
    categories: ['new-media'],
    example: '/wainao/wainao-reads',
    features: {
        requireConfig: false,
        requirePuppeteer: true,
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

class EmbeddedStoryUnavailableError extends Error {
    constructor(readonly description: string) {
        super('The public embedded story did not expose its article body.');
    }
}

function isReactStory(url: string) {
    const target = new URL(url);
    return target.protocol === 'https:' && ['wainao-production.s3.amazonaws.com', 's3cdn.wainao.me'].includes(target.hostname) && target.pathname.startsWith('/react-static/special-reports/');
}

async function fetchStoryBody(uri: string, getReactStory: (url: string) => Promise<Pick<DataItem, 'description'>>): Promise<Pick<DataItem, 'description'>> {
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
        const description = renderToString([story.description?.basic ? jsx('p', {}, story.description.basic) : undefined, jsx('iframe', { src: embedded.url, title: 'Article embed' })]);
        if (isReactStory(embedded.url)) {
            try {
                return await getReactStory(embedded.url);
            } catch (error) {
                if (error instanceof EmbeddedStoryUnavailableError || (error instanceof Error && error.name === 'TimeoutError')) {
                    throw new EmbeddedStoryUnavailableError(description);
                }
                throw error;
            }
        }
        return { description };
    }
    const video = story.promo_items?.wainao_video;
    const stream = video?.streams?.find((stream) => stream.stream_type === 'mp4');
    return {
        description: renderToString([stream ? jsx('video', { controls: true, poster: video?.promo_items?.basic?.url }, jsx('source', { src: stream.url })) : undefined, ...renderContent(story.content_elements)]),
    };
}

function parseSourceTime(value?: string | number) {
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
    let browserPromise: ReturnType<typeof getPlaywrightPage> | undefined;
    const getReactStory = async (url: string): Promise<Pick<DataItem, 'description'>> => {
        browserPromise ??= getPlaywrightPage(url, {
            noGoto: true,
            closeTimeout: 0,
            onBeforeLoad: async (_, context) => {
                await context!.route('**/*', (route) => (['document', 'script', 'xhr', 'fetch', 'stylesheet'].includes(route.request().resourceType()) ? route.continue() : route.abort()));
            },
        });
        const { context } = await browserPromise;
        const page = await context.newPage();
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
            await page.waitForSelector('#root > .App .article-body p', { state: 'attached', timeout: 15000 });
            const source = await page.content();
            const $ = load(source);
            const article = $('#root > .App').first();
            article.find('h1.intro__title, .credits, script, style, button, input, select').remove();
            if (!article.text().trim()) {
                throw new EmbeddedStoryUnavailableError('');
            }
            article.find('[src], [href], [poster]').each((_, element) => {
                const media = $(element);
                for (const attribute of ['src', 'href', 'poster']) {
                    const value = media.attr(attribute);
                    if (value && !value.startsWith('data:')) {
                        media.attr(attribute, new URL(value, url).href);
                    }
                }
            });
            article.find('[class]').removeAttr('class');
            article.find('[style]').removeAttr('style');
            return { description: article.html()! };
        } finally {
            await page.close();
        }
    };
    const getStoryBody = async (uri: string) => {
        try {
            return await cache.tryGet<Pick<DataItem, 'description'>>(`wainao:reads-main:react:v1:${uri}`, () => fetchStoryBody(uri, getReactStory));
        } catch (error) {
            if (error instanceof EmbeddedStoryUnavailableError) {
                return { description: error.description };
            }
            throw error;
        }
    };
    try {
        const items = await pMap(
            data.content_elements,
            async (item) => ({
                title: item.headlines.basic,
                ...(await getStoryBody(item.canonical_url)),
                link: baseUrl + item.canonical_url,
                pubDate: parseSourceTime(item.publish_date),
                author: item.credits?.by?.map((author) => ({ name: author.name })),
                category: [...new Set([item.taxonomy?.primary_section?.name, ...(item.taxonomy?.tags?.map((tag) => tag.text) ?? [])].filter((category): category is string => Boolean(category)))],
                image: item.promo_items?.basic?.url || '',
            }),
            { concurrency: 3, stopOnError: false }
        );

        return {
            title: '歪脑读 - 歪脑',
            link: baseUrl,
            item: items,
        };
    } finally {
        await (await browserPromise)?.destroy();
    }
}
