const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const response = await got({
        method: 'get',
        url: `https://api.xiaoheihe.cn/bbs/web/profile/post/links?userid=${id}&limit=10&offset=0&version=999.0.0`,
    });
    const data = response.data;
    const username = data.user.username;
    const articleList = data.post_links.map((post) => ({
        title: post.title,
        pubDate: parseDate(post.create_at * 1000),
        link: post.share_url,
        linkId: post.linkid
    }));

    const items = await Promise.all(
        articleList.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const url = `https://api.xiaoheihe.cn/bbs/app/api/share/data/?offset=0&limit=3&link_id=${item.linkId}&os_type=web`;
                const response = await got.get(url);
                const link = response.data.link;
                const content = link.content;
                let description;

                for (const item of content) {
                    if (item.type === "html") {
                        const $ = cheerio.load(item.text);
                        $("[data-gameid]").each((i, e) => $(e).replaceWith(""));
                        description = $.html().replace(/data-original/g, 'src');
                    }
                }
                if (link.video) {
                    description = `<img src = "${link.video.thumb}"><p><a href ="${link.video.video_url}">video</a></p>`;
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
