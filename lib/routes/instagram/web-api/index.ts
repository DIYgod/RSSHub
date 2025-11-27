import { CookieJar } from 'tough-cookie';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';

import { renderItems } from '../common-utils';
import { baseUrl, checkLogin, COOKIE_URL, getTagsFeed, getUserFeedItems, getUserInfo, renderGuestItems } from './utils';

export const route: Route = {
    path: '/2/:category/:key',
    categories: ['social-media'],
    example: '/instagram/2/user/stefaniejoosten',
    parameters: { category: 'Feed category, see table below', key: 'Username / Hashtag name' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'User Profile / Hashtag',
    maintainers: ['TonyRL'],
    handler,
    description: `::: tip
You may need to setup cookie for a less restrictive rate limit and private profiles.
:::


| User timeline | Hashtag |
| ------------- | ------- |
| user          | tags    |`,
};

async function handler(ctx) {
    // if (!config.instagram || !config.instagram.cookie) {
    //     throw new ConfigNotFoundError('Instagram RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    // }
    const availableCategories = ['user', 'tags'];
    const { category, key } = ctx.req.param();
    const { cookie } = config.instagram;
    if (!availableCategories.includes(category)) {
        throw new InvalidParameterError('Such feed is not supported.');
    }

    let cookieJar = await cache.get('instagram:cookieJar');
    // const wwwClaimV2 = await cache.get('instagram:wwwClaimV2');
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

    if (/* !wwwClaimV2 &&*/ cookie && !(await checkLogin(cookieJar))) {
        throw new ConfigNotFoundError('Invalid cookie');
    }

    let feedTitle, feedLink, feedDescription, feedLogo;
    let items;
    switch (category) {
        case 'user': {
            const userInfo = await getUserInfo(key, cookieJar);

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

            items = cookie ? await getUserFeedItems(id, username, cookieJar) : [...userInfo.edge_felix_video_timeline.edges, ...userInfo.edge_owner_to_timeline_media.edges];

            break;
        }
        case 'tags': {
            if (!config.instagram || !config.instagram.cookie) {
                throw new ConfigNotFoundError('Instagram RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
            }
            const tag = key;

            feedTitle = `#${tag} - Instagram`;
            feedLink = `${baseUrl}/explore/search/keyword/?q=%23${tag}`;

            const feedData = await getTagsFeed(tag, cookieJar);

            feedLogo = feedData.profile_pic_url;
            items = feedData.top.sections.flatMap((section) =>
                // either media or clips
                (section.feed_type === 'media' ? section.layout_content.medias : [...section.layout_content.one_by_two_item.clips.items, ...section.layout_content.fill_items]).map((item) => item.media)
            );

            break;
        }
        default:
            break;
    }

    await cache.set('instagram:cookieJar', cookieJar.toJSON(), 31_536_000);

    return {
        title: feedTitle,
        link: feedLink,
        description: feedDescription,
        item: cookie ? renderItems(items) : renderGuestItems(items),
        icon: `${baseUrl}/static/images/ico/xxhdpi_launcher.png/99cf3909d459.png`,
        logo: feedLogo,
        image: feedLogo,
        allowEmpty: true,
    };
}
