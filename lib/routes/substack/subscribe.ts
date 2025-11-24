import { Route, ViewType } from '@/types';
import parser from '@/utils/rss-parser';
import { parseDate } from '@/utils/parse-date';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/subscribe/:user',
    categories: ['blog'],
    view: ViewType.SocialMedia,
    example: '/substack/subscribe/mangoread',
    parameters: { user: 'Username of the Substack' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Substack Subscription',
    maintainers: ['pseudoyu'],
    handler,
};

async function handler(ctx) {
    const user = ctx.req.param('user');

    if (!user) {
        throw new InvalidParameterError('Invalid user');
    }

    const response = await fetch(`https://${user}.substack.com/feed`);
    const raw = await response.text();
    const cleaned = raw.replaceAll(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
    const feed = await parser.parseString(cleaned);

    return {
        title: feed.title ?? 'Substack',
        description: feed.description ?? `${user}'s Substack`,
        link: feed.link ?? `https://${user}.substack.com`,
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
