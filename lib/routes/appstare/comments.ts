import { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const handler = async (ctx) => {
    const country = ctx.req.param('country');
    const appid = ctx.req.param('appid');
    const url = `https://monitor.appstare.net/spider/appComments?country=${country}&appId=${appid}`;
    const data = await ofetch(url);

    const items = data.map((item) => ({
        title: item.title,
        description: `
            <div style="font-size: 1.2em; color: #FFD700;">${'⭐️'.repeat(Math.floor(item.rating))}</div>
            <p>${item.review}</p>
        `,
        pubDate: new Date(item.date).toUTCString(),
    }));

    const link = `https://appstare.net/data/app/comment/${appid}/${country}`;

    return {
        title: 'App Comments',
        appID: appid,
        country,
        item: items,
        link,
        allowEmpty: true,
    };
};

export const route: Route = {
    path: '/comments/:country/:appid',
    name: 'Comments',
    url: 'appstare.net/',
    example: '/appstare/comments/cn/989673964',
    maintainers: ['zhixideyu'],
    handler,
    parameters: {
        country: 'App Store country code, e.g., US, CN',
        appid: 'Unique App Store application identifier (app id)',
    },
    categories: ['program-update'],
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
            source: ['appstare.net/'],
        },
    ],
    description: 'Retrieve only the comments of the app from the past 7 days.',
};
