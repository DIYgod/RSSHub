import { Route } from '@/types';
import utils from './utils';
import { config } from '@/config';

export const route: Route = {
    path: '/trends/:woeid?',
    categories: ['social-media'],
    example: '/twitter/trends/23424856',
    parameters: { woeid: 'Yahoo! Where On Earth ID. default to woeid=1 (World Wide)' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Trends',
    maintainers: ['sakamossan'],
    handler,
};

async function handler(ctx) {
    if (!config.twitter || !config.twitter.consumer_key || !config.twitter.consumer_secret) {
        throw new Error('Twitter RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }
    const woeid = ctx.req.param('woeid') ?? 1; // Global information is available by using 1 as the WOEID
    const client = await utils.getAppClient();
    const data = await client.v1.get('trends/place.json', { id: woeid });
    const [{ trends }] = data;

    return {
        title: `Twitter Trends on ${data[0].locations[0].name}`,
        link: `https://twitter.com/i/trends`,
        item: trends
            .filter((t) => !t.promoted_content)
            .map((t) => ({
                title: t.name,
                link: t.url,
                description: t.name + (t.tweet_volume ? ` (${t.tweet_volume})` : ''),
            })),
    };
}
