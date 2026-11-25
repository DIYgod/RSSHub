import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

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

    const link = `${baseUrl}/${type}.htm`;
    const { data: response } = await got(link);

    const $ = load(response);
    const title = $('.position-box a').last().text();
    const list: DataItem[] = $('.twlist > ul > li')
        .toArray()
        .map((item_) => {
            const item = $(item_);
            const title = item.find('.pub_info h3');
            const link = item.find('a');
            const yearMonth = item.find('.pub_date span').text();
            const day = item.find('.pub_date b').text();
            return {
                title: title.text(),
                link: new URL(link.attr('href')!, baseUrl).href,
                pubDate: parseDate(`${yearMonth.replace('.', '-')}-${day}`, 'YYYY-MM-DD', 8),
            };
        });
    const result = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const response = await got(item.link);
                const $ = load(response.data);

                item.description = $('.v_news_content').html();
                item.author = $('.vsbcontent_end').text().trim();

                return item;
            })
        )
    );

    return {
        title: `北航新闻 - ${title}`,
        link,
        description: `北京航空航天大学新闻网 - ${title}`,
        language: 'zh-CN',
        item: result,
    };
}
