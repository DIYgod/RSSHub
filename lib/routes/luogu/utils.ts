import cache from '@/utils/cache';
import ofetch from '@/utils/got';

interface LuoguUserResponse {
    data: {
        currentData: {
            user: {
                name: string;
                slogan: string;
                avatar: string;
            };
        };
    };
}

export const getUserInfoFromUID = (uid) =>
    cache.tryGet('luogu:username:' + uid, async () => {
        const data: LuoguUserResponse = await ofetch(`https://www.luogu.com/user/${uid}`, {
            query: {
                _contentOnly: 1,
            },
        });

        return {
            name: data.data.currentData.user.name,
            description: data.data.currentData.user.slogan,
            avatar: data.data.currentData.user.avatar,
        };
    });
