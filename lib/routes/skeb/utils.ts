import path from 'node:path';

import { config } from '@/config';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { art } from '@/utils/render';

export const baseUrl = 'https://skeb.jp';

interface Work {
    path: string;
    private_thumbnail_image_urls: null | string;
    private: boolean;
    genre: string;
    tipped: boolean;
    creator_id: number;
    client_id: number;
    vtt_url: null | string;
    thumbnail_image_urls: {
        src: string;
        srcset: string;
    };
    preview_url: null | string;
    duration: null | number;
    nsfw: boolean;
    hardcore: boolean;
    consored_thumbnail_image_urls: {
        src: string;
        srcset: string;
    };
    body: string;
    nc: number;
    word_count: number;
    transcoder: string;
    creator_acceptable_same_genre: boolean;
}

interface Creator {
    id: number;
    creator: boolean;
    nsfw_acceptable: boolean;
    acceptable: boolean;
    name: string;
    screen_name: string;
    avatar_url: string;
    header_url: string | null;
    appeal_receivable: boolean;
    popular_creator_rank: number | null;
    request_master_rank: number | null;
    first_requester_rank: number | null;
    deleted_at: string | null;
    tip_acceptable_by: string;
    accept_expiration_days: number;
    skills: { genre: string }[];
    nc: number;
}

export function processWork(work: Work): DataItem | null {
    if (!work || typeof work !== 'object' || work.private === true) {
        return null;
    }

    const imageUrl = work.thumbnail_image_urls?.srcset?.split(',').pop()?.trim().split(' ')[0] || '';
    const body = work.body || '';

    const audioUrl = work.genre === 'music' || work.genre === 'voice' ? work.preview_url : null;

    const renderedHtml = art(path.join(__dirname, 'templates/work.art'), {
        imageUrl,
        body,
        audioUrl,
    });

    return {
        title: work.path || '',
        link: `${baseUrl}${work.path || ''}`,
        description: renderedHtml,
    };
}

const skillMap = {
    art: 'Illust',
    voice: 'Voice',
    novel: 'Novel',
    video: 'Video',
    music: 'Music',
    correction: 'Advice',
    comic: 'Comic',
};

export function processCreator(creator: Creator): DataItem | null {
    if (!creator || typeof creator !== 'object') {
        return null;
    }

    const avatarUrl = creator.avatar_url || '';

    let renderedHtml;

    if (creator.creator) {
        const acceptingCommissions = creator.acceptable ? 'Yes' : 'No';
        const nsfwAcceptable = creator.nsfw_acceptable ? 'Yes' : 'No';

        let skills = '';
        if (Array.isArray(creator.skills) && creator.skills.length > 0) {
            skills = creator.skills
                .map((skill) => skillMap[skill.genre] || skill.genre)
                .filter(Boolean)
                .join(', ');
        }

        renderedHtml = art(path.join(__dirname, 'templates/creator.art'), {
            avatarUrl,
            acceptingCommissions,
            nsfwAcceptable,
            skills,
        });
    }

    return {
        title: creator.name || '',
        link: `${baseUrl}/@${creator.screen_name || ''}`,
        description: renderedHtml,
    };
}

export async function getFollowingsItems(username: string, path: 'friend_works' | 'following_works' | 'following_creators'): Promise<DataItem[]> {
    const url = `${baseUrl}/api/users/${username.replace('@', '')}/followings`;

    const followings_data = await cache.tryGet(
        `skeb:followings_data:${username}`,
        async () => {
            const data = await ofetch(url, {
                headers: {
                    Authorization: `Bearer ${config.skeb.bearerToken}`,
                },
            });
            return data;
        },
        config.cache.routeExpire,
        false
    );

    if (!followings_data || typeof followings_data !== 'object') {
        throw new Error('Failed to fetch followings data');
    }

    if (path === 'following_creators') {
        return followings_data[path].map((item) => processCreator(item)).filter(Boolean) as DataItem[];
    }
    return followings_data[path].map((item) => processWork(item)).filter(Boolean) as DataItem[];
}
