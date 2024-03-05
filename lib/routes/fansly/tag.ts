// @ts-nocheck
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
const { getTagId, getTagSuggestion, findAccountById, parseDescription, baseUrl, icon } = require('./utils');

export default async (ctx) => {
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

    ctx.set('data', {
        title: `#${tag} - Fansly`,
        link: `${baseUrl}/explore/tag/${tag}`,
        image: icon,
        icon,
        logo: icon,
        language: 'en',
        item: items,
    });
};
