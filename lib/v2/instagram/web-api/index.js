const { CookieJar } = require('tough-cookie');
const config = require('@/config').value;
const { renderItems } = require('../common-utils');
const { baseUrl, COOKIE_URL, checkLogin, getUserInfo, getUserFeedItems, getTagsFeedItems, getLoggedOutTagsFeedItems, renderGuestItems } = require('./utils');

module.exports = async (ctx) => {
    // if (!config.instagram || !config.instagram.cookie) {
    //     throw Error('Instagram RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    // }
    const availableCategories = ['user', 'tags'];
    const { category, key } = ctx.params;
    const { cookie } = config.instagram;
    if (!availableCategories.includes(category)) {
        throw new Error('Such feed is not supported.');
    }

    let cookieJar = await ctx.cache.get('instagram:cookieJar');
    const wwwClaimV2 = await ctx.cache.get('instagram:wwwClaimV2');
    const cacheMiss = !cookieJar;

    if (cacheMiss) {
        cookieJar = new CookieJar();
        if (cookie) {
            for await (const c of cookie.split('; ')) {
                await cookieJar.setCookie(c, COOKIE_URL);
            }
        }
    } else {
        cookieJar = CookieJar.fromJSON(cookieJar);
    }

    if (!wwwClaimV2 && cookie && !(await checkLogin(cookieJar, ctx.cache))) {
        throw new Error('Invalid cookie');
    }

    let feedTitle, feedLink, feedDescription, feedLogo;
    let items;
    switch (category) {
        case 'user': {
            const userInfo = await getUserInfo(key, cookieJar, ctx.cache);

            // User feed metadata
            const biography = userInfo.biography;
            const fullName = userInfo.full_name;
            const id = userInfo.id;
            const username = userInfo.username;
            feedTitle = `${fullName} (@${username}) - Instagram`;
            feedDescription = biography;
            // exists in web api ?? exist in private api ?? exist in both
            feedLogo = userInfo.profile_pic_url_hd ?? userInfo.hd_profile_pic_url_info?.url ?? userInfo.profile_pic_url;
            feedLink = `${baseUrl}/${username}`;

            items = cookie ? await getUserFeedItems(id, username, cookieJar, ctx.cache) : [...userInfo.edge_felix_video_timeline.edges, ...userInfo.edge_owner_to_timeline_media.edges];

            break;
        }
        case 'tags': {
            const tag = key;

            feedTitle = `#${tag} - Instagram`;
            feedLink = `${baseUrl}/explore/tags/${tag}`;

            if (cookie) {
                items = await getTagsFeedItems(tag, 'recent', cookieJar, ctx.cache.tryGet);
            } else {
                const hashTag = await getLoggedOutTagsFeedItems(tag, cookieJar);
                items = [...hashTag.edge_hashtag_to_media.edges, ...hashTag.edge_hashtag_to_top_posts.edges];
            }

            break;
        }
        default:
            break;
    }

    await ctx.cache.set('instagram:cookieJar', cookieJar.toJSON(), 31_536_000);

    ctx.state.data = {
        title: feedTitle,
        link: feedLink,
        description: feedDescription,
        item: cookie ? renderItems(items) : renderGuestItems(items),
        icon: `${baseUrl}/static/images/ico/xxhdpi_launcher.png/99cf3909d459.png`,
        logo: feedLogo,
        image: feedLogo,
        allowEmpty: true,
    };
};
