import MarkdownIt from 'markdown-it';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const md = MarkdownIt({
    html: true,
    breaks: true,
});

const langEnum = new Set(['zh-hant', 'en']);
const typeEnum = new Set(['latest', 'game-updates', 'news-article']);

async function handler(ctx) {
    const { lang = 'en', type = 'latest' } = ctx.req.param();
    const apiParams = new URLSearchParams({
        limit: '13',
        gameSlug: 'apex-legends',
        offset: '0',
    });
    if (!langEnum.has(lang)) {
        throw new InvalidParameterError(`Invalid language: ${lang}`);
    }
    if (!typeEnum.has(type)) {
        throw new InvalidParameterError(`Invalid type: ${type}`);
    }
    if (type !== 'latest') {
        apiParams.append('typeSlug', type);
    }
    if (lang !== 'en') {
        apiParams.append('locale', lang);
    }
    const apiUrl = `https://drop-api.ea.com/news-articles/pagination?${apiParams}`;
    const newsItems = await ofetch(apiUrl);

    type NewsItem = DataItem & {
        slug: string;
    };
    const allItems: NewsItem[] = [newsItems.featured, ...newsItems.items].filter(Boolean).map((item) => ({
        title: item.title,
        description: item.summary,
        link: `https://www.ea.com${lang === 'en' ? '/' : '/' + lang + '/'}games/apex-legends/apex-legends/news/${item.slug}`,
        pubDate: parseDate(item.publishingDate),
        slug: item.slug,
    }));
    const items = await Promise.all(
        allItems.map((item) =>
            cache.tryGet(item.link ?? '', async () => {
                const response = await ofetch(`https://drop-api.ea.com/news-articles/${item.slug}${lang === 'en' ? '' : '?locale=' + lang}`);
                item.description = md.render(response.body);
                return item;
            })
        )
    );
    return {
        title: `Apex Legends 官网资讯${type === 'latest' ? '' : `（${type === 'news-article' ? '最新消息' : '游戏更新'}）`}`,
        link: `https://www.ea.com${lang === 'en' ? '/' : '/' + lang + '/'}games/apex-legends/apex-legends/news${type === 'latest' ? '' : `?type=${type}`}`,
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
