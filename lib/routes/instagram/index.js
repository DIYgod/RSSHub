const cheerio = require('cheerio');
const path = require('path');
const { IgLoginRequiredError } = require('instagram-private-api');
const { ig, login } = require('./utils');

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

    try {
        await ig.account.currentUser();
    } catch (e) {
        if (e instanceof IgLoginRequiredError) {
            await login(ig);
        } else {
            throw Error('Unknown error');
        }
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
            const summary = item.caption ? item.caption.text : '';
            const $ = cheerio.load(`<p>${summary}</p>`);
            const content = $.root();

            // Image or carousel media
            const images = item.image_versions2 ? [item.image_versions2] : item.carousel_media.map((i) => i.image_versions2);
            for (const i of images) {
                const img = i.candidates[0];
                content.append(`<img src="${img.url}" height="${img.height}" width="${img.width}">`);
            }

            // Metadata
            const url = path.join('https://www.instagram.com', 'p', item.code);
            const pubDate = new Date(item.taken_at * 1000).toUTCString();
            const title = summary.split('\n')[0];

            return Promise.resolve({
                title,
                id: item.pk,
                pubDate,
                author: item.creator,
                link: url,
                summary,
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
