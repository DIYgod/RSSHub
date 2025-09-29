import { Route } from '@/types';
import got from '@/utils/got';
import iconv from 'iconv-lite';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:id',
    categories: ['anime'],
    example: '/laimanhua/tiandikangzhanjiVERSUS',
    parameters: { id: '漫画 ID，可在 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['www.laimanhua8.com/kanmanhua/:id'],
        },
    ],
    name: '漫画列表',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const baseUrl = `https://www.laimanhua8.com`;
    const link = `${baseUrl}/kanmanhua/${id}/`;

    const { data: response } = await got(link, {
        responseType: 'buffer',
    });
    let $ = load(iconv.decode(response, 'utf-8'));
    const charset = $('meta[http-equiv="Content-Type"]')
        .attr('content')
        ?.match(/charset=(.*)/)?.[1];
    if (charset?.toLowerCase() !== 'utf-8') {
        $ = load(iconv.decode(response, charset ?? 'utf-8'));
    }

    const items = $('.plist a')
        .toArray()
        .map((item, index) => {
            item = $(item);
            return {
                title: item.attr('title'),
                link: `${baseUrl}${item.attr('href')}`,
                pubDate: index === 0 ? parseDate($('head meta[property="og:novel:update_time"]').attr('content')) : null,
                author: $('head meta[property="og:novel:author"]').attr('content'),
            };
        });

    return {
        title: `${$('head meta[property="og:novel:book_name"]').attr('content')} - 来漫画`,
        description: $('.introduction').text(),
        image: $('head meta[property="og:image"]').attr('content'),
        link,
        item: items,
    };
}
