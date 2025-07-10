import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

import { rootUrl, ossUrl, ProcessFeed } from './utils';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/thinktank/:id/:type?',
    categories: ['reading'],
    example: '/aisixiang/thinktank/WuQine/论文',
    parameters: { id: '专栏 ID，一般为作者拼音，可在URL中找到', type: '栏目类型，参考下表，默认为全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '思想库（专栏）',
    maintainers: ['hoilc', 'nczitzk'],
    handler,
    description: `| 论文 | 时评 | 随笔 | 演讲 | 访谈 | 著作 | 读书 | 史论 | 译作 | 诗歌 | 书信 | 科学 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |`,
};

async function handler(ctx) {
    const { id, type = '' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const currentUrl = new URL(`thinktank/${id}.html`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const title = `${$('h2').first().text().trim()}${type}`;

    let items = [];

    const targetList = $('h3')
        .toArray()
        .filter((h) => (type ? $(h).text() === type : true));
    if (!targetList) {
        throw new InvalidParameterError(`Not found ${type} in ${id}: ${currentUrl}`);
    }

    for (const l of targetList) {
        items = [...items, ...$(l).parent().find('ul li a').toArray()];
    }

    items = items.slice(0, limit).map((item) => {
        item = $(item);

        return {
            title: item.text().split('：').pop(),
            link: new URL(item.prop('href'), rootUrl).href,
        };
    });

    return {
        item: await ProcessFeed(limit, cache.tryGet, items),
        title: `爱思想 - ${title}`,
        link: currentUrl,
        description: $('div.thinktank-author-description-box p').text(),
        language: 'zh-cn',
        image: new URL('images/logo_thinktank.jpg', ossUrl).href,
        subtitle: title,
    };
}
