const cheerio = require('cheerio');
const path = require('path');
const ig = require('./utils');

module.exports = async (ctx) => {
    // https://github.com/dilame/instagram-private-api#feeds
    // const availableCategories = ["accountFollowers", "accountFollowing", "news",
    //     "discover", "pendingFriendships", "blockedUsers", "directInbox", "directPending",
    //     "directThread", "user", "tag", "location", "mediaComments", "reelsMedia", "reelsTray",
    //     "timeline", "musicTrending", "musicSearch", "musicGenre", "musicMood", "usertags", "saved"];
    const availableCategories = ['user'];
    const category = ctx.params.category;
    if (!availableCategories.includes(category)) {
        throw Error('Such feed is not supported.');
    }
    if (process.env.IG_USERNAME === undefined || process.env.IG_PASSWORD === undefined) {
        throw Error('Instagram username and password are required to be set in the environment.');
    }

    // Unique key for a feed category
    // e.g. username for user feed
    const key = ctx.params.key;

    // TODO: extend to other feed categories
    const usernameOrId = key;
    let userInfo, username, id;
    if (!isNaN(usernameOrId)) {
        id = usernameOrId;
        userInfo = await ig.user.info(id);
        username = userInfo.username;
    } else {
        username = usernameOrId;
        id = await ig.user.getIdByUsername(username);
        userInfo = await ig.user.info(id);
    }

    const description = userInfo.biography;
    const logo = userInfo.hd_profile_pic_url_info.url;
    const fullName = userInfo.full_name;

    const itemsPromise = await ig.feed.user(id).items();
    const items = await Promise.all(
        itemsPromise.map(async (item) => {
            // Content
            const $ = cheerio.load(`<p>${item.caption.text}</p>`);
            const content = $.root();
            const images = item.image_versions2.candidates;
            for (const i of images) {
                content.append(`<img src="${i.url}" height="${i.height}" width="${i.width}">`);
            }

            // Metadata
            const url = path.join('https://www.intagram.com', item.code);
            const pubDate = new Date(item.taken_at).toUTCString();
            const title = item.caption.text.split('\n')[0];

            return Promise.resolve({
                title,
                id: item.pk,
                pubDate,
                author: item.creator,
                link: url,
                summary: item.caption.text,
                description: content.html(),
                icon: 'https://www.instagram.com/static/images/ico/xxhdpi_launcher.png/99cf3909d459.png',
                logo,
            });
        })
    );

    ctx.state.data = {
        title: `${fullName} (@${username}) - Instagram`,
        link: path.join('https://www.instagram.com', username),
        description: description,
        item: items,
        icon: 'https://www.instagram.com/static/images/ico/xxhdpi_launcher.png/99cf3909d459.png',
        logo,
    };
};
