import { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import randUserAgent from '@/utils/rand-user-agent';

const UA = randUserAgent({ browser: 'mobile safari', os: 'ios', device: 'mobile' });

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

    const response = await ofetch(currentUrl);

    const $ = load(response);

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
                const detailResponse = await ofetch(item.link, {
                    headers: {
                        'User-Agent': UA,
                    },
                });

                const content = load(detailResponse);

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
                } else if (item.link.includes('events')) {
                    const eventDetails = await ofetch(`https://www.bagevent.com/event/${item.link.match(/\d+/)[0]}`);
                    const $event = load(eventDetails);
                    item.description = $event('.page_con').html();
                } else if (item.link.includes('zhuanlan')) {
                    item.description += content('.mod-word').html();
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
