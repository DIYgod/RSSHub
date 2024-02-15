const { parseDate } = require('@/utils/parse-date');
const { getTagId, getTagSuggestion, findAccountById, parseDescription, baseUrl, icon } = require('./utils');

module.exports = async (ctx) => {
    const { tag } = ctx.params;

    const tagId = await getTagId(tag, ctx.cache.tryGet);
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

    ctx.state.data = {
        title: `#${tag} - Fansly`,
        link: `${baseUrl}/explore/tag/${tag}`,
        image: icon,
        icon,
        logo: icon,
        language: 'en',
        item: items,
    };
};
