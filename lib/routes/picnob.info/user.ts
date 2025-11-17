import { config } from '@/config';
import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';
import { Post, Profile, Pull, Status, Story } from './types';
import xxhash from 'xxhash-wasm';

export const route: Route = {
    path: '/user/:id/:type?',
    categories: ['social-media'],
    example: '/picnob.info/user/xlisa_olivex',
    parameters: {
        id: 'Instagram id',
        type: {
            description: 'Type of profile page',
            default: 'posts',
            options: [
                { label: 'Posts', value: 'posts' },
                { label: 'Stories', value: 'stories' },
            ],
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'User Profile - Picnob',
    maintainers: ['TonyRL'],
    handler,
    view: ViewType.Pictures,
    url: 'picnob.info',
};

const renderVideo = (video, poster) => `<video controls poster="${poster}"><source src="${video}" type="video/mp4"></video>`;
const renderImage = (src) => `<img src="${src}">`;
const renderDescription = (type: Post['postType'], item: Post | Story) => {
    let media = '';
    switch (type) {
        case 'carousel':
            media = item.albumItems
                ?.map((albumItem: any) => {
                    if (albumItem.mediaType === 'video') {
                        return renderVideo(albumItem.videoUrl, albumItem.thumbnailImageUrl);
                    }
                    return renderImage(albumItem.thumbnailImageUrl);
                })
                .join('<br>');
            break;
        case 'video':
            media = renderVideo(item.videoUrl, item.thumbnailImageUrl);
            break;
        default:
            // image
            media = renderImage(item.thumbnailImageUrl);
    }
    return `${media}<br>${item.text?.replaceAll('\n', '<br>') ?? ''}`;
};

async function handler(ctx) {
    const baseUrl = 'https://picnob.info';
    const id = ctx.req.param('id');
    const type = ctx.req.param('type') ?? 'posts';
    const INSTALKER_BACK_API_KEY = '1263fd960207e2d481eff2c60feeae1541f6e90419283f7e674a36d8ac706462';
    const { h64ToString } = await xxhash();

    if (type !== 'posts' && type !== 'stories') {
        throw new Error('Invalid type parameter. Allowed values are "posts" and "stories".');
    }

    // SHA256(id)
    const requestHash = await cache.tryGet(
        `picnob.info:pulls:${id}`,
        async () => {
            const pullInfo = await ofetch<Pull>(`${baseUrl}/api/v1/pulls`, {
                headers: {
                    'x-api-key': INSTALKER_BACK_API_KEY,
                },
                method: 'POST',
                body: { account: id, type: 'all', isPrivate: false },
            });
            return pullInfo.request_hash;
        },
        config.cache.routeExpire,
        false
    );

    for (let attempt = 0; attempt < 10; attempt++) {
        // eslint-disable-next-line no-await-in-loop
        const status = await ofetch<Status[]>(`${baseUrl}/api/v1/pulls/${requestHash}/status`, {
            headers: {
                'x-api-key': INSTALKER_BACK_API_KEY,
            },
        });
        const allSuccess = Array.isArray(status) && status.every((item) => item.status === 'success');
        if (allSuccess) {
            break;
        }
        if (attempt < 9) {
            // eslint-disable-next-line no-await-in-loop
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
    }

    const profile = await cache.tryGet(
        `picnob.info:profile:${id}`,
        () =>
            ofetch<Profile>(`${baseUrl}/api/v1/accounts/${id}/profile`, {
                headers: {
                    'x-api-key': INSTALKER_BACK_API_KEY,
                },
            }),
        config.cache.contentExpire
    );
    const data = await cache.tryGet(
        `picnob.info:${type}:${id}`,
        () =>
            ofetch<Post[] | Story[]>(`${baseUrl}/api/v1/accounts/${id}/${type}`, {
                headers: {
                    'x-api-key': INSTALKER_BACK_API_KEY,
                },
            }),
        config.cache.routeExpire,
        false
    );

    const items = data.map((item) => ({
        title: item.text?.split('\n')[0],
        guid: item.id ?? h64ToString(`${item.account_name}:${item.takenAt}:${item.thumbnailImageUrl}`),
        author: item.account_name,
        pubDate: parseDate(item.takenAt),
        description: renderDescription(item.postType ?? item.mediaType, item),
    }));

    return {
        title: `${profile.fullName} (@${id}) ${type === 'stories' ? 'story' : 'public'} posts - Picnob`,
        description: profile.biography.replaceAll('\n', ' '),
        link: `https://www.instagram.com/${id}/`,
        image: profile.profilePicHdImageId ?? profile.profilePicImageId,
        item: items,
    };
}
