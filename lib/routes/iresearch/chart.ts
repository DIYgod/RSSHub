import path from 'node:path';

import { type CheerioAPI, load } from 'cheerio';
import { type Context } from 'hono';

import { type DataItem, type Route, type Data, ViewType } from '@/types';

import { art } from '@/utils/render';
import { getCurrentPath } from '@/utils/helpers';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const __dirname = getCurrentPath(import.meta.url);

const categoryMap = {
    媒体文娱: 59,
    广告营销: 89,
    游戏行业: 90,
    视频媒体: 91,
    消费电商: 69,
    电子商务: 86,
    消费者洞察: 87,
    旅游行业: 88,
    汽车行业: 80,
    教育行业: 63,
    企业服务: 60,
    网络服务: 84,
    应用服务: 85,
    AI大数据: 65,
    人工智能: 83,
    物流行业: 75,
    金融行业: 70,
    支付行业: 82,
    房产行业: 68,
    医疗健康: 62,
    先进制造: 61,
    能源环保: 77,
    区块链: 76,
    其他: 81,
};

export const handler = async (ctx: Context): Promise<Data> => {
    const { category: categoryName } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '100', 10);

    const rootUrl: string = 'https://www.iresearch.com.cn';
    const apiUrl = new URL('api/products/getdatasapi', rootUrl).href;

    const category = categoryMap[categoryName] || undefined;

    const targetUrl: string = new URL(`report.shtml?type=4${category ? `&classId=${category}` : ''}`, rootUrl).href;

    const response = await ofetch(apiUrl, {
        query: {
            rootId: 14,
            channelId: category ?? '',
            userId: '',
            lastId: '',
            pageSize: limit,
        },
    });

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language: string = $('html').prop('lang') ?? 'zh-cn';

    const items: DataItem[] = response.List.slice(0, limit).map((item) => ({
        title: `${item.Title} - ${item.sTitle}`,
        link: new URL(`chart/detail?id=${item.Id}`, rootUrl).href,
        description: art(path.join(__dirname, 'templates/chart.art'), {
            images: [
                {
                    src: item.SmallImg,
                    alt: item.Title,
                },
                {
                    src: item.BigImg,
                    alt: item.sTitle,
                },
            ],
            newsId: item.NewsId,
        }),
        author: item.Author,
        category: [...new Set([item.sTitle, item.industry, ...item.Keyword])].filter(Boolean),
        guid: `iresearch.${item.Id}`,
        pubDate: timezone(parseDate(item.Uptime), +8),
    }));

    const author = $('title').text();

    return {
        title: `${author} | 研究图表${category ? ` - ${categoryName}` : ''}`,
        description: $('meta[property="og:description"]').prop('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        author,
        language,
        id: targetUrl,
    };
};

export const route: Route = {
    path: '/chart/:category?',
    name: '研究图表',
    url: 'www.iresearch.com.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/iresearch/chart',
    parameters: {
        category: '分类，见下表',
    },
    description: `
| 媒体文娱 | 广告营销   | 游戏行业 | 视频媒体  | 消费电商 |
| -------- | ---------- | -------- | --------- | -------- |
| 电子商务 | 消费者洞察 | 旅游行业 | 汽车行业  | 教育行业 |
| 企业服务 | 网络服务   | 应用服务 | AI 大数据 | 人工智能 |
| 物流行业 | 金融行业   | 支付行业 | 房产行业  | 医疗健康 |
| 先进制造 | 新能源     | 区块链   | 其他      |          |
`,
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
            title: '研究图表 - 媒体文娱',
            source: ['https://www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const isChart = urlObj.searchParams.get('type') === '4';

                return isChart ? '/iresearch/chart/媒体文娱' : '';
            },
        },
        {
            title: '研究图表 - 广告营销',
            source: ['https://www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const isChart = urlObj.searchParams.get('type') === '4';

                return isChart ? '/iresearch/chart/广告营销' : '';
            },
        },
        {
            title: '研究图表 - 游戏行业',
            source: ['https://www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const isChart = urlObj.searchParams.get('type') === '4';

                return isChart ? '/iresearch/chart/游戏行业' : '';
            },
        },
        {
            title: '研究图表 - 视频媒体',
            source: ['https://www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const isChart = urlObj.searchParams.get('type') === '4';

                return isChart ? '/iresearch/chart/视频媒体' : '';
            },
        },
        {
            title: '研究图表 - 消费电商',
            source: ['https://www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const isChart = urlObj.searchParams.get('type') === '4';

                return isChart ? '/iresearch/chart/消费电商' : '';
            },
        },
        {
            title: '研究图表 - 电子商务',
            source: ['https://www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const isChart = urlObj.searchParams.get('type') === '4';

                return isChart ? '/iresearch/chart/电子商务' : '';
            },
        },
        {
            title: '研究图表 - 消费者洞察',
            source: ['https://www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const isChart = urlObj.searchParams.get('type') === '4';

                return isChart ? '/iresearch/chart/消费者洞察' : '';
            },
        },
        {
            title: '研究图表 - 旅游行业',
            source: ['https://www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const isChart = urlObj.searchParams.get('type') === '4';

                return isChart ? '/iresearch/chart/旅游行业' : '';
            },
        },
        {
            title: '研究图表 - 汽车行业',
            source: ['https://www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const isChart = urlObj.searchParams.get('type') === '4';

                return isChart ? '/iresearch/chart/汽车行业' : '';
            },
        },
        {
            title: '研究图表 - 教育行业',
            source: ['https://www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const isChart = urlObj.searchParams.get('type') === '4';

                return isChart ? '/iresearch/chart/教育行业' : '';
            },
        },
        {
            title: '研究图表 - 企业服务',
            source: ['https://www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const isChart = urlObj.searchParams.get('type') === '4';

                return isChart ? '/iresearch/chart/企业服务' : '';
            },
        },
        {
            title: '研究图表 - 网络服务',
            source: ['https://www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const isChart = urlObj.searchParams.get('type') === '4';

                return isChart ? '/iresearch/chart/网络服务' : '';
            },
        },
        {
            title: '研究图表 - 应用服务',
            source: ['https://www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const isChart = urlObj.searchParams.get('type') === '4';

                return isChart ? '/iresearch/chart/应用服务' : '';
            },
        },
        {
            title: '研究图表 - AI大数据',
            source: ['https://www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const isChart = urlObj.searchParams.get('type') === '4';

                return isChart ? '/iresearch/chart/AI大数据' : '';
            },
        },
        {
            title: '研究图表 - 人工智能',
            source: ['https://www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const isChart = urlObj.searchParams.get('type') === '4';

                return isChart ? '/iresearch/chart/人工智能' : '';
            },
        },
        {
            title: '研究图表 - 物流行业',
            source: ['https://www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const isChart = urlObj.searchParams.get('type') === '4';

                return isChart ? '/iresearch/chart/物流行业' : '';
            },
        },
        {
            title: '研究图表 - 金融行业',
            source: ['https://www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const isChart = urlObj.searchParams.get('type') === '4';

                return isChart ? '/iresearch/chart/金融行业' : '';
            },
        },
        {
            title: '研究图表 - 支付行业',
            source: ['https://www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const isChart = urlObj.searchParams.get('type') === '4';

                return isChart ? '/iresearch/chart/支付行业' : '';
            },
        },
        {
            title: '研究图表 - 房产行业',
            source: ['https://www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const isChart = urlObj.searchParams.get('type') === '4';

                return isChart ? '/iresearch/chart/房产行业' : '';
            },
        },
        {
            title: '研究图表 - 医疗健康',
            source: ['https://www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const isChart = urlObj.searchParams.get('type') === '4';

                return isChart ? '/iresearch/chart/医疗健康' : '';
            },
        },
        {
            title: '研究图表 - 先进制造',
            source: ['https://www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const isChart = urlObj.searchParams.get('type') === '4';

                return isChart ? '/iresearch/chart/先进制造' : '';
            },
        },
        {
            title: '研究图表 - 新能源',
            source: ['https://www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const isChart = urlObj.searchParams.get('type') === '4';

                return isChart ? '/iresearch/chart/新能源' : '';
            },
        },
        {
            title: '研究图表 - 区块链',
            source: ['https://www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const isChart = urlObj.searchParams.get('type') === '4';

                return isChart ? '/iresearch/chart/区块链' : '';
            },
        },
        {
            title: '研究图表 - 其他',
            source: ['https://www.iresearch.com.cn/report.shtml'],
            target: (_, url) => {
                const urlObj = new URL(url);
                const isChart = urlObj.searchParams.get('type') === '4';

                return isChart ? '/iresearch/chart/其他' : '';
            },
        },
    ],
    view: ViewType.Articles,
};
