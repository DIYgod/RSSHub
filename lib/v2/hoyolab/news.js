const got = require('@/utils/got');
const logger = require('@/utils/logger');
const { parseDate } = require('@/utils/parse-date');
const { HOST, NEW_LIST, TYPE_MAP, POST_FULL, GIDS_MAP, LINK, ICON, PUBLIC_IMG, PRIVATE_IMG } = require('./constant');

const getEventList = async ({ type, gids, size, language }) => {
    const query = new URLSearchParams({
        type,
        gids,
        page_size: size,
    }).toString();
    const url = `${HOST}${NEW_LIST}?${query}`;
    const res = await got({
        method: 'get',
        url,
        headers: {
            'X-Rpc-Language': language,
        },
    }).json();
    const list = res?.data?.list || [];
    return list;
};

const replaceImgDomain = (content) => content.replaceAll(PRIVATE_IMG, PUBLIC_IMG);

const getPostContent = (ctx, list, { type, language }) =>
    Promise.all(
        list.map(async (row) => {
            const post = row.post;
            const post_id = post.post_id;
            const query = new URLSearchParams({
                post_id,
                language, // language为了区分缓存，对接口并无意义
            }).toString();
            const url = `${HOST}${POST_FULL}?${query}`;
            return await ctx.cache.tryGet(url, async () => {
                const res = await got({
                    method: 'get',
                    url,
                    headers: {
                        'X-Rpc-Language': language,
                    },
                }).json();
                const author = res?.data?.post?.user?.nickname || '';
                let content = res?.data?.post?.post?.content || '';
                if (content === language || !content) {
                    content = post.content;
                }
                const description = replaceImgDomain(content);
                return {
                    // 文章标题
                    title: post.subject,
                    // 文章链接
                    link: `${LINK}/article/${post_id}`,
                    // 文章正文
                    description,
                    // 文章发布日期
                    pubDate: parseDate(post.created_at * 1000),
                    // 如果有的话，文章分类
                    category: `${GIDS_MAP[post.game_id]}-${TYPE_MAP[type]}`,
                    author,
                };
            });
        })
    );

module.exports = async (ctx) => {
    try {
        const { type, gids, language } = ctx.params;
        const params = {
            type,
            gids,
            language,
            size: parseInt(ctx.query?.limit) || 15,
        };
        const list = await getEventList(params);
        const items = await getPostContent(ctx, list, params);
        ctx.state.data = {
            title: `HoYoLAB-${GIDS_MAP[gids]}-${TYPE_MAP[type]}`,
            link: LINK,
            item: items,
            image: ICON,
            icon: ICON,
            logo: ICON,
        };
    } catch (error) {
        logger.error(error);
    }
};
