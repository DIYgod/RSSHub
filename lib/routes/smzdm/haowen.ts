import { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/haowen/:day?',
    categories: ['shopping'],
    example: '/smzdm/haowen/1',
    parameters: {
        day: {
            description: '以天为时间跨度，默认为 `1`',
            options: [
                { value: '1', label: '今日热门' },
                { value: '7', label: '周热门' },
                { value: '30', label: '月热门' },
            ],
            default: '1',
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '好文',
    maintainers: ['LogicJake', 'pseudoyu'],
    handler,
};

async function handler(ctx) {
    const day = ctx.req.param('day') ?? '1';
    const link = `https://post.smzdm.com/hot_${day}/`;

    const response = await ofetch(link);
    const $ = load(response);
    const title = $('li.filter-tab.active').text();

    const list = $('li.feed-row-wide')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('h5.z-feed-title a').text(),
                link: $item.find('h5.z-feed-title a').attr('href'),
                pubDate: timezone(parseDate($item.find('span.z-publish-time').text()), 8),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link ?? '', async () => {
                const response = await ofetch(item.link ?? '');
                const $ = load(response);
                const content = $('#articleId');
                content.find('.item-name').remove();
                content.find('.recommend-tab').remove();

                const releaseDate = $('meta[property="og:release_date"]').attr('content');

                const outItem: DataItem = {
                    title: item.title,
                    link: item.link,
                    description: content.html() || '',
                    pubDate: releaseDate ? timezone(parseDate(releaseDate), 8) : item.pubDate,
                    author: $('meta[property="og:author"]').attr('content') || '',
                };

                return outItem;
            })
        )
    );

    return {
        title: `${title}-什么值得买好文`,
        link,
        item: out.filter((item): item is DataItem => item !== null),
    };
}
