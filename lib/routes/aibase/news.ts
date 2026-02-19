import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { buildApiUrl, rootUrl } from './util';

export const route: Route = {
    path: '/news',
    name: '资讯',
    url: 'www.aibase.com',
    maintainers: ['zreo0'],
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
        const { apiInfoListUrl } = await buildApiUrl($);
        // 获取资讯列表，解析数据
        const data: NewsItem[] = await ofetch(apiInfoListUrl, {
            headers: {
                accept: 'application/json;charset=utf-8',
            },
            query: {
                pagesize: limit,
                page: 1,
                type: 1,
                isen: 0,
            },
        });
        const items = data.map((item) => ({
            // 文章标题
            title: item.title,
            // 文章链接
            link: `https://www.aibase.com/zh/news/${item.Id}`,
            // 文章正文
            description: item.summary,
            // 文章发布日期
            pubDate: parseDate(item.addtime),
            // 文章作者
            author: item.author || 'AI Base',
        }));

        return {
            title: 'AI新闻资讯',
            description: 'AI新闻资讯 - 不错过全球AI革新的每一个时刻',
            language: 'zh-cn',
            link: 'https://www.aibase.com/zh/news',
            item: items,
            allowEmpty: true,
            image,
            author,
        };
    },
    example: '/aibase/news',
    description: '获取 AI 资讯列表',
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
            source: ['www.aibase.com/zh/news'],
            target: '/news',
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
