import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    name: '文章',
    maintainers: ['nczitzk', 'pseudoyu'],
    categories: ['new-media'],
    example: '/dedao',
    parameters: { category: '分类，见下表，默认为`news`' },
    description: `| 新闻 | 人物故事 | 视频 |
| ---- | ---- | ---- |
| news | figure | video |`,
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'news';

    const rootUrl = `https://www.igetget.com/${category === 'video' ? 'video' : 'news'}`;

    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const data = JSON.parse(response.data.match(/window.__INITIAL_STATE__= (.*);<\/script>/)[1]);

    let items = (category === 'news' ? data.news : category === 'figure' ? data.figure : data.videoList).map((item) => ({
        title: item.title,
        pubDate: parseDate(item.online_time),
        link: `${rootUrl}/${category === 'news' ? 'article/' : category === 'figure' ? 'people/' : ''}${item.online_time.split('T')[0].split('-').join('')}/${item.token}`,
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content('.menu-article').html();

                return item;
            })
        )
    );

    return {
        title: `得到${category === 'video' ? '' : '大事件'} - ${category === 'news' ? '新闻' : category === 'figure' ? '人物故事' : '视频'}`,
        link: rootUrl,
        item: items,
        description: data.description,
    };
}
