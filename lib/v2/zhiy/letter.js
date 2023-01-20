const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { baseUrl, fetchUserDate } = require('./utils');

module.exports = async (ctx) => {
    const { author } = ctx.params;

    const userData = await fetchUserDate(author);
    const { author_id: authorId } = userData;

    const {
        data: { result: letters },
    } = await got(`${baseUrl}/api/app/users/${authorId}/letters`, {
        searchParams: {
            page: 1,
            limit: ctx.query.limit ? parseInt(ctx.query.limit) : 100,
        },
    });

    const items = letters.map((item) => ({
        title: item.title,
        description: item.shortcut,
        pubDate: parseDate(item.send_time, 'X'),
        link: `${baseUrl}/letter/${item.id}`,
    }));

    ctx.state.data = {
        title: userData.author_name,
        link: `${baseUrl}/${author}`,
        description: userData.author_signature,
        image: userData.author_avatar_url,
        item: items,
    };
};
