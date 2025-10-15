import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';
import { UserProfile, Videos } from './types';
import { art } from '@/utils/render';
import path from 'node:path';

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

const render = (data) => art(path.join(__dirname, 'templates/video.art'), data);

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
