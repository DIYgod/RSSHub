import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

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
            source: ['apod.nasa.govundefined'],
        },
    ],
    name: 'NASA 中文',
    maintainers: ['nczitzk', 'williamgateszhao'],
    handler,
    url: 'apod.nasa.govundefined',
    description: `::: tip
  [NASA 中文](https://www.nasachina.cn/) 提供了每日天文图的中英双语图文说明，但在更新上偶尔略有一两天的延迟。
:::`,
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;
    const rootUrl = `https://www.nasachina.cn/wp-json/wp/v2/posts?categories=2&per_page=${limit}`;
    const { data } = await got({
        method: 'get',
        url: rootUrl,
    });

    const items = data.map((item) => ({
        title: item.title.rendered,
        description: item.content.rendered,
        pubDate: parseDate(item.date_gmt),
        link: item.link,
    }));

    return {
        title: 'NASA中文 - 天文·每日一图',
        link: 'https://www.nasachina.cn/nasa-image-of-the-day',
        item: items,
    };
}
