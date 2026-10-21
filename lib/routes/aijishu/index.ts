import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

import utils, { rootUrl } from './utils';

export const route: Route = {
    path: '/:type/:name?',
    categories: ['programming'],
    example: '/aijishu/channel/ai',
    parameters: { type: '文章类型，可以取值如下', name: '名字，取自URL' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '频道、专栏、用户',
    maintainers: ['bigfei'],
    handler,
    description: `| type    | 说明 |
| ------- | ---- |
| channel | 频道 |
| blog    | 专栏 |
| u       | 用户 |`,
};

async function handler(ctx) {
    const { type, name = 'newest' } = ctx.req.param();
    const u = name === 'newest' ? `${rootUrl}/` : `${rootUrl}/${type}/${name}`;
    const html = await got(u);

    const $ = load(html.data);
    const title = $('title').text();
    const apiPath = $('[data-js-stream-load-more]').attr('data-api-url');
    let list;
    if (apiPath) {
        const apiUrl = new URL(apiPath, rootUrl);
        apiUrl.searchParams.set('page', '1');
        const response = await got(apiUrl.href);
        list = response.data.data.rows;
    } else {
        list = $('[data-js-stream-list] > li')
            .toArray()
            .map((element) => {
                const item = $(element);
                const article = item.find('a.ent-link-item[href^="/a/"]');
                return {
                    title: article.find('h3').text(),
                    url: article.attr('href'),
                    createdDate: item
                        .find('span.text-secondary')
                        .first()
                        .text()
                        .replace(/^·\s*/, '')
                        .trim(),
                };
            });
    }

    const articles = list.filter((item) => item?.url?.startsWith('/a/') || item?.object?.url?.startsWith('/a/'));
    const items = await Promise.all(articles.map((item) => utils.parseArticle(item)));

    return {
        title: title.split(' - ').slice(0, 2).join(' - '),
        link: u,
        item: items,
    };
}
