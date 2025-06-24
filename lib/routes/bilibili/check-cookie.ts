import { APIRoute } from '@/types';
import cacheIn from './cache';
import ofetch from '@/utils/ofetch';

export const apiRoute: APIRoute = {
    path: '/check-cookie',
    description: '检查 bilibili cookie 是否有效',
    maintainers: ['DIYgod'],
    handler,
};

async function handler() {
    const cookie = await cacheIn.getCookie();

    if (!cookie) {
        return {
            code: -1,
        };
    }

    const response = await ofetch(`https://api.bilibili.com/x/web-interface/nav`, {
        headers: {
            Referer: `https://space.bilibili.com/1/`,
            Cookie: cookie as string,
        },
    });

    return {
        code: response.code === 0 && !!response.data.mid ? 0 : -1,
    };
}
