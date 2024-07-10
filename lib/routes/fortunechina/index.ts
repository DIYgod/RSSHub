import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    categories: ['new-media'],
    example: '/fortunechina',
    parameters: { category: '分类，见下表，默认为首页' },
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
            source: ['fortunechina.com/:category', 'fortunechina.com/'],
        },
    ],
    name: '分类',
    maintainers: ['nczitzk'],
    handler,
    description: `| 商业    | 领导力    | 科技 | 研究   |
  | ------- | --------- | ---- | ------ |
  | shangye | lindgaoli | keji | report |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';

    const rootUrl = 'https://www.fortunechina.com';
    const currentUrl = `${rootUrl}${category ? `/${category}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.main')
        .find(category === '' ? 'a:has(h2)' : 'h2 a')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 15)
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href');

            return {
                title: item.text(),
                link: link.indexOf('http') === 0 ? link : `${currentUrl}/${item.attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
                    },
                });

                const content = load(detailResponse.data);

                const spans = content('.date').text();
                let matches = spans.match(/(\d{4}-\d{2}-\d{2})/);
                if (matches) {
                    item.pubDate = parseDate(matches[1]);
                } else {
                    matches = spans.match(/(\d+小时前)/);
                    if (matches) {
                        item.pubDate = parseRelativeDate(matches[1]);
                    }
                }

                item.author = content('.author').text();

                content('.mod-info, .title, .eval-zan, .eval-pic, .sae-more, .ugo-kol, .word-text .word-box .word-cn').remove();

                item.description = content(item.link.includes('content') ? '.contain .text' : '.contain .top').html();
                if (item.link.includes('jingxuan')) {
                    item.description += content('.eval-mod_ugo').html();
                }

                return item;
            })
        )
    );

    return {
        title: category ? $('title').text() : '财富中文网',
        link: currentUrl,
        item: items,
    };
}
