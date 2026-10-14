import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const options = {
    '103': '财经资讯',
    '508': '科技资讯',
    '106': '商业资讯',
    '632': '消费资讯',
    '630': '医疗资讯',
    '119': '康养资讯',
    '004': '汽车资讯',
    '009': '房产资讯',
    '629': 'ESG 资讯',
    '010': 'A股资讯',
    '001': '港股资讯',
    '102': '美股资讯',
    '113': '银行资讯',
    '115': '保险资讯',
    '104': '基金资讯',
    '503': '私募资讯',
    '112': '信托资讯',
    '007': '外汇资讯',
    '107': '期货资讯',
    '118': '债券资讯',
    '603': '券商资讯',
    '105': '观点',
};

export const route: Route = {
    path: '/:channelNum',
    categories: ['finance'],
    example: '/jrj/103',
    parameters: {
        channelNum: {
            description: '栏目编号',
            options: Object.entries(options).map(([value, label]) => ({ value, label })),
        },
    },
    url: 'www.jrj.com.cn',
    name: '资讯',
    description: `| column | Description |
| ------ | ----------- |
| 103    | 财经资讯    |
| 508    | 科技资讯    |
| 106    | 商业资讯    |
| 632    | 消费资讯    |
| 630    | 医疗资讯    |
| 119    | 康养资讯    |
| 004    | 汽车资讯    |
| 009    | 房产资讯    |
| 629    | ESG 资讯    |
| 001    | 港股资讯    |
| 102    | 美股资讯    |
| 113    | 银行资讯    |
| 115    | 保险资讯    |
| 104    | 基金资讯    |
| 503    | 私募资讯    |
| 112    | 信托资讯    |
| 007    | 外汇资讯    |
| 107    | 期货资讯    |
| 118    | 债券资讯    |
| 603    | 券商资讯    |
| 105    | 观点        |`,
    maintainers: ['p3psi-boo'],
    handler,
};

async function handler(ctx) {
    const channelNum = ctx.req.param('channelNum');

    const url = 'https://gateway.jrj.com/jrj-news/news/queryNewsList';

    const response = await ofetch(url, {
        method: 'post',
        body: {
            sortBy: 1,
            pageSize: 20,
            makeDate: '',
            channelNum,
            infoCls: '',
        },
    });

    const alist = response.data.data;

    const list: Array<DataItem & { link: string }> = alist.map((item) => {
        const link = item.pcInfoUrl;
        const title = item.title;
        const author = item.paperMediaSource;
        const pubDate = item.makeDate ? parseDate(item.makeDate) : undefined;

        return {
            title,
            link,
            author,
            pubDate,
        };
    });

    const items = await pMap(
        list,
        async (item) => ({
            ...item,
            description: await cache.tryGet(`jrj:article:${item.link}`, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                return $('.article_content').html();
            }),
        }),
        { concurrency: 3 }
    );

    return {
        title: `${options[channelNum]} - 金融界`,
        link: 'https://jrj.com',
        item: items,
    };
}
