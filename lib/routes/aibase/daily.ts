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
        const author = 'AI Base';
        const { aILogListUrl } = await buildApiUrl($);
        const response: DailyData = await ofetch(aILogListUrl, {
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
        if (!response || !response.data) {
            throw new Error('日报数据不存在或为空');
        }
        const items = await Promise.all(
            response.data.slice(0, limit).map(async (item) => {
                const articleUrl = `https://www.aibase.com/zh/news/${item.Id}`;
                return await cache.tryGet(articleUrl, async () => {
                    const articleHtml = await ofetch(articleUrl);
                    const $ = load(articleHtml);
                    const description = $('.post-content').html();
                    if (!description) {
                        throw new Error(`Empty content: ${articleUrl}`);
                    }
                    return {
                        title: item.title,
                        link: articleUrl,
                        description,
                        pubDate: parseDate(item.addtime),
                        author: 'AI Base',
                    };
                });
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
    categories: ['new-media'],
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

interface DailyData {
    has_more: boolean;
    message: string;
    data: DailyItem[];
}
interface DailyItem {
    /** 文章 ID */
    Id: number;
    /** 添加时间 */
    addtime: string;
    /** 文章标题 */
    title: string;
    /** 文章副标题 */
    subtitle: string;
    /** 文章简要描述 */
    desc: string;
    /** 文章主图 */
    orgthumb: string;
    playtime: number;
    pv: string;
}
