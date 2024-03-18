import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

import { rootUrl, getItems, getItemInfo, processItems } from './util';

export const route: Route = {
    path: '/:id?/:downLinkType?',
    categories: ['multimedia'],
    example: '/newzmz/qEzRyY3v',
    parameters: { id: '剧集 id，可在剧集下载页 URL 中找到', downLinkType: '下载链接类型，默认为磁力链' },
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
            source: ['newzmz.com/'],
            target: '',
        },
    ],
    name: '指定剧集',
    maintainers: ['nczitzk'],
    handler,
    url: 'newzmz.com/',
    description: `:::tip
  [雪国列车 (剧版)](https://nzmz.xyz/details-qEzRyY3v.html) 的下载页 URL 为 \`https://v.ys99.xyz/view/qEzRyY3v.html\`，即剧集 id 为 \`qEzRyY3v\`
  :::`,
};

async function handler(ctx) {
    const { id = '1', downLinkType = '磁力链' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    // If the id is not composed solely of digits,
    // then consider it as the id of a movie or TV show;
    // otherwise, consider it as the id for the category.

    const isCategory = !isNaN(id);

    const currentUrl = new URL(isCategory ? 'index.html' : `details-${id}.html`, rootUrl).href;

    const response = await cache.tryGet(currentUrl, async () => {
        const { data: response } = await got(currentUrl);

        return response;
    });

    const $ = load(response);

    // If a category id is specified,
    // retrieve all movies and TV shows from that category
    // and add them to the "to be processed" array.
    // Otherwise, if only a specific TV show or movie ID is provided,
    // add that item alone to the "to be processed" array.

    let items = isCategory
        ? await getItems(cache.tryGet, currentUrl, id, 'div.rowMod', 'ul.slides li a')
        : [
              {
                  link: currentUrl,
              },
          ];

    items = await Promise.all(items.slice(0, limit).map((item) => getItemInfo(cache.tryGet, item.link)));

    // If the link of the entry is "#",
    // it indicates that there are currently no relevant resources available for that specific item.

    items = await Promise.all(items.filter((item) => item.link !== '#').map((i) => processItems(i, downLinkType, 'div.team-con-area', 'div.item-label a', 'ul.team-icons li')));

    items = items.flat();

    const headerTitle = isCategory ? $('div.rowMod').eq(Number.parseInt(id, 10)).find('h2.row-header-title').text() : '';
    const title = `${$('title').text()}${headerTitle ? ` - ${headerTitle}` : ''}`;
    const icon = $('link[rel="shortcut icon"]').prop('href');

    return {
        item: isCategory ? items : items.slice(0, limit),
        title,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh-cn',
        image: $('img.logo-img').prop('src'),
        icon,
        logo: icon,
        subtitle: $('meta[name="keywords"]').prop('content'),
        author: title,
        allowEmpty: true,
    };
}
