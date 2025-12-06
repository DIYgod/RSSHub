import { load } from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.laohu8.com';

export const route: Route = {
    path: '/personal/:id',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/laohu8/personal/3527667596890271',
    parameters: { id: '用户 ID，见网址链接' },
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
            source: ['laohu8.com/personal/:id'],
        },
    ],
    name: '个人主页',
    maintainers: ['Fatpandac'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const url = `${rootUrl}/personal/${id}`;

    const response = await got(url);
    const $ = load(response.data);
    const author = $('h2.personal-name').text();
    const data = JSON.parse($('#__APP_DATA__').text()).tweetList;

    const items = await Promise.all(
        data.map((item) =>
            cache.tryGet(item.link, () => ({
                title: item.title,
                description: String(item.htmlText).replaceAll('\n', '<br><br>'),
                link: `${rootUrl}/post/${item.id}`,
                pubDate: parseDate(item.gmtCreate),
            }))
        )
    );

    return {
        title: `老虎社区 - ${author} 个人社区`,
        link: url,
        item: items,
    };
}
