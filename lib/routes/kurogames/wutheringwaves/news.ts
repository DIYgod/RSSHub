import { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import * as cheerio from 'cheerio';
import { ofetch } from 'ofetch';

interface NewsItem {
    articleContent: string;
    articleDesc: string;
    articleId: number;
    articleTitle: string;
    articleType: number;
    createTime: string;
    sortingMark: number;
    startTime: string;
    suggestCover: string;
    top: number;
}

export const route: Route = {
    path: '/wutheringwaves/news',
    categories: ['game'],
    example: '/wutheringwaves/news',
    name: '鸣潮 — 游戏公告、新闻与活动',
    radar: [
        {
            source: ['mc.kurogames.com/m/main/news', 'mc.kurogames.com/main'],
        },
    ],
    maintainers: ['enpitsulin'],
    description: '',
    async handler() {
        const res = await ofetch<NewsItem[]>('https://media-cdn-mingchao.kurogame.com/akiwebsite/website2.0/json/G152/zh/ArticleMenu.json', { query: { t: Date.now() } });
        return {
            title: '《鸣潮》— 游戏公告、新闻和活动',
            link: 'https://mc.kurogames.com/main#news',
            item: await Promise.all(
                res.map((i) => {
                    const contentUrl = `https://media-cdn-mingchao.kurogame.com/akiwebsite/website2.0/json/G152/zh/article/${i.articleId}.json`;
                    return cache.tryGet(contentUrl, async () => {
                        const data = await ofetch<NewsItem>(contentUrl, { query: { t: Date.now() } });

                        const $ = cheerio.load(data.articleContent);

                        return {
                            title: i.articleTitle,
                            pubDate: i.createTime,
                            description: $('body').html(),
                            link: `https://mc.kurogames.com/main/news/detail/${i.articleId}`,
                        } as DataItem;
                    }) as Promise<DataItem>;
                })
            ),
            language: 'zh-cn',
        };
    },
};
