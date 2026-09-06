import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    categories: ['new-media'],
    example: '/lifetimes',
    parameters: { category: '栏目，见下表，默认为新闻' },
    name: '栏目',
    maintainers: ['nczitzk'],
    description: `| 新闻 | 医药     | 养生            | 生活 | 母亲行动 | 长寿      | 视频  | 时评         | 调查    | 产业经济 |
| ---- | -------- | --------------- | ---- | -------- | --------- | ----- | ------------ | ------- | -------- |
| news | medicine | healthpromotion | life | mothers  | longevity | video | news-comment | hotspot | industry |`,
    handler,
};

const nodes = {
    hotspot: { title: '调查', node: '%22/eh78c0d1d%22' },
    industry: { title: '产业经济', node: '%22/ehg62mqqm%22' },
    'news-comment': { title: '本报时评', node: '%22/egv8vnjpq/egv8vtbcl%22' },
};

async function handler(ctx: Context) {
    const { category = 'news' } = ctx.req.param();

    const rootUrl = 'https://www.lifetimes.cn';
    const currentUrl = `${rootUrl}/${category.replace('-', '/')}`;

    let title;
    let list;

    const apiNode = nodes[category];
    if (apiNode) {
        title = apiNode.title;
        const response = await ofetch(`${rootUrl}/api/list?offset=0&limit=20&node=${apiNode.node}`, {
            parseResponse: JSON.parse,
        });
        list = response.list.slice(0, 20).map((item) => ({
            link: `${rootUrl}/article/${item.aid}`,
        }));
    } else {
        const response = await ofetch(currentUrl);
        const $ = load(response);

        title = $('title').text();

        $('.oPBlock').remove();

        list = $('.list-block ul li, .firstCon-r ul li')
            .find('a')
            .toArray()
            .slice(0, 10)
            .map((item) => ({
                link: `https:${$(item).attr('href')}`,
            }));
    }

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await ofetch(item.link);
                    const content = load(detailResponse);

                    item.description = content('article').html();
                    item.title = content('.container-title').text();
                    item.author = content('.source').text().replace('来源：', '');
                    item.pubDate = parseDate(Number.parseInt(detailResponse.match(/\\"ctime\\":(.*),\\"utime\\"/)[1]));

                    return item;
                } catch {
                    return '';
                }
            })
        )
    );

    return {
        title: `${title} - 生命时报`,
        link: currentUrl,
        item: items,
    };
}
