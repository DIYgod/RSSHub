const { CookieJar } = require('tough-cookie');
const config = require('@/config').value;
const { renderItems } = require('../common-utils');
const { baseUrl, COOKIE_URL, getUserInfo, getUserFeedItems, getTagsFeedItems } = require('./utils');

module.exports = async (ctx) => {
    if (!config.instagram || !config.instagram.cookie) {
        throw Error('Instagram RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }
    const availableCategories = ['user', 'tags'];
    const { category, key } = ctx.params;
    const { cookie } = config.instagram;
    if (!availableCategories.includes(category)) {
        throw Error('Such feed is not supported.');
    }

    let cookieJar = await ctx.cache.get('instagram:cookieJar');
    const cacheMiss = !cookieJar;
    if (cacheMiss) {
        cookieJar = new CookieJar();
        for await (const c of cookie.split('; ')) {
            await cookieJar.setCookie(c, COOKIE_URL);
        }
    } else {
        cookieJar = CookieJar.fromJSON(cookieJar);
    }

    let feedTitle, feedLink, feedDescription, feedLogo;
    let items;
    switch (category) {
        case 'user': {
            const userInfo = await getUserInfo(key, cookieJar, ctx.cache);

            // User feed metadata
            const { biography, full_name, id, username } = userInfo;
            feedTitle = `${full_name} (@${username}) - Instagram`;
            feedDescription = biography;
            // exists in web api ?? exist in private api ?? exist in both
            feedLogo = userInfo.profile_pic_url_hd ?? userInfo.hd_profile_pic_url_info?.url ?? userInfo.profile_pic_url;
            feedLink = `${baseUrl}/${username}`;

            items = await getUserFeedItems(id, username, cookieJar, ctx.cache.tryGet);
            break;
        }
        case 'tags': {
            const tag = key;

            feedTitle = `#${tag} - Instagram`;
            feedLink = `${baseUrl}/explore/tags/${tag}`;

            items = await getTagsFeedItems(tag, 'recent', cookieJar, ctx.cache.tryGet);
            break;
        }
        default:
            break;
    }

    await ctx.cache.set('instagram:cookieJar', cookieJar.toJSON(), 31536000);

    ctx.state.data = {
        title: feedTitle,
        link: feedLink,
        description: feedDescription,
        item: renderItems(items),
        icon: `${baseUrl}/static/images/ico/xxhdpi_launcher.png/99cf3909d459.png`,
        logo: feedLogo,
        image: feedLogo,
        allowEmpty: true,
    };
};
