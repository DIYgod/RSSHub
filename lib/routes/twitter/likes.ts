// @ts-nocheck
const utils = require('./utils');
import { config } from '@/config';

export default async (ctx) => {
    if (!config.twitter || !config.twitter.consumer_key || !config.twitter.consumer_secret) {
        throw new Error('Twitter RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }
    const id = ctx.req.param('id');
    const client = await utils.getAppClient();
    const data = await client.v1.get('favorites/list.json', {
        screen_name: id,
        tweet_mode: 'extended',
    });

    ctx.set('data', {
        title: `Twitter Likes - ${id}`,
        link: `https://twitter.com/${id}/likes`,
        item: utils.ProcessFeed(ctx, {
            data,
        }),
    });
};
