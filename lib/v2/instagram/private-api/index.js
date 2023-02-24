const { ig, login } = require('./utils');
const logger = require('@/utils/logger');
const config = require('@/config').value;
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

// loadContent pulls the desired user/tag/etc
async function loadContent(category, nameOrId, tryGet) {
    let feedTitle, feedLink, feedDescription, feedLogo;
    let itemsRaw;

    switch (category) {
        case 'user': {
            let userInfo, username, id;
            if (!isNaN(nameOrId)) {
                id = nameOrId;
                userInfo = await tryGet(`instagram:userInfo:${id}`, () => ig.user.info(id));
                username = userInfo.username;
            } else {
                username = nameOrId;
                id = await tryGet(`instagram:getIdByUsername:${username}`, () => ig.user.getIdByUsername(username), 31536000); // 1 year since it will never change
                userInfo = await tryGet(`instagram:userInfo:${id}`, () => ig.user.info(id));
            }

            feedDescription = userInfo.biography;
            feedLogo = userInfo.hd_profile_pic_url_info?.url ?? userInfo.profile_pic_url;
            const fullName = userInfo.full_name;
            feedTitle = `${fullName} (@${username}) - Instagram`;
            feedLink = `https://www.instagram.com/${username}`;

            itemsRaw = await tryGet(`instagram:feed:${id}`, () => ig.feed.user(id).items(), config.cache.routeExpire, false);
            break;
        }
        case 'tags': {
            const tag = nameOrId;

            feedTitle = `#${tag} - Instagram`;
            feedLink = `https://www.instagram.com/explore/tags/${tag}`;

            itemsRaw = await tryGet(`instagram:tags:${tag}`, () => ig.feed.tags(tag, 'recent').items(), config.cache.routeExpire, false);
            break;
        }
        default: {
            break;
        }
    }

    return {
        feedTitle,
        feedLink,
        feedDescription,
        feedLogo,
        itemsRaw,
    };
}

module.exports = async (ctx) => {
    // https://github.com/dilame/instagram-private-api#feeds
    // const availableCategories = ["accountFollowers", "accountFollowing", "news",
    //     "discover", "pendingFriendships", "blockedUsers", "directInbox", "directPending",
    //     "directThread", "user", "tag", "location", "mediaComments", "reelsMedia", "reelsTray",
    //     "timeline", "musicTrending", "musicSearch", "musicGenre", "musicMood", "usertags", "saved"];
    const availableCategories = ['user', 'tags'];
    // Unique key for a feed category
    // e.g. username for user feed
    const { category, key } = ctx.params;
    if (!availableCategories.includes(category)) {
        throw Error('Such feed is not supported.');
    }

    if (config.instagram && config.instagram.proxy) {
        ig.state.proxyUrl = config.instagram.proxy;
    }

    await login(ig, ctx.cache);

    let data;
    try {
        data = await loadContent(category, key, ctx.cache.tryGet);
    } catch (e) {
        logger.error(`Instagram error: ${e}`);
        throw e;
    }

    const items = data.itemsRaw.map((item) => {
        const { product_type } = item; // carousel_container, feed, clips, igtv
        // Content
        const summary = item.caption?.text ?? '';

        let description = '';
        switch (product_type) {
            case 'carousel_container': {
                const images = item.carousel_media.map((i) => i.image_versions2.candidates[0]);
                description = art(path.join(__dirname, '../templates/images.art'), {
                    summary,
                    images,
                });
                break;
            }
            case 'clips':
            case 'igtv':
                description = art(path.join(__dirname, '../templates/video.art'), {
                    summary,
                    image: item.image_versions2.candidates[0].url,
                    video: item.video_versions[0],
                });
                break;
            case 'feed': {
                const images = [item.image_versions2.candidates[0]];
                description = art(path.join(__dirname, '../templates/images.art'), {
                    summary,
                    images,
                });
                break;
            }
            default:
                throw Error(`Instagram: Unhandled feed type: ${product_type}`);
        }

        // Metadata
        const url = `https://www.instagram.com/p/${item.code}/`;
        const pubDate = parseDate(item.taken_at, 'X');
        const title = summary.split('\n')[0];

        return {
            title,
            id: item.pk,
            pubDate,
            author: item.user.username,
            link: url,
            summary,
            description,
        };
    });

    ctx.state.data = {
        title: data.feedTitle,
        link: data.feedLink,
        description: data.feedDescription,
        item: items,
        icon: 'https://www.instagram.com/static/images/ico/xxhdpi_launcher.png/99cf3909d459.png',
        logo: data.feedLogo,
        image: data.feedLogo,
        allowEmpty: true,
    };
};
