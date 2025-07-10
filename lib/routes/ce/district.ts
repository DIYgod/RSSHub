import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { load } from 'cheerio';
import { ofetch } from 'ofetch';

export const route: Route = {
    path: '/district/:category?',
    name: '地方经济',
    url: 'district.ce.cn',
    maintainers: ['cscnk52'],
    handler,
    example: '/ce/district',
    parameters: { category: '栏目标识，默认为 roll（即时新闻）' },
    description: `| 即时新闻 | 经济动态 | 独家视角 | 专题 | 数说地方 | 地方播报 | 专稿 | 港澳台 |
|----------|----------|----------|------|----------|----------|------|--------|
| roll     | jjdt     | poll     | ch   | ssdf     | dfbb     | zg   | gat    |`,
    categories: ['traditional-media'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    radar: [
        {
            source: ['district.ce.cn/newarea/:category/index.shtml'],
            target: '/district/:category?',
        },
        {
            source: ['district.ce.cn/newarea/:category'],
            target: '/district/:category?',
        },
        {
            source: ['district.ce.cn'],
            target: '/district',
        },
    ],
    view: ViewType.Articles,
};

async function handler(ctx) {
    const rootUrl = 'http://district.ce.cn/';
    const { category = 'roll' } = ctx.req.param();
    const url = `${rootUrl}newarea/${category}/index.shtml`;
    const GB2312Response = await ofetch(url, { responseType: 'arrayBuffer' });

    // originally site use gb2312 encoding
    const response = new TextDecoder('gb2312').decode(new Uint8Array(GB2312Response));
    const $ = load(response);

    const bigTitle = $('div.channl a').eq(1).attr('title');

    const list = $('div.sec_left li')
        .toArray()
        .map((e) => {
            const element = $(e);
            const title = element.find('a').text().trim();
            const link = new URL(element.find('a').attr('href'), url).href;
            return {
                title,
                link,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const GB2312Response = await ofetch(item.link, { responseType: 'arrayBuffer' });
                const response = new TextDecoder('gb2312').decode(new Uint8Array(GB2312Response));
                const $ = load(response);

                const pubDateText = $('span#articleTime').text().trim();
                item.pubDate = timezone(parseDate(pubDateText, 'YYYY年MM月DD日 HH:mm'), +8);

                item.description = $('div.TRS_Editor').html();
                return item;
            })
        )
    );

    return {
        title: `中国经济网地方经济 - ${bigTitle}`,
        link: url,
        item: items,
    };
}
