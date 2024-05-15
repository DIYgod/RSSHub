import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/user/:user',
    categories: ['social-media'],
    example: '/rattibha/user/elonmusk',
    parameters: { user: 'Twitter username, without @' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['rattibha.com/:user'],
        },
    ],
    name: 'User Threads',
    maintainers: ['yshalsager'],
    handler,
};

async function handler(ctx) {
    const baseUrl = 'https://rattibha.com';
    const { user: twitterUser } = ctx.req.param();

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
        threadData1URL: `${baseUrl}/thread?id=${item.thread_id}`,
        threadData2URL: `${baseUrl}/threads?id=${item.thread_id}`,
    }));

    // Get tweet full text
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: data1 } = await got(item.threadData1URL, { headers: { accept: 'application/json' } });
                const { data: data2 } = await got(item.threadData2URL, { headers: { accept: 'application/json' } });
                item.description = [...data1.tweets, ...data2].reduce((accumulator, tweet) => `${accumulator}${tweet.tweet_detail.info.text}<br>`, '');
                return item;
            })
        )
    );

    return {
        title: `سلاسل تغريدات ${twitterUser}`,
        link: `${baseUrl}/${twitterUser}`,
        item: items,
    };
}
