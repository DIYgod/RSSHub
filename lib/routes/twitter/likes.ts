import { Route } from '@/types';
import utils from './utils';
import { config } from '@/config';

export const route: Route = {
    path: '/likes/:id/:routeParams?',
    categories: ['social-media'],
    example: '/twitter/likes/DIYgod',
    parameters: { id: 'username', routeParams: 'extra parameters, see the table above' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'User likes',
    maintainers: ['xyqfer'],
    handler,
};

async function handler(ctx) {
    if (!config.twitter || !config.twitter.consumer_key || !config.twitter.consumer_secret) {
        throw new Error('Twitter RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }
    const id = ctx.req.param('id');
    const client = await utils.getAppClient();
    const data = await client.v1.get('favorites/list.json', {
        screen_name: id,
        tweet_mode: 'extended',
    });

    return {
        title: `Twitter Likes - ${id}`,
        link: `https://twitter.com/${id}/likes`,
        item: utils.ProcessFeed(ctx, {
            data,
        }),
    };
}
