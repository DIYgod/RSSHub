// pixiv fanbox, maybe blocked by upstream

// params:
// user?: fanbox domain name

const got = require('@/utils/got');

const conv_item = require('./conv');
const get_header = require('./header');

module.exports = async (ctx) => {
    const user = ctx.params.user || 'official'; // if no user specified, just go to official page
    const box_url = `https://${user}.fanbox.cc`;

    // get user info
    let title = `${user}'s fanbox`;
    let descr = title;

    try {
        const user_api = `https://api.fanbox.cc/creator.get?creatorId=${user}`;
        const resp_u = await got(user_api, { headers: get_header() });
        title = `${resp_u.data.body.user.name}'s fanbox`;
        descr = resp_u.data.description;
    } catch (_) {
        _;
    }

    // get user posts
    const posts_api = `https://api.fanbox.cc/post.listCreator?creatorId=${user}&limit=20`;
    const response = await got(posts_api, { headers: get_header() });

    // render posts
    const items = await Promise.all(response.data.body.items.map((i) => conv_item(i)));

    // return rss feed
    ctx.state.data = {
        title,
        link: box_url,
        description: descr,
        item: items,
    };
};
