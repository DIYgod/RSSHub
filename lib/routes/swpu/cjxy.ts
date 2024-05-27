import { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import got from '@/utils/got';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/cjxy/:code',
    categories: ['university'],
    example: '/swpu/cjxy/xyxw',
    parameters: { code: '栏目代码' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
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
    name: '财经学院',
    maintainers: ['RiverTwilight'],
    handler,
    url: 'swpu.edu.cn/',
    description: `| 栏目 | 学院新闻 | 学院通知 |
  | ---- | -------- | -------- |
  | 代码 | xyxw     | xytz     |`,
};

async function handler(ctx) {
    const url = `https://www.swpu.edu.cn/nccjxy/xydt/${ctx.req.param('code')}.htm`;

    const res = await got(url);
    const $ = load(res.data);

    let title = $('title').text();
    title = title.substring(0, title.indexOf('-'));

    const items = $('.main_conRCb > ul > li')
        .toArray()
        .map((elem) => ({
            title: $('a[href]', elem).text().trim(),
            pubDate: timezone(parseDate($('span', elem).text(), 'YYYY年MM月DD日'), +8),
            link: `https://www.swpu.edu.cn/nccjxy/${$('a[href]', elem).attr('href').split('../')[1]}`,
        }));

    const out = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const res = await got(item.link);
                const $ = load(res.data);
                if ($('title').text().startsWith('系统提示')) {
                    item.author = '系统';
                    item.description = '无权访问';
                } else {
                    item.author = '财经学院';
                    item.description = $('.v_news_content').html();
                    for (const elem of $('.v_news_content p')) {
                        if ($(elem).css('text-align') === 'right') {
                            item.author = $(elem).text();
                            break;
                        }
                    }
                }
                return item;
            })
        )
    );

    return {
        title: `西南石油大学财经学院 ${title}`,
        link: url,
        description: `西南石油大学财经学院 ${title}`,
        language: 'zh-CN',
        item: out,
    };
}
