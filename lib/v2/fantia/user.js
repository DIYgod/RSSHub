const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const Config = require('@/config').value.fantia;

module.exports = async (ctx) => {
    const rootUrl = 'https://fantia.jp';
    const userUrl = `${rootUrl}/api/v1/fanclubs/${ctx.params.id}`;

    const initalResponse = await got({
        method: 'get',
        url: rootUrl,
        headers: {
            Cookie: Config.cookies ? Config.cookies : '',
        },
    });

    const csrfToken = initalResponse.data.match(/name="csrf-token" content="(.*?)"\s?\/>/)[1];

    const response = await got({
        method: 'get',
        url: userUrl,
        headers: {
            Cookie: Config.cookies ? Config.cookies : '',
        },
    });

    const list = response.data.fanclub.recent_posts.map((item) => ({
        title: item.title,
        link: `${rootUrl}/api/v1/posts/${item.id}`,
        description: `<p>${item.comment}</p>`,
        pubDate: parseDate(item.posted_at),
    }));
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const contentResponse = await got({
                    method: 'get',
                    url: item.link,
                    headers: {
                        Cookie: Config.cookies ? Config.cookies : '',
                        'X-CSRF-Token': csrfToken,
                        Accept: 'application/json, text/plain, */*',
                        Referer: `${rootUrl}/`,
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });
                item.link = item.link.replace('api/v1/', '');
                item.description += `<img src="${contentResponse.data.post?.thumb?.large ? contentResponse.data.post?.thumb?.large : contentResponse.data.post.thumb_micro}">`;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `Fantia - ${response.data.fanclub.fanclub_name_with_creator_name}`,
        link: `${rootUrl}/fanclubs/${ctx.params.id}`,
        item: items,
    };
};
