import { Route } from '@/types';

import got from '@/utils/got';
import { load } from 'cheerio';

const rootUrl = 'https://www.1lou.me';

export const handler = async (ctx) => {
    const { id } = ctx.req.param();

    const currentUrl = new URL(`thread-${id}.htm`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    const items = [...$('.attachlist li a')]
        .toArray()
        .map((e) => {
            const ele = $(e);
            const section = ele.closest('li.post');

            const title = ele.text();
            const link = new URL(ele.prop('href')!, rootUrl).href;
            const description = section.find('.message > p').first().text();
            const author = section.find('.username').text();

            return {
                title,
                link,
                description,
                author,
                guid: link,
                enclosure_url: link,
                enclosure_type: 'application/x-bittorrent',
                enclosure_title: title,
            };
        });

    const author = 'BT 之家 1LOU 站';
    const image = new URL($('.card .card-body .message img').prop('src') || '', rootUrl).href;

    return {
        title: `${$('title').text().split(/-/)[0]} - ${author}`,
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author,
        language,
    };
};

export const route: Route = {
    path: '/thread/:id',
    name: '帖子',
    url: '1lou.me',
    maintainers: ['liunian'],
    handler,
    example: '/1lou/thread/632532',
    parameters: { id: '帖子 ID' },
    description: `::: tip
  \`1lou.me/thread-xxx.htm\` 中的 xxx，如：https://www.1lou.me/thread-632532.htm
使用通用参数来过滤和限制最大条数
:::`,
    categories: ['multimedia'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: true,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [],
};
