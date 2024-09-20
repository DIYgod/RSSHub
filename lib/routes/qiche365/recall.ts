import { Route, Data, DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.qiche365.org.cn';

export const route: Route = {
    path: '/recall/:channel',
    name: '汽车召回',
    example: '/qiche365/recall/1',
    parameters: { channel: '频道，见下表' },
    description: `| 国内召回新闻 | 国内召回公告 | 国外召回新闻 | 国外召回公告 |
  | ------------ | ------------ | ------------ | ------------ |
  | 1            | 2            | 3            | 4            |`,
    categories: ['government'],
    maintainers: ['huanfe1'],
    handler,
    url: 'qiche365.org.cn/index/recall/index.html',
};

async function handler(ctx): Promise<Data> {
    const { channel } = ctx.req.param();
    const link = `https://www.qiche365.org.cn/index/recall/index/item/${channel}.html?loadmore=1`;

    const html = await cache.tryGet(link, async () => {
        const { html } = await ofetch(link, {
            method: 'get',
            headers: {
                'Accept-Language': 'zh-CN,zh;q=0.9',
            },
        });
        return html;
    });

    const $ = load(<string>html);
    const items: DataItem[] = $('li')
        .toArray()
        .map((item) => {
            const cheerioItem = $(item);
            return {
                title: cheerioItem.find('h1').text(),
                link: cheerioItem.find('a').attr('href'),
                pubDate: timezone(parseDate(cheerioItem.find('h2').html()!.match('</i>(.*?)<b>')![1]), +8),
                description: cheerioItem.find('p').text().trim(),
                author: cheerioItem.find('h3 span').text(),
                image: `${baseUrl}${cheerioItem.find('img').attr('src')}`,
            };
        });
    return {
        allowEmpty: true,
        title: ['国内召回公告', '国内召回新闻', '国外召回公告', '国外召回新闻'][channel - 1],
        link: 'https://www.qiche365.org.cn/index/recall/index.html',
        item: items,
    };
}
