import { DataItem, Route, Data } from '@/types';
import cache from '@/utils/cache';
import { joinUrl } from './utils';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import got from '@/utils/got';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/bgw/:code',
    categories: ['university'],
    example: '/swpu/bgw/zytzgg',
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
    name: '办公网',
    maintainers: ['CYTMWIA'],
    handler,
    url: 'swpu.edu.cn/',
    description: `| 栏目 | 重要通知公告 | 部门通知公告 | 本周活动 |
| ---- | ------------ | ------------ | -------- |
| 代码 | zytzgg       | bmtzgg       | bzhd     |`,
};

async function handler(ctx): Promise<Data> {
    const url = `https://www.swpu.edu.cn/bgw/${ctx.req.param('code')}.htm`;

    const res = await got.get(url);
    const $ = load(res.data);

    const title = $('.title').text();

    // 获取标题、时间及链接
    const items: DataItem[] = $('.notice > ul > li > a')
        .toArray()
        .map((elem) => ({
            title: $(elem.children[0]).text(),
            pubDate: timezone(parseDate($(elem.children[1]).text()), +8),
            link: joinUrl('https://www.swpu.edu.cn', $(elem).attr('href')), // 实际获得连接 "../info/1312/17891.htm"
        }));

    // 请求全文
    const out: DataItem[] = await Promise.all(
        items.map(
            async (item: DataItem) =>
                (await cache.tryGet(item.link!, async () => {
                    const resp = await got.get(item.link);
                    const $ = load(resp.data);
                    if ($('title').text().startsWith('系统提示')) {
                        item.author = '系统';
                        item.description = '无权访问';
                    } else {
                        item.author = '办公网';
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
        title: `西南石油大学办公网 ${title}`,
        link: url,
        description: `西南石油大学办公网 ${title} 列表`,
        language: 'zh-CN',
        item: out,
    };
}
