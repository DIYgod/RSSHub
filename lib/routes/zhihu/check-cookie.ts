import { config } from '@/config';
import type { APIRoute } from '@/types';
import ofetch from '@/utils/ofetch';

export const apiRoute: APIRoute = {
    path: '/check-cookie',
    description: '检查 zhihu cookie 是否有效',
    maintainers: ['DIYgod'],
    handler,
};

async function handler() {
    const cookie = config.zhihu.cookies;

    if (!cookie) {
        return {
            code: -1,
        };
    }

    const response = await ofetch(`https://www.zhihu.com/api/v4/me?include=is_realname`, {
        headers: {
            Referer: `https://www.zhihu.com/`,
            Cookie: cookie as string,
        },
    });

    return {
        code: response.name ? 0 : -1,
    };
}
