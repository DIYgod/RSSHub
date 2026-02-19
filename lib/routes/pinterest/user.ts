import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { BoardsFeedResource, UserActivityPinsResource, UserProfile } from './types';

export const route: Route = {
    path: '/user/:username/:type?',
    categories: ['picture'],
    example: '/pinterest/user/howieserious',
    parameters: {
        username: 'Username',
        type: {
            description: 'Type, default to `_created`',
            default: '_created',
            options: [
                { value: '_created', label: 'Created' },
                { value: '_saved', label: 'Saved' },
            ],
        },
    },
    radar: [
        {
            source: ['www.pinterest.com/:id/:type?', 'www.pinterest.com/:id'],
            target: '/user/:id/:type?',
        },
    ],
    name: 'User',
    maintainers: ['TonyRL'],
    handler,
};

const baseUrl = 'https://www.pinterest.com';

async function handler(ctx) {
    const { username, type = '_created' } = ctx.req.param();

    const profile = await getUserResource(username);
    const response = type === '_created' ? await getUserActivityPinsResource(username, profile.id) : await getBoardsFeedResource(username);

    const items =
        type === '_created'
            ? (response as UserActivityPinsResource[]).map((item) => ({
                  title: item.title || item.seo_title,
                  description: `${item.grid_description}<br><img src="${item.images.orig.url}">`,
                  link: `${baseUrl}${item.seo_url}`,
                  author: item.pinner.full_name,
                  pubDate: parseDate(item.created_at),
                  image: item.images.orig.url,
              }))
            : (response as BoardsFeedResource[]).map((item) => ({
                  title: item.name,
                  description: item.description + (item.images?.['170x'] ? '<br>' + item.images['170x'].map((img) => `<img src="${img.url}">`).join('') : ''),
                  link: `${baseUrl}${item.url}`,
                  author: item.owner.full_name,
                  pubDate: parseDate(item.created_at),
                  image: item.image_cover_hd_url,
              }));

    return {
        title: profile.seo_title,
        description: profile.seo_description,
        image: profile.image_xlarge_url ?? profile.image_medium_url,
        link: `${baseUrl}/${username}/`,
        item: items,
    };
}

const getUserResource = (username: string) =>
    cache.tryGet(`pinterest:user:${username}`, async () => {
        const response = await ofetch(`${baseUrl}/resource/UserResource/get/`, {
            headers: {
                'x-pinterest-pws-handler': 'www/[username]/_created.js',
            },
            query: {
                source_url: `/${username}/_created`,
                data: JSON.stringify({ options: { username, field_set_key: 'unauth_profile' }, context: {} }),
                _: Date.now(),
            },
        });

        return response.resource_response.data;
    }) as Promise<UserProfile>;

const getUserActivityPinsResource = async (username: string, userId: string) => {
    const response = await ofetch(`${baseUrl}/resource/UserActivityPinsResource/get/`, {
        headers: {
            'x-pinterest-pws-handler': 'www/[username]/_created.js',
        },
        query: {
            source_url: `/${username}/_created`,
            data: JSON.stringify({ options: { exclude_add_pin_rep: true, field_set_key: 'grid_item', is_own_profile_pins: false, user_id: userId, username }, context: {} }),
            _: Date.now(),
        },
    });

    return response.resource_response.data as UserActivityPinsResource[];
};

const getBoardsFeedResource = async (username: string) => {
    const response = await ofetch(`${baseUrl}/resource/BoardsFeedResource/get/`, {
        headers: {
            'x-pinterest-pws-handler': 'www/[username]/_saved.js',
        },
        query: {
            source_url: `/${username}/_saved`,
            data: JSON.stringify({ options: { field_set_key: 'profile_grid_item', filter_stories: false, sort: 'last_pinned_to', username }, context: {} }),
            _: Date.now(),
        },
    });

    return (response.resource_response.data as BoardsFeedResource[]).filter((item) => item.node_id);
};
