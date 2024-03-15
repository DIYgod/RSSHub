import { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { getTagId, getTagSuggestion, findAccountById, parseDescription, baseUrl, icon } from './utils';

export const route: Route = {
    path: '/tag/:tag',
    categories: ['social-media'],
    example: '/fansly/tag/free',
    parameters: { tag: 'Hashtag' },
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
            source: ['fansly.com/explore/tag/:tag'],
        },
    ],
    name: 'Hashtag',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const tag = ctx.req.param('tag');

    const tagId = await getTagId(tag, cache.tryGet);
    const suggestion = await getTagSuggestion(tagId);

    const items = suggestion.aggregationData?.posts.map((post) => {
        const account = findAccountById(post.accountId, suggestion.aggregationData.accounts);
        return {
            title: post.content.split('\n')[0],
            description: parseDescription(post, suggestion.aggregationData),
            pubDate: parseDate(post.createdAt, 'X'),
            link: `${baseUrl}/post/${post.id}`,
            author: `${account.displayName ?? account.username} (@${account.username})`,
        };
    });

    return {
        title: `#${tag} - Fansly`,
        link: `${baseUrl}/explore/tag/${tag}`,
        image: icon,
        icon,
        logo: icon,
        language: 'en',
        item: items,
    };
}
