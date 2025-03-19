import { DataItem, Route, Data } from '@/types';
import cache from '@/utils/cache';
import { joinUrl } from './utils';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import got from '@/utils/got';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/scs/:code',
    categories: ['university'],
    example: '/swpu/scs/tzgg',
    parameters: { code: '栏目代码' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['swpu.edu.cn/'],
            target: '',
        },
    ],
    name: '计算机与软件学院',
    maintainers: ['CYTMWIA'],
    handler,
    url: 'swpu.edu.cn/',
    description: `| 栏目 | 通知公告 | 新闻速递 |
| ---- | -------- | -------- |
| 代码 | tzgg     | xwsd     |`,
};

async function handler(ctx): Promise<Data> {
    const url = `https://www.swpu.edu.cn/scs/index/${ctx.req.param('code')}.htm`;

    const res = await got.get(url);
    const $ = load(res.data);

    const title = $('.r_list > h3').text();

    // 获取标题、时间及链接
    const items: DataItem[] = $('.main_conRCb > ul > li')
        .toArray()
        .map((elem) => ({
            title: $('em', elem).text().trim(),
            pubDate: timezone(parseDate($('span', elem).text()), +8),
            link: joinUrl('https://www.swpu.edu.cn/scs/index/', $('a', elem).attr('href')),
        }));

    // 请求全文
    const out = await Promise.all(
        items.map(
            async (item) =>
                (await cache.tryGet(item.link!, async () => {
                    const resp = await got.get(item.link);
                    const $ = load(resp.data);
                    if ($('title').text().startsWith('系统提示')) {
                        item.author = '系统';
                        item.description = '无权访问';
                    } else {
                        item.author = '计算机与软件学院';
                        item.description = $('.v_news_content').html()!;
                        for (const elem of $('.v_news_content p')) {
                            if ($(elem).css('text-align') === 'right') {
                                item.author = $(elem).text();
                                break;
                            }
                        }
                    }
                    return item;
                })) as DataItem
        )
    );

    return {
        title: `西南石油大学计算机与软件学院 ${title}`,
        link: url,
        description: `西南石油大学计算机与软件学院 ${title}`,
        language: 'zh-CN',
        item: out,
    };
}
