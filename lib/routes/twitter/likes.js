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
    const {
        id
    } = ctx.params;
    const {
        data
    } = await utils.getTwit().get('favorites/list', {
        screen_name: id,
        tweet_mode: 'extended',
    });

    ctx.state.data = {
        title: `Twitter Likes - ${id}`,
        link: `https://twitter.com/${id}/likes`,
        item: utils.ProcessFeed(ctx, {
            data,
        }),
    };
};
