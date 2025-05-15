import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: ['/u/:uid', '/user/:id'],
    categories: ['programming'],
    example: '/oschina/u/3920392',
    parameters: { uid: '用户 id，可通过查看用户博客网址得到，以 u/数字结尾，数字即为 id' },
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
            source: ['my.oschina.net/u/:uid'],
        },
    ],
    name: '数字型账号用户博客',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const { id, uid } = ctx.req.param();
    const res = id ? await got(`https://my.oschina.net/${id}`) : await got(`https://my.oschina.net/u/${uid}`);
    const $ = load(res.data);

    const author = $('.user-name .name').text();
    const list = $('#newestBlogList .blog-item')
        .toArray()
        .map((item) => {
            item = $(item);
            const date = item.find('.extra div .item:nth-of-type(2)').text();
            const accessible = !item.find('div.label[data-tooltip=审核中]').length;
            item.find('.label').remove();
            return {
                title: item.find('.content a.header').text(),
                description: item.find('.description p').text(),
                link: item.find('a.header').attr('href'),
                pubDate: timezone(/\//.test(date) ? parseDate(date, ['YYYY/MM/DD HH:mm', 'MM/DD HH:mm']) : parseRelativeDate(date), +8),
                author,
                accessible,
            };
        });

    const resultItem = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.accessible) {
                    const detail = await got(item.link);
                    const content = load(detail.data);

                    item.description = content('.article-detail').html();
                }
                delete item.accessible;
                return item;
            })
        )
    );

    return {
        title: author + '的博客',
        description: $('.user-text .user-signature').text(),
        link: `https://my.oschina.net/u/${id ?? uid}`,
        item: resultItem,
    };
}
