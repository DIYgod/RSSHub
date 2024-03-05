// @ts-nocheck
import cache from '@/utils/cache';
const utils = require('./utils');
import { config } from '@/config';

export default async (ctx) => {
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

    ctx.set('data', {
        title: `Twitter List - ${id}/${name}`,
        link: `https://twitter.com/${id}/lists/${name}`,
        item: utils.ProcessFeed(ctx, {
            data,
        }),
    });
};
