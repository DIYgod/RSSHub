import { load } from 'cheerio';
import MarkdownIt from 'markdown-it';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const md = MarkdownIt({
    html: true,
    breaks: true,
});

const langEnum = new Set(['zh-hant', 'en']);
const typeEnum = new Set(['latest', 'game-updates', 'news-article']);

function renderBody(body: string) {
    const $ = load(md.render(body), null, false);
    $('h1, h2, h3, h4, h5, h6').each((_, heading) => {
        const $heading = $(heading);
        const marker = $heading.text().match(/\{#([\w-]+)\}/);
        if (!marker) {
            return;
        }
        $heading.attr('id', marker[1]);
        $heading
            .find('*')
            .addBack()
            .contents()
            .each((_, node) => {
                if (node.type === 'text') {
                    node.data = node.data.replace(marker[0], '');
                }
            });
    });
    $('img').each((_, image) => {
        const $image = $(image);
        const src = $image.attr('src');
        if (!src) {
            return;
        }
        const url = new URL(src, 'https://www.ea.com');
        const parent = $image.parent('a');
        let media;
        if (url.pathname.endsWith('.mp4')) {
            media = $('<video controls></video>').attr('src', src);
            const poster = parent.attr('href');
            if (poster) {
                media.attr('poster', poster);
            }
        } else if (['www.youtube.com', 'youtube.com', 'youtu.be'].includes(url.hostname)) {
            const id = url.searchParams.get('v') ?? url.pathname.split('/').at(-1);
            if (!id || !/^[\w-]{11}$/.test(id)) {
                return;
            }
            media = $('<iframe allowfullscreen></iframe>')
                .attr('src', `https://www.youtube.com/embed/${id}`)
                .attr('title', $image.attr('alt') ?? '');
        } else {
            return;
        }
        const target = parent.length ? parent : $image;
        const caption = target[0].nextSibling;
        if (caption?.type === 'text') {
            caption.data = caption.data.replace(/^\((?:Mp4|Youtube)\)/, '');
        }
        target.replaceWith(media);
    });
    return $.html();
}

interface NewsArticle {
    title: string;
    summary: string;
    slug: string;
    publishingDate?: string;
}

function getPublishingDate(value?: string) {
    if (!value) {
        return;
    }
    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? date : undefined;
}

async function getPageData<T>(url: string): Promise<T> {
    const response = await ofetch(url, { responseType: 'text' });
    const $ = load(response);
    const data = $('#__NEXT_DATA__').text();
    if (!data) {
        throw new Error('The EA page no longer contains its public news data. Please check the original page.');
    }
    return JSON.parse(data).props.pageProps as T;
}

async function handler(ctx): Promise<Data> {
    const { lang = 'en', type = 'latest' } = ctx.req.param();
    if (!langEnum.has(lang)) {
        throw new InvalidParameterError(`Invalid language: ${lang}`);
    }
    if (!typeEnum.has(type)) {
        throw new InvalidParameterError(`Invalid type: ${type}`);
    }
    const rootUrl = `https://www.ea.com${lang === 'en' ? '/' : '/' + lang + '/'}games/apex-legends/apex-legends/news`;
    const currentUrl = `${rootUrl}${type === 'latest' ? '' : `?type=${type}`}`;
    const { initialNewsData: newsItems } = await getPageData<{ initialNewsData: { featured?: NewsArticle; items: NewsArticle[] } }>(currentUrl);

    type NewsItem = DataItem & {
        slug: string;
    };
    const allItems: NewsItem[] = [newsItems.featured, ...newsItems.items]
        .filter((item): item is NewsArticle => Boolean(item))
        .map((item) => ({
            title: item.title,
            description: item.summary,
            link: `${rootUrl}/${item.slug}`,
            pubDate: getPublishingDate(item.publishingDate),
            slug: item.slug,
        }));
    const sorted = ctx.req.query('sorted') !== 'false';
    const hasDates = allItems.every((item) => item.pubDate !== undefined);
    if (sorted && hasDates) {
        allItems.sort((a, b) => +new Date(b.pubDate!) - +new Date(a.pubDate!));
    }
    const limit = getRouteLimit(ctx);
    const items = await pMap(
        limit && (!sorted || hasDates) ? allItems.slice(0, limit) : allItems,
        (item) =>
            cache.tryGet(item.link ?? '', async () => {
                const { articleDetailsFallback: article } = await getPageData<{ articleDetailsFallback: NewsArticle & { body: string } }>(item.link!);
                item.description = renderBody(article.body);
                return item;
            }),
        { concurrency: 3 }
    );
    return {
        title: `Apex Legends 官网资讯${type === 'latest' ? '' : `（${type === 'news-article' ? '最新消息' : '游戏更新'}）`}`,
        link: currentUrl,
        language: lang === 'zh-hant' ? 'zh-TW' : 'en',
        item: items.map((item) => ({
            title: item.title,
            description: item.description,
            link: item.link,
            pubDate: item.pubDate,
        })),
        image: 'https://drop-assets.ea.com/images/F1GeiHWipvvKj7GtUVP3U/31bb122451e2dea6d14c9b497f8e09d4/apex-white-nav-logo.svg',
    };
}
export const route: Route = {
    path: '/apex-news/:lang?/:type?',
    categories: ['game'],
    example: '/ea/apex-news/zh-hant/game-updates',
    parameters: {
        lang: {
            description: '语言',
            options: [
                { value: 'zh-hant', label: '中文(繁体)' },
                { value: 'en', label: 'English' },
            ],
            default: 'en',
        },
        type: {
            description: '资讯类型（可选）',
            options: [
                { value: 'news-article', label: '最新消息' },
                { value: 'game-updates', label: '游戏更新' },
                { value: 'latest', label: '全部' },
            ],
            default: 'latest',
        },
    },
    name: 'APEX Legends 官网资讯',
    maintainers: ['IceChestnut'],
    handler,
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    view: ViewType.Articles,
};
