import { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/:type?',
    categories: ['new-media'],
    example: '/inshorts/technology',
    parameters: { type: '新闻类别，如：technology、world' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: false,
    },
    name: 'inshorts',
    maintainers: ['tong-hao'],
    handler,
    url: 'inshorts.com',
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'technology';
    const rootUrl = 'https://inshorts.com';
    const currentUrl = `${rootUrl}/api/en/search/trending_topics/${type}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    const data = JSON.parse(response.data);

    const items = data.data.suggested_news.map((item) => {
        const news = item.news_obj;
        return {
            title: news.title,
            pubDate: new Date(news.created_at).toUTCString(),
            description: `<img src="${news.image_url}"><br/>${news.content}`,
            link: news.source_url
        };
    });

    return {
        title: `Inshorts-${type}`,
        link: currentUrl,
        item: items,
    };
}
