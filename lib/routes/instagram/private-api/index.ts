// @ts-nocheck
import cache from '@/utils/cache';
const { ig, login } = require('./utils');
import logger from '@/utils/logger';
import { config } from '@/config';
const { renderItems } = require('../common-utils');

// loadContent pulls the desired user/tag/etc
async function loadContent(category, nameOrId, tryGet) {
    let feedTitle, feedLink, feedDescription, feedLogo;
    let itemsRaw;

    switch (category) {
        case 'user': {
            let userInfo, username, id;
            if (isNaN(nameOrId)) {
                username = nameOrId;
                id = await tryGet(`instagram:getIdByUsername:${username}`, () => ig.user.getIdByUsername(username), 31_536_000); // 1 year since it will never change
                userInfo = await tryGet(`instagram:userInfo:${id}`, () => ig.user.info(id));
            } else {
                id = nameOrId;
                userInfo = await tryGet(`instagram:userInfo:${id}`, () => ig.user.info(id));
                username = userInfo.username;
            }

            feedDescription = userInfo.biography;
            // exists in web api ?? exist in private api ?? exist in both
            feedLogo = userInfo.profile_pic_url_hd ?? userInfo.hd_profile_pic_url_info?.url ?? userInfo.profile_pic_url;
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
        default:
            break;
    }

    return {
        feedTitle,
        feedLink,
        feedDescription,
        feedLogo,
        itemsRaw,
    };
}

export default async (ctx) => {
    // https://github.com/dilame/instagram-private-api#feeds
    // const availableCategories = ["accountFollowers", "accountFollowing", "news",
    //     "discover", "pendingFriendships", "blockedUsers", "directInbox", "directPending",
    //     "directThread", "user", "tag", "location", "mediaComments", "reelsMedia", "reelsTray",
    //     "timeline", "musicTrending", "musicSearch", "musicGenre", "musicMood", "usertags", "saved"];
    const availableCategories = ['user', 'tags'];
    // Unique key for a feed category
    // e.g. username for user feed
    const { category, key } = ctx.req.param();
    if (!availableCategories.includes(category)) {
        throw new Error('Such feed is not supported.');
    }

    if (config.instagram && config.instagram.proxy) {
        ig.state.proxyUrl = config.instagram.proxy;
    }

    await login(ig, cache);

    let data;
    try {
        data = await loadContent(category, key, cache.tryGet);
    } catch (error) {
        logger.error(`Instagram error: ${error}`);
        throw error;
    }

    ctx.set('data', {
        title: data.feedTitle,
        link: data.feedLink,
        description: data.feedDescription,
        item: renderItems(data.itemsRaw),
        icon: 'https://www.instagram.com/static/images/ico/xxhdpi_launcher.png/99cf3909d459.png',
        logo: data.feedLogo,
        image: data.feedLogo,
        allowEmpty: true,
    });
};
