import type { Context } from 'hono';
import { CookieJar } from 'tough-cookie';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import type { SpecExtraInstagram } from '@/types/spec-extra';

import { baseUrl, getUserInfo, renderGuestItems } from '../instagram/web-api/utils';

export const route: Route = {
    path: '/instagram/:username',
    categories: ['social-media'],
    example: '/spec/instagram/instagram',
    parameters: {
        username: 'Instagram username (no @). Found in the profile URL: instagram.com/:username',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    url: 'www.instagram.com',
    name: 'Instagram Posts',
    maintainers: ['koreanpatch'],
    radar: [
        {
            source: ['www.instagram.com/:username'],
            target: '/spec/instagram/:username',
        },
    ],
    handler,
    description: 'Guest web-api timeline (no cookie). Private profiles and heavy rate limits may fail — set `INSTAGRAM_COOKIE` on the upstream Instagram route for authenticated access.',
};

async function handler(ctx: Context): Promise<Data> {
    const username = ctx.req.param('username')?.trim().replace(/^@/, '');

    if (!username || !/^[\w.]+$/.test(username)) {
        throw new InvalidParameterError('Invalid Instagram username. Use the username from instagram.com/:username.');
    }

    // Guest path: empty jar (same as upstream /instagram/2/user/:key without cookie).
    const cookieJar = new CookieJar();
    const userInfo = await getUserInfo(username, cookieJar);

    const fullName = String(userInfo.full_name ?? username);
    const resolvedUsername = String(userInfo.username ?? username);
    const feedLogo = userInfo.profile_pic_url_hd ?? userInfo.hd_profile_pic_url_info?.url ?? userInfo.profile_pic_url;

    const edges = [...(userInfo.edge_felix_video_timeline?.edges ?? []), ...(userInfo.edge_owner_to_timeline_media?.edges ?? [])];

    const rendered = renderGuestItems(edges) as Array<{
        title: string;
        id: string;
        pubDate?: Date;
        author?: string;
        link: string;
        summary?: string;
        description?: string;
    }>;

    const items: DataItem[] = rendered.map((item, index) => {
        const node = edges[index]?.node;
        const shortcode = String(node?.shortcode ?? item.link.split('/').findLast(Boolean) ?? item.id);
        const link = item.link || `${baseUrl}/p/${shortcode}/`;
        const pubDate = item.pubDate;

        const extra: SpecExtraInstagram = {
            type: 'instagram/post',
            platform: 'instagram',
            sourceUrl: link,
            externalId: String(item.id),
            seriesExternalId: resolvedUsername,
            publishedAt: pubDate ? pubDate.toISOString() : undefined,
            username: resolvedUsername,
            shortcode,
        };

        return {
            title: item.title || shortcode,
            id: item.id,
            pubDate,
            author: item.author ?? resolvedUsername,
            link,
            summary: item.summary,
            description: item.description,
            guid: `spec-instagram-${resolvedUsername}-${shortcode}`,
            _extra: extra,
        };
    });

    return {
        title: `${fullName} (@${resolvedUsername}) - Instagram`,
        link: `${baseUrl}/${resolvedUsername}`,
        description: userInfo.biography,
        item: items,
        icon: `${baseUrl}/static/images/ico/xxhdpi_launcher.png/99cf3909d459.png`,
        logo: feedLogo,
        image: feedLogo,
        allowEmpty: true,
    };
}
