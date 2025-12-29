import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import type { UserProfile, Videos } from './types';

export const route: Route = {
    path: '/profile/vids/:uid',
    radar: [
        {
            source: ['www.manyvids.com/Profile/:uid/:handle/Store/*', 'www.manyvids.com/Profile/:uid/:handle/Store'],
        },
    ],
    parameters: { uid: 'User ID, can be found in the URL.' },
    name: 'Creator Videos',
    example: '/manyvids/profile/vids/1001213004',
    maintainers: ['TonyRL'],
    handler,
    features: {
        nsfw: true,
    },
};

const getProfileById = (uid: string) => cache.tryGet(`manyvids:profile:${uid}`, () => ofetch(`https://www.manyvids.com/bff/profile/profiles/${uid}`)) as Promise<UserProfile>;

const render = ({ poster, src }: { poster: string; src: string }) =>
    renderToString(
        <video controls preload="metadata" poster={poster}>
            <source src={src} type="video/mp4" />
        </video>
    );

async function handler(ctx) {
    const { uid } = ctx.req.param();

    const profile = await getProfileById(uid);
    const videos = await ofetch<Videos>(`https://www.manyvids.com/bff/store/videos/${uid}/`, {
        query: { page: 1 },
    });

    const items = videos.data.map((v) => ({
        title: v.title,
        link: `https://www.manyvids.com/Video/${v.id}/${v.slug}`,
        author: v.creator.stageName,
        description: render({ poster: v.thumbnail.url, src: v.preview.url }),
    }));

    return {
        title: `${profile.displayName}'s Profile - Porn vids, Pics & More | ManyVids - ManyVids`,
        link: `https://www.manyvids.com/Profile/${uid}/${profile.urlHandle}/Store/Videos`,
        image: profile.avatar,
        description: profile.bio,
        item: items,
    };
}
