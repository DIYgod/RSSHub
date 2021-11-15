import utils from './utils.js';
import {createCommons} from 'simport';

const {
    require
} = createCommons(import.meta.url);

const config = require('~/config').value;

export default async (ctx) => {
    if (!config.twitter || !config.twitter.consumer_key || !config.twitter.consumer_secret) {
        throw 'Twitter RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#%E9%83%A8%E5%88%86-rss-%E6%A8%A1%E5%9D%97%E9%85%8D%E7%BD%AE">relevant config</a>';
    }
    const { id, name } = ctx.params;

    const list_data = await ctx.cache.tryGet(`twitter_lists_list_screen_name:${id}`, async () => {
        const result = await utils.getTwit().get('lists/list', {
            screen_name: id,
        });

        const cached_lists = {};
        for (const e of result.data) {
            cached_lists[e.name] = { id: e.id_str, slug: e.slug };
        }

        return cached_lists;
    });
    const cur_list = list_data[name];

    const {
        data
    } = await utils.getTwit().get('lists/statuses', {
        list_id: cur_list.id,
        slug: cur_list.slug,
        tweet_mode: 'extended',
    });

    ctx.state.data = {
        title: `Twitter List - ${id}/${name}`,
        link: `https://twitter.com/${id}/lists/${name}`,
        item: utils.ProcessFeed(ctx, {
            data,
        }),
    };
};
