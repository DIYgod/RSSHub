import { DataItem, Route, Data } from '@/types';
import cache from '@/utils/cache';
import { joinUrl } from './utils';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import got from '@/utils/got';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/dxy/:code',
    categories: ['university'],
    example: '/swpu/dxy/1156',
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
    name: '电气信息学院',
    maintainers: ['CYTMWIA'],
    handler,
    url: 'swpu.edu.cn/',
    description: `| 栏目 | 学院新闻 | 学院通知 |
  | ---- | -------- | -------- |
  | 代码 | 1122     | 1156     |`,
};

async function handler(ctx): Promise<Data> {
    // 移除 urltype=tree.TreeTempUrl 虽然也能顺利访问页面，
    // 但标题会缺失，而且在其他地方定位提取标题也比较麻烦。
    const url = `https://www.swpu.edu.cn/dxy/list1.jsp?urltype=tree.TreeTempUrl&wbtreeid=${ctx.req.param('code')}`;

    const res = await got.get(url);
    const $ = load(res.data);

    let title = $('title').text();
    title = title.substring(0, title.indexOf('-'));

    // 获取标题、时间及链接
    const items: DataItem[] = $('tr[height="20"]')
        .toArray()
        .map((elem) => ({
            title: $('a[title]', elem).text().trim(),
            pubDate: timezone(parseDate($('td:eq(1)', elem).text(), 'YYYY年MM月DD日'), +8),
            link: joinUrl('https://www.swpu.edu.cn/dxy/', $('a[title]', elem).attr('href')),
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
                        item.author = '电气信息学院';
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
        title: `西南石油大学电气信息学院 ${title}`,
        link: url,
        description: `西南石油大学电气信息学院 ${title}`,
        language: 'zh-CN',
        item: out,
    };
}
