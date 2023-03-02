const utils = require('./utils');
const config = require('@/config').value;

module.exports = async (ctx) => {
    if (!config.twitter || !config.twitter.consumer_key || !config.twitter.consumer_secret) {
        throw 'Twitter RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>';
    }
    const { id, name } = ctx.params;
    const client = await utils.getAppClient();

    const list_data = await ctx.cache.tryGet(`twitter_lists_list_screen_name:${id}`, async () => {
        const data = await client.v1.get('lists/list.json', {
            screen_name: id,
        });

        const cached_lists = {};
        data.forEach((e) => {
            cached_lists[e.name] = { id: e.id_str, slug: e.slug };
        });

        return cached_lists;
    });
    const cur_list = list_data[name];

    const data = await client.v1.get('lists/statuses.json', {
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
