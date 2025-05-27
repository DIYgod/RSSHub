import { APIRoute } from '@/types';
import { checkCookie } from './util';

export const apiRoute: APIRoute = {
    path: '/check-cookie',
    description: '检查小红书 cookie 是否有效',
    maintainers: ['DIYgod'],
    handler,
};

async function handler() {
    const valid = await checkCookie();
    return {
        code: valid ? 0 : -1,
    };
}
