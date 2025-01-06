import { Route, ViewType } from '@/types';
import parser from '@/utils/rss-parser';
import { parseDate } from '@/utils/parse-date';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/feed/:user',
    categories: ['blog'],
    view: ViewType.SocialMedia,
    example: '/medium/feed/zhgchgli',
    parameters: { user: 'Username of the Medium' },
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
            source: ['medium.com/@:user'],
            target: '/feed/:user',
        },
    ],
    name: 'Medium Feed',
    maintainers: ['pseudoyu'],
    handler,
};

async function handler(ctx) {
    const user = ctx.req.param('user');

    if (!user) {
        throw new InvalidParameterError('Invalid user');
    }

    const feed = await parser.parseURL(`https://medium.com/feed/@${user}`);

    return {
        title: feed.title ?? 'Medium',
        description: feed.description ?? `${user}'s Medium`,
        link: feed.link ?? `https://medium.com/@${user}`,
        image: feed.image?.url ?? '',
        item: feed.items.map((item) => ({
            title: item.title ?? 'Untitled',
            description: item['content:encoded'] ?? item.content ?? '',
            link: item.link ?? '',
            pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
            guid: item.guid ?? '',
            author: item.creator ?? user,
        })),
    };
}
