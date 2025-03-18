import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

import { defaultDomain, getRootUrl } from './utils';

export const route: Route = {
    path: '/album/:id',
    categories: ['anime'],
    example: '/18comic/album/292282',
    parameters: { id: '专辑 id，可在专辑页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['jmcomic.group/'],
        },
    ],
    name: '专辑',
    maintainers: ['nczitzk'],
    handler,
    url: 'jmcomic.group/',
    description: `::: tip
  专辑 id 不包括 URL 中标题的部分。
:::`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const { domain = defaultDomain } = ctx.req.query();
    const rootUrl = getRootUrl(domain);

    const currentUrl = `${rootUrl}/album/${id}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const category = $('span[data-type="tags"]')
        .first()
        .find('a')
        .toArray()
        .map((c) => $(c).text());
    const author = $('span[data-type="author"]')
        .first()
        .find('a')
        .toArray()
        .map((a) => $(a).text())
        .join(', ');

    let items = $('.btn-toolbar')
        .first()
        .find('a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
                guid: `https://18comic.org${item.attr('href')}`,
                pubDate: parseDate(item.find('.hidden-xs').text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.guid, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('.tab-content').remove();

                item.author = author;
                item.category = category;
                item.description = `<img src="${content('.thumb-overlay-albums img[data-original]')
                    .toArray()
                    .map((image) => content(image).attr('data-original'))
                    .join('"><img src="')}">`;

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
        description: $('meta[property="og:description"]').attr('content'),
    };
}
