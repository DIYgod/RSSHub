import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/apod-cn',
    categories: ['picture'],
    example: '/nasa/apod-cn',
    parameters: {},
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
            source: ['www.nasachina.cn/nasa-image-of-the-day'],
        },
    ],
    name: 'Chinese Mirror',
    maintainers: ['nczitzk', 'williamgateszhao'],
    handler,
    url: 'www.nasachina.cn/nasa-image-of-the-day',
    description: `::: tip
[NASA 中文](https://www.nasachina.cn/) 提供了每日天文图的中英双语图文说明，但在更新上偶尔略有一两天的延迟。
:::`,
};

async function handler(ctx) {
    const limit = Math.min(getRouteLimit(ctx, 10), 100);
    const rootUrl = `https://www.nasachina.cn/wp-json/wp/v2/posts?categories=2&per_page=${limit}`;
    const { data } = await got({
        method: 'get',
        url: rootUrl,
    });

    const items = data.map((item) => ({
        title: item.title.rendered,
        description: item.content.rendered,
        pubDate: item.date_gmt && item.date_gmt !== '0000-00-00T00:00:00' ? parseDate(`${item.date_gmt}Z`) : undefined,
        link: item.link,
    }));

    return {
        title: 'NASA中文 - 天文·每日一图',
        link: 'https://www.nasachina.cn/nasa-image-of-the-day',
        item: items,
    };
}
