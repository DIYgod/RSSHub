// @ts-nocheck
const utils = require('../utils');

export default async (ctx) => {
    const keyword = ctx.req.param('keyword');
    const limit = ctx.req.query('limit') ?? 50;
    const client = await utils.getAppClient();
    const data = await client.v1.get('search/tweets.json', {
        q: keyword,
        count: limit,
        tweet_mode: 'extended',
        result_type: 'recent',
    });

    ctx.set('data', {
        title: `Twitter Keyword - ${keyword}`,
        link: `https://twitter.com/search?q=${encodeURIComponent(keyword)}`,
        item: utils.ProcessFeed(ctx, {
            data: data.statuses,
        }),
        allowEmpty: true,
    });
};
