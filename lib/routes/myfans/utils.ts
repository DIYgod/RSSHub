import ofetch from '@/utils/ofetch';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import cache from '@/utils/cache';
import { Post, UserProfile } from './types';

const apiBaseUrl = 'https://api.myfans.jp';
export const baseUrl = 'https://myfans.jp';

const headers = {
    'google-ga-data': 'event328',
};

export const showByUsername = (username: string) =>
    cache.tryGet(`myfans:account:${username}`, async () => {
        const accountInfo = await ofetch<UserProfile>(`${apiBaseUrl}/api/v2/users/show_by_username`, {
            headers,
            query: {
                username,
            },
        });

        if (!accountInfo.id) {
            throw new InvalidParameterError('This creator does not exist.');
        }

        return accountInfo;
    }) as Promise<UserProfile>;

export const getPostByAccountId = async (accountId) => {
    const post = await ofetch(`${apiBaseUrl}/api/v2/users/${accountId}/posts`, {
        headers,
        query: {
            sort_key: 'publish_start_at',
            page: 1,
        },
    });

    return post.data as Promise<Post[]>;
};
