const got = require('@/utils/got');
const logger = require('@/utils/logger');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const { HOST, NEW_LIST, OFFICIAL_PAGE_TYPE, POST_FULL, LINK, PUBLIC_IMG, PRIVATE_IMG } = require('./constant');
const { getI18nGameInfo, getI18nType } = require('./utils');

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

const getPostContent = (ctx, list, { language }) =>
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
                const description = art(path.join(__dirname, 'templates/post.art'), {
                    hasCover: post.has_cover,
                    coverList: row.cover_list,
                    content: replaceImgDomain(content),
                });
                return {
                    // 文章标题
                    title: post.subject,
                    // 文章链接
                    link: `${LINK}/article/${post_id}`,
                    // 文章正文
                    description,
                    // 文章发布日期
                    pubDate: parseDate(post.created_at * 1000),
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
            size: Number.parseInt(ctx.query?.limit) || 15,
        };
        const gameInfo = await getI18nGameInfo(gids, language, ctx.cache.tryGet);
        const typeInfo = await getI18nType(language, ctx.cache.tryGet);
        const list = await getEventList(params);
        const items = await getPostContent(ctx, list, params);
        ctx.state.data = {
            title: `HoYoLAB-${gameInfo.name}-${typeInfo[type].title}`,
            link: `${LINK}/circles/${gids}/${OFFICIAL_PAGE_TYPE[gids]}/official?page_type=${OFFICIAL_PAGE_TYPE[gids]}&page_sort=${typeInfo[type].sort}`,
            item: items,
            image: gameInfo.icon,
            icon: gameInfo.icon,
            logo: gameInfo.icon,
        };
    } catch (error) {
        logger.error(error);
    }
};
