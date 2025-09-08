import cache from '@/utils/cache';
import ofetch from '@/utils/got';

export const getUserInfoFromUID = (uid) =>
    cache.tryGet('luogu:username:' + uid, async () => {
        const data = await ofetch(`https://www.luogu.com/user/${uid}`, {
            query: {
                _contentOnly: 1,
            },
        });

        return {
            name: data.data.currentData.user.name,
            description: data.data.currentData.user.slogan,
            avatar: data.data.currentData.user.avatar,
        };
    }) as Promise<{ name: string; description: string; avatar: string }>;
