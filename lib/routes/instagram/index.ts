import { CookieJar } from 'tough-cookie';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import RejectError from '@/errors/types/reject';
import type { Route } from '@/types';
import cache from '@/utils/cache';

import { renderItems } from './templates/render';
import { baseUrl, checkLogin, getHighlightIds, getPage, getReelsMedia, getTagsFeed, getUserFeed, getUserInfo } from './web-api/utils';

export const route: Route = {
    path: '/:category/:key',
    categories: ['social-media'],
    example: '/instagram/user/stefaniejoosten',
    parameters: { category: 'Feed category, see table below', key: 'Username / Hashtag name' },
    features: {
        requireConfig: [
            {
                name: 'INSTAGRAM_COOKIE',
                optional: true,
                description: 'Instagram cookie, only `sessionid` and `ds_user_id` are required.',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'User Profile / Hashtag',
    maintainers: ['TonyRL'],
    handler,
    description: `| User timeline | Current stories | Highlighted stories | Hashtag |
| ------------- | --------------- | ------------------- | ------- |
| user          | stories         | highlights          | tags    |

Stories, highlights and hashtags require a cookie.`,
};

async function handler(ctx) {
    const availableCategories = ['user', 'stories', 'highlights', 'tags'];
    const { category, key } = ctx.req.param();
    const { cookie } = config.instagram;
    if (!availableCategories.includes(category)) {
        throw new InvalidParameterError('Such feed is not supported.');
    }
    if (category !== 'user' && !cookie) {
        throw new ConfigNotFoundError('Instagram RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }

    let cookieJar: any = await cache.get('instagram:cookieJar');
    const cacheMiss = !cookieJar;

    if (cacheMiss) {
        cookieJar = new CookieJar();
        if (cookie) {
            for await (const c of cookie.split('; ')) {
                await cookieJar.setCookie(c, baseUrl);
            }
        }
    } else {
        cookieJar = CookieJar.fromJSON(cookieJar);
    }

    if (cookie && !(await checkLogin(cookieJar))) {
        throw new ConfigNotFoundError('Invalid cookie');
    }

    let feedTitle, feedLink, feedDescription, feedLogo;
    let items;
    let pagePromise: ReturnType<typeof getPage> | undefined;
    const page = () => (pagePromise ??= getPage(key, cookieJar));
    const getUser = async () => {
        const user = await getUserInfo(key, cookieJar, page);
        if (user.is_private && !user.friendship_status?.following) {
            throw new RejectError(`@${user.username} is a private ${cookie ? '' : ', set `INSTAGRAM_COOKIE` with an account that follows it'}`);
        }
        return user;
    };
    switch (category) {
        case 'user': {
            const user = await getUser();

            feedTitle = `${user.full_name} (@${user.username}) - Instagram`;
            feedDescription = user.biography;
            feedLogo = user.hd_profile_pic_url_info?.url ?? user.profile_pic_url;
            feedLink = `${baseUrl}/${user.username}`;

            items = renderItems(await getUserFeed(key, cookieJar, page));

            break;
        }
        case 'stories': {
            const user = await getUser();

            feedTitle = `${user.full_name} (@${user.username}) - Instagram Stories`;
            feedDescription = user.biography;
            feedLogo = user.hd_profile_pic_url_info?.url ?? user.profile_pic_url;
            feedLink = `${baseUrl}/stories/${user.username}/`;

            const reels = await getReelsMedia([user.id], false, cookieJar, page);
            items = renderItems(reels[0]?.items ?? []);

            break;
        }
        case 'highlights': {
            const user = await getUser();

            feedTitle = `${user.full_name} (@${user.username}) - Instagram Highlights`;
            feedDescription = user.biography;
            feedLogo = user.hd_profile_pic_url_info?.url ?? user.profile_pic_url;
            feedLink = `${baseUrl}/${user.username}`;

            const highlightIds = await getHighlightIds(user.id, cookieJar, page);
            const highlights = highlightIds.length ? await getReelsMedia(highlightIds, true, cookieJar, page) : [];

            items = highlights.flatMap((highlight) =>
                renderItems(highlight.items).map((item) => ({
                    ...item,
                    title: highlight.title,
                    link: `${baseUrl}/stories/highlights/${highlight.id.split(':', 2)[1]}/`,
                }))
            );

            break;
        }
        case 'tags': {
            const tag = key;

            feedTitle = `#${tag} - Instagram`;
            feedLink = `${baseUrl}/explore/search/keyword/?q=%23${tag}`;

            const feedData = await getTagsFeed(tag, cookieJar);

            feedLogo = feedData.profile_pic_url;
            items = renderItems(
                feedData.top.sections.flatMap((section) =>
                    // either media or clips
                    (section.feed_type === 'media' ? section.layout_content.medias : [...section.layout_content.one_by_two_item.clips.items, ...section.layout_content.fill_items]).map((item) => item.media)
                )
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
        item: items,
        logo: feedLogo,
        image: feedLogo,
        allowEmpty: true,
    };
}
