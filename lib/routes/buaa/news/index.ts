import { Route, Data, DataItem } from '@/types';
import { Context } from 'hono';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news/:type',
    categories: ['university'],
    example: '/buaa/news/zhxw',
    parameters: { type: '新闻版块' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '新闻网',
    maintainers: ['AlanDecode'],
    handler,
    description: `| 综合新闻 | 信息公告 | 学术文化    | 校园风采 | 科教在线 | 媒体北航 | 专题新闻 | 北航人物 |
| -------- | -------- | ----------- | -------- | -------- | -------- | -------- | -------- |
| zhxw     | xxgg_new | xsjwhhd_new | xyfc_new | kjzx_new | mtbh_new | ztxw     | bhrw     |`,
};

async function handler(ctx: Context): Promise<Data> {
    const baseUrl = 'https://news.buaa.edu.cn';
    const type = ctx.req.param('type');

    const { data: response, url: link } = await got(`${baseUrl}/${type}.htm`);

    const $ = load(response);
    const title = $('.subnav span').text().trim();
    const list: DataItem[] = $('.mainleft > .listlefttop > .listleftop1')
        .toArray()
        .map((item_) => {
            const item = $(item_);
            const title = item.find('h2 > a');
            return {
                title: title.text(),
                link: new URL(title.attr('href')!, baseUrl).href,
                pubDate: timezone(parseDate(item.find('h2 em').text(), '[YYYY-MM-DD]'), +8),
            };
        });

    const result = (await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const response = await got(item.link);
                const $ = load(response.data);

                item.description = $('.v_news_content').html() || '';
                item.author = $('.vsbcontent_end').text().trim();

                return item;
            })
        )
    )) as DataItem[];

    return {
        title: `北航新闻 - ${title}`,
        link,
        description: `北京航空航天大学新闻网 - ${title}`,
        language: 'zh-CN',
        item: result,
    };
}
