const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { baseUrl, fetchUserDate } = require('./utils');
const { art } = require('@/utils/render');
const path = require('path');
const dayjs = require('dayjs');

module.exports = async (ctx) => {
    art.defaults.imports = {
        dayjs,
        ...art.defaults.imports,
    };

    const { author } = ctx.params;

    const userData = await fetchUserDate(author);
    const { author_id: authorId } = userData;

    const {
        data: { result: posts },
    } = await got(`${baseUrl}/api/app/share/garden/users/${authorId}/posts`, {
        searchParams: {
            page: 1,
            limit: ctx.query.limit ? parseInt(ctx.query.limit) : 100,
        },
    });

    const list = posts.map((item) => ({
        title: item.title,
        pubDate: parseDate(item.create_time, 'X'),
        link: `${baseUrl}/b${item.share_md5}`,
        guid: `${baseUrl}/b${item.share_md5}:${item.link_amount}:${item.note_amount}`,
        postId: item.id,
        shareMD5: item.share_md5,
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: postMeta } = await got(`${baseUrl}/api/app/share/posts/${item.shareMD5}`);

                const {
                    data: { result: posts },
                } = await got(`${baseUrl}/api/app/share/posts/${item.postId}/notes`, {
                    searchParams: {
                        page: 1,
                        limit: 100,
                    },
                });

                item.description = art(path.join(__dirname, 'templates/post.art'), {
                    postMeta,
                    postDate: dayjs(postMeta.create_time, 'X').format('YYYY-MM-DD HH:mm:ss'),
                    posts,
                });

                return item;
            })
        )
    );

    ctx.state.data = {
        title: userData.author_name,
        link: `${baseUrl}/${author}`,
        description: userData.author_signature,
        image: userData.author_avatar_url,
        item: items,
    };
};
