import { type CheerioAPI, load } from 'cheerio';
import { jsx } from 'hono/jsx';
import { renderToString } from 'hono/jsx/dom/server';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import NotFoundError from '@/errors/types/not-found';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

export const route: Route = {
    path: '/mobile',
    categories: ['new-media'],
    example: '/sohu/mobile',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['m.sohu.com/limit'],
            target: '/mobile',
        },
    ],
    name: '首页新闻',
    maintainers: ['asqwe1'],
    handler,
    description: '订阅手机搜狐网的首页新闻',
};

async function handler() {
    const response = await ofetch('https://m.sohu.com/limit');
    const $ = load(response);
    const jsonScript = $('script:contains("WapHomeRenderData")').text();
    const jsonMatch = jsonScript?.match(/window\.WapHomeRenderData\s*=\s*(\{.*\})/s);
    const list = jsonMatch?.[1]
        ? extractPlateBlockNewsLists(JSON.parse(jsonMatch[1]))
              .filter((item) => item.id && item.url?.startsWith('//'))
              .map((item) => ({
                  title: item.title,
                  link: new URL(item.url.split('?', 1)[0], 'https://m.sohu.com').href,
              }))
        : extractNewsCards($);
    if (!list.length) {
        throw new Error('No news cards were found on the Sohu mobile homepage.');
    }
    const items = await pMap(
        list,
        async (item) => {
            try {
                const detail = await cache.tryGet(item.link, async () => {
                    const detailResp = await ofetch(item.link);
                    const $d = load(detailResp);

                    let description = '';
                    let pubDate: Date | undefined;
                    if (item.link.includes('/xtopic/')) {
                        const fullArticleUrl = $d('.tpl-top-text-item-content').prop('href')?.split('?', 1)[0]?.replace('www.sohu.com/', 'm.sohu.com/');
                        const response = await ofetch(`https:${fullArticleUrl}`);
                        const $ = load(response);
                        description = getDescription($) ?? '';
                        pubDate = extractPubDate($);
                    }

                    description ||= getDescription($d) || '';
                    if (!description) {
                        throw new NotFoundError(`The article body was not found at ${item.link}.`);
                    }
                    return {
                        description,
                        pubDate: pubDate || extractPubDate($d),
                    };
                });
                return { ...item, ...detail };
            } catch (error) {
                if (!(error instanceof FetchError || error instanceof NotFoundError)) {
                    throw error;
                }
                logger.warn(`Could not fetch the article body at ${item.link}: ${error.message}`);
                return item;
            }
        },
        { concurrency: 3 }
    );
    return {
        title: '手机搜狐新闻',
        link: 'https://m.sohu.com/limit',
        item: items.filter(Boolean),
    };
}

function extractNewsCards($: CheerioAPI) {
    const cards = new Map<string, { title: string; link: string }>();
    $('a[href]').each((_, element) => {
        const anchor = $(element);
        const href = anchor.attr('href');
        const title = anchor.find('.focus-item-info-text').text() || anchor.text();
        if (!href || !title.trim()) {
            return;
        }
        const url = new URL(href, 'https://m.sohu.com');
        if (!['m.sohu.com', 'www.sohu.com'].includes(url.hostname) || !/^\/(?:a|xtopic)\/\d/.test(url.pathname)) {
            return;
        }
        url.search = '';
        url.hash = '';
        if (!cards.has(url.href)) {
            cards.set(url.href, { title, link: url.href });
        }
    });
    return cards.values().toArray();
}

function extractPlateBlockNewsLists(jsonData: any) {
    const result: any[] = [];
    for (const [key, plateBlock] of Object.entries<any>(jsonData)) {
        if (!key.startsWith('PlateBlock')) {
            continue;
        }

        // Collect news and focus cards from the legacy render data.
        if (plateBlock?.param?.newsData?.list) {
            result.push(...plateBlock.param.newsData.list);
        }
        if (plateBlock?.param?.focusData?.list) {
            result.push(...plateBlock.param.focusData.list);
        }
        if (plateBlock?.param?.feedData0?.list) {
            result.push(...plateBlock.param.feedData0.list);
        }
        if (plateBlock?.param?.feedData1?.list) {
            result.push(...plateBlock.param.feedData1.list);
        }
    }
    return result;
}

function extractPubDate($: CheerioAPI): Date | undefined {
    const date = $('meta[itemprop="datePublished"]').attr('content') || $('.time').first().text().trim() || $('#videoPublicTime').first().text().trim();
    return date ? parseDateInTimezone(date, 8) : undefined;
}

function getDescription($: CheerioAPI): string | null {
    const content = $('#articleContent');
    if (content.length) {
        return content.first().html()?.trim() ?? null;
    }
    const video = $('#videoPlayer div');
    if (video.length) {
        return `<video controls preload="auto" poster="${video.attr('data-thumbnail')}"><source src="${video.attr('data-url')}" /></video>`;
    }
    const scripts = $('script').text();
    const videoUrl = scripts.match(/videoUrl:\s*("(?:\\.|[^"\\])*")/)?.[1];
    if (videoUrl) {
        const videoCover = scripts.match(/videoCover:\s*("(?:\\.|[^"\\])*")/)?.[1];
        const poster = videoCover ? new URL(JSON.parse(videoCover), 'https://m.sohu.com').href : undefined;
        const source = jsx('source', { src: JSON.parse(videoUrl), type: 'video/mp4' });
        return renderToString(jsx('video', { controls: true, poster }, source));
    }
    const imageList = $('script:contains("imageList")').text();
    if (imageList) {
        const list = JSON.parse(imageList.match(/(\[.*\])/s)?.[1].replaceAll(/("description": ".*"),/g, '$1') || '[]');
        return list.map((item: any) => `<img src="${item.url}" alt="${item.description || ''}" />`).join('');
    }
    return '';
}
