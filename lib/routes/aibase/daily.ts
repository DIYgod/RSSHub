import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import { rootUrl, buildApiUrl } from './util';
import cache from '@/utils/cache';

export const route: Route = {
    path: '/daily',
    name: 'AI日报',
    url: 'www.aibase.com',
    maintainers: ['3tuuu'],
    handler: async (ctx) => {
        // 每页数量限制
        const limit = Number.parseInt(ctx.req.query('limit') ?? '30', 10);
        // 用项目中已有的获取页面方法，获取页面以及 Token
        const currentUrl = new URL('discover', rootUrl).href;
        const currentHtml = await ofetch(currentUrl);
        const $ = load(currentHtml);
        const logoSrc = $('img.logo').prop('src');
        const image = logoSrc ? new URL(logoSrc, rootUrl).href : '';
        const author = $('title').text().split(/_/).pop();
        const { aILogListUrl } = await buildApiUrl($);
        const response: NewsItem[] = await ofetch(aILogListUrl, {
            headers: {
                accept: 'application/json;charset=utf-8',
            },
            query: {
                pagesize: limit,
                page: 1,
                type: 2,
                isen: 0,
            },
        });
        const items = await Promise.all(
            response.data.slice(0, limit).map(async (item) => {
                const articleUrl = `https://www.aibase.com/zh/news/${item.Id}`;
                const description = await cache.tryGet(articleUrl, async () => {
                    try {
                        const articleHtml = await ofetch(articleUrl);
                        const $ = load(articleHtml);
                        const content = $('.post-content').html() || item.summary;
                        return content ?? item.summary;
                    } catch {
                        return item.summary;
                    }
                });

                return {
                    title: item.title,
                    link: articleUrl,
                    description,
                    pubDate: parseDate(item.addtime),
                    author: item.author || 'AI Base',
                };
            })
        );

        return {
            title: 'AI日报',
            description: '每天三分钟关注AI行业趋势',
            language: 'zh-cn',
            link: 'https://www.aibase.com/zh/daily',
            item: items,
            allowEmpty: true,
            image,
            author,
        };
    },
    example: '/aibase/daily',
    description: '获取 AI 日报',
    categories: ['new-media', 'popular'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.aibase.com/zh/daily'],
            target: '/daily',
        },
    ],
};

/** API 返回的资讯结构 */
interface NewsItem {
    /** 文章 ID */
    Id: number;
    /** 文章标题 */
    title: string;
    /** 文章副标题 */
    subtitle: string;
    /** 文章简要描述 */
    description: string;
    /** 文章主图 */
    thumb: string;
    classname: string;
    /** 正文总结 */
    summary: string;
    /** 标签，字符串，样例：[\"人工智能\",\"Hingham高中\"] */
    tags: string;
    /** 可能是来源 */
    sourcename: string;
    /** 作者 */
    author: string;
    status: number;
    url: string;
    type: number;
    added: number;
    /** 添加时间 */
    addtime: string;
    /** 更新时间 */
    upded: number;
    updtime: string;
    isshoulu: number;
    vurl: string;
    vsize: number;
    weight: number;
    isailog: number;
    sites: string;
    categrates: string;
    /** 访问量 */
    pv: number;
}
