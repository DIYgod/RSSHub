import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

import { defaultDomain, getRootUrl } from './utils';

export const route: Route = {
    path: '/blogs/:category?',
    categories: ['anime'],
    example: '/18comic/blogs',
    parameters: { category: '分类，见下表，默认为空即全部' },
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
    name: '文庫',
    maintainers: ['nczitzk'],
    handler,
    url: 'jmcomic.group/',
    description: `分类

  | 全部 | 紳夜食堂 | 遊戲文庫 | JG GAMES | 模型山下 |
  | ---- | -------- | -------- | -------- | -------- |
  |      | dinner   | raiders  | jg       | figure   |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';
    const { domain = defaultDomain } = ctx.req.query();
    const rootUrl = getRootUrl(domain);

    const currentUrl = `${rootUrl}/blogs${category ? `/${category}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.title')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.parent().attr('href')}`,
                guid: `https://18comic.org${item.parent().attr('href')}`,
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

                item.pubDate = parseDate(content('.date').first().text());

                content('.d-flex').remove();

                item.author = content('.blog_name_id').first().text();
                item.description = content('.blog_content').html();
                item.category = content('.panel-heading dropdown-toggle')
                    .toArray()
                    .map((c) => $(c).text());

                return item;
            })
        )
    );

    return {
        title: $('title')
            .text()
            .replace(/最新的/, $('.article-nav .active').text()),
        link: currentUrl,
        item: items,
        description: $('meta[property="og:description"]').attr('content'),
    };
}
