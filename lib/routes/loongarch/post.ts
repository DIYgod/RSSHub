import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';
import cache from '@/utils/cache';
import { load } from 'cheerio';

export const route: Route = {
    path: '/post/:type',
    categories: ['bbs'],
    example: '/loongarch/post/newest',
    parameters: { type: 'top 或 newest' },
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
            source: ['bbs.loongarch.org'],
        },
    ],
    name: '最热 / 最新帖子',
    maintainers: ['ladeng07', '3401797899'],
    handler,
    url: 'bbs.loongarch.org/',
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const link = `https://bbs.loongarch.org/?sort=${type ?? 'newest'}`;
    const response = await got(link);
    const $ = load(response.data, {
        scriptingEnabled: false,
    });

    let title;
    if (type === 'top') {
        title = '最热帖子';
    } else if (type === 'newest') {
        title = '最新帖子';
    }

    const list = $('#flarum-content ul li')
        .toArray()
        .map((e) => {
            e = $(e);
            const a = e.find('a');

            return {
                title: a.text(),
                link: String(a.attr('href')),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data, {
                    scriptingEnabled: false,
                });
                item.author = $('#flarum-content h3:first').text();
                item.description = $('#flarum-content .Post-body').html();
                item.pubDate = parseDate($('meta[name="article:published_time"]').attr('content'));
                return item;
            })
        )
    );

    return {
        title: `LA UOSC-${title}`,
        link,
        description: `LA UOSC-${title}`,
        item: out,
    };
}
