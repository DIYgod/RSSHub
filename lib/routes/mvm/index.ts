import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    categories: ['journal'],
    example: '/mvm',
    parameters: { category: '分类，见下表，默认为本期要目' },
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
            source: ['mwm.net.cn/web/:category', 'mwm.net.cn/'],
        },
    ],
    name: '分类',
    maintainers: ['nczitzk'],
    handler,
    description: `| 本期要目 | 网络首发 | 学术活动 | 通知公告 |
  | -------- | -------- | -------- | -------- |
  | bqym     | wlsf     | xshd     | tzgg     |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'bqym';

    const rootUrl = 'http://www.mwm.net.cn';
    const currentUrl = `${rootUrl}/web/${category === 'bqym' ? `bqym?pagesize=${ctx.req.query('limit') ?? 100}` : category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    $('.n_date').remove();

    let items = $('.n_title, .con1_text')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content('.mrt20').html();
                item.author = content('.mrl20')
                    .text()
                    .trim()
                    .replace(/作者：/, '');
                item.pubDate = parseDate(content('.date').eq(0).text(), 'YYYY年MM月DD日');

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
