const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const limit = parseInt(ctx.query.limit) || 10;
    const rootUrl = 'https://api.xiaoheihe.cn';
    const currentUrl = `${rootUrl}/bbs/web/profile/post/links?userid=${id}&limit=${limit}&offset=0&version=999.0.0`;

    const data = await got(currentUrl).then((response) => response.data);
    const username = data.user.username;
    const articleList = data.post_links.map((post) => ({
        title: post.title || post.description,
        pubDate: parseDate(post.create_at * 1000),
        link: post.share_url,
        linkId: post.linkid,
    }));

    const items = await Promise.all(
        articleList.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const url = `${rootUrl}/bbs/app/api/share/data/?offset=0&limit=3&link_id=${item.linkId}&os_type=web`;
                const link = await got(url).then((response) => response.data.link);
                const content = link.content;
                const video = link.video;
                let description;

                for (const item of content) {
                    if (item.type === 'html') {
                        const $ = cheerio.load(item.text, { decodeEntities: false });
                        $('[data-gameid]').each((i, e) => $(e).remove());
                        $('[data-original]').each((i, e) => $(e).replaceWith(`<img src = "${$(e).attr('data-original')}">`));
                        description = $.html();
                    }
                }
                if (video) {
                    description = `<video src="${video.video_url}" poster="${video.thumb}" controls="controls"></video>`;
                }
                item.description = description;
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${username} 的动态`,
        link: `https://xiaoheihe.cn/community/user/${id}/post_list`,
        item: items,
    };
};
