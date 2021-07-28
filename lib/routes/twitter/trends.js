const utils = require('./utils');
const config = require('@/config').value;

module.exports = async (ctx) => {
    if (!config.twitter || !config.twitter.consumer_key || !config.twitter.consumer_secret) {
        throw 'Twitter RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#%E9%83%A8%E5%88%86-rss-%E6%A8%A1%E5%9D%97%E9%85%8D%E7%BD%AE">relevant config</a>';
    }
    const woeid = ctx.params.woeid || 1; // Global information is available by using 1 as the WOEID
    const result = await utils.getTwit().get('trends/place', { id: woeid });
    const [{ trends }] = result.data;

    ctx.state.data = {
        title: `Twitter Trends on ${result.data[0].locations[0].name}`,
        link: `https://twitter.com/i/trends`,
        item: trends
            .filter((t) => !t.promoted_content)
            .map((t) => ({
                title: t.name,
                link: t.url,
                description: t.name + (t.tweet_volume ? ` (${t.tweet_volume})` : ''),
            })),
    };
};
