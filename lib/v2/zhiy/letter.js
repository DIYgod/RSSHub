const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { baseUrl, fetchUserDate } = require('./utils');

module.exports = async (ctx) => {
    const { author } = ctx.params;

    const userData = await fetchUserDate(author);
    const { author_id: authorId, author_name: authorName, author_signature: authorSignature, author_avatar_url: authorAvatarUrl } = userData;

    const {
        data: { result: letters },
    } = await got(`${baseUrl}/api/app/users/${authorId}/letters`, {
        searchParams: {
            page: 1,
            limit: ctx.query.limit ? Number.parseInt(ctx.query.limit) : 100,
        },
    });

    const items = letters.map((item) => ({
        title: item.title,
        description: item.shortcut,
        pubDate: parseDate(item.send_time, 'X'),
        link: `${baseUrl}/letter/${item.id}`,
    }));

    ctx.state.data = {
        title: authorName,
        link: `${baseUrl}/${author}`,
        description: authorSignature,
        image: authorAvatarUrl,
        item: items,
    };
};
