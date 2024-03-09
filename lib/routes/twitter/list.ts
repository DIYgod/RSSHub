import { Route } from '@/types';
import cache from '@/utils/cache';
import utils from './utils';
import { config } from '@/config';

export const route: Route = {
    path: '/list/:id/:name/:routeParams?',
    categories: ['social-media'],
    example: '/twitter/list/ladyleet/javascript',
    parameters: { id: 'username', name: 'list name', routeParams: 'extra parameters, see the table above' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'List timeline',
    maintainers: ['xyqfer'],
    handler,
};

async function handler(ctx) {
    if (!config.twitter || !config.twitter.consumer_key || !config.twitter.consumer_secret) {
        throw new Error('Twitter RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }
    const { id, name } = ctx.req.param();
    const client = await utils.getAppClient();

    const list_data = await cache.tryGet(`twitter_lists_list_screen_name:${id}`, async () => {
        const data = await client.v1.get('lists/list.json', {
            screen_name: id,
        });

        const cached_lists = {};
        for (const e of data) {
            cached_lists[e.name] = { id: e.id_str, slug: e.slug };
        }

        return cached_lists;
    });
    const cur_list = list_data[name];

    const data = await client.v1.get('lists/statuses.json', {
        list_id: cur_list.id,
        slug: cur_list.slug,
        tweet_mode: 'extended',
    });

    return {
        title: `Twitter List - ${id}/${name}`,
        link: `https://twitter.com/${id}/lists/${name}`,
        item: utils.ProcessFeed(ctx, {
            data,
        }),
    };
}
