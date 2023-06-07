const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://rattibha.com';
    const { user: twitterUser } = ctx.params;

    const {
        data: { user: userData },
    } = await got(`${baseUrl}/user?id=${twitterUser}`, {
        headers: {
            accept: 'application/json',
        },
    });
    const { data: userThreads } = await got(`${baseUrl}/u_threads?id=${userData.account_user_id}`, { headers: { accept: 'application/json' } });

    // extract the relevant data from the API response
    const list = userThreads.map((item) => ({
        title: item.thread.t.info.text,
        link: `${baseUrl}/thread/${item.thread_id}`,
        pubDate: parseDate(item.thread.created_at),
        updated: parseDate(item.thread.updated_at),
        author: userData.name,
        api_link: `${baseUrl}/threads?id=${item.thread_id}`,
    }));

    // Get tweet full text
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.api_link, async () => {
                const { data: threads } = await got(item.api_link, { headers: { accept: 'application/json' } });
                item.description = threads.reduce((accumulator, tweet) => `${accumulator}${tweet.tweet_detail.info.text}<br>`, '');
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `سلاسل تغريدات ${twitterUser}`,
        link: `${baseUrl}/${twitterUser}`,
        item: items,
    };
};
