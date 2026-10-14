import type { Data, Route } from '@/types';
import playwright from '@/utils/playwright';

async function getUserInfo(response: { json: () => Promise<any> }): Promise<{ name?: string } | undefined> {
    try {
        const result = await response.json();
        return result.data.userInfo;
    } catch {
        // Optional user-info responses must not replace the main profile response.
        return;
    }
}

const allowedResourceTypes = new Set(['document', 'script', 'xhr', 'fetch']);

export const route: Route = {
    name: 'Profile',
    path: '/profile/:principalId',
    radar: [
        {
            source: ['kuaishou.com/profile/:principalId'],
            target: '/profile/:principalId',
        },
    ],
    parameters: {
        principalId: '用户 id, 可在主页中找到',
    },
    example: '/kuaishou/profile/3xk46q9cdnvgife',
    maintainers: ['GuoChen-thlg'],
    url: 'kuaishou.com/profile/:principalId',
    description: `::: tip
The profile page of the user, which contains the user's information, videos, and other information.
:::`,
    features: { requirePuppeteer: true },
    handler,
};

async function handler(ctx) {
    const { principalId } = ctx.req.param();
    const context = await playwright();
    const userInfoRequests: Array<Promise<{ name?: string } | undefined>> = [];
    try {
        const page = await context.newPage();
        await page.route('**/*', (route) => (allowedResourceTypes.has(route.request().resourceType()) ? route.continue() : route.abort()));
        page.on('response', (response) => {
            if (response.ok() && new URL(response.url()).pathname.startsWith('/live_api/baseuser/userinfo/byid')) {
                userInfoRequests.push(getUserInfo(response));
            }
        });
        await page.goto('https://www.kuaishou.com', {
            waitUntil: 'domcontentloaded',
        });
        const [response] = await Promise.all([
            page.waitForResponse((response) => response.ok() && new URL(response.url()).pathname.startsWith('/live_api/profile/public'), { timeout: 30000 }),
            page.goto(`https://live.kuaishou.com/profile/${principalId}`, { waitUntil: 'domcontentloaded' }),
        ]);
        const resData = (await response.json()).data;
        const userInfo = (await Promise.all(userInfoRequests)).at(-1);

        const data: Data = {
            title: userInfo?.name ?? `${principalId}的作品 - 快手`,
            // description: JSON.stringify(resData),
            item:
                resData?.list?.map((item) => ({
                    // title: '',
                    author: item.author.name,
                    description: `<video controls preload="metadata" poster="${item.poster}">
                    <source src="${item.playUrl}" type="video/mp4">
                </video>`,
                    // link: '',
                    id: item.id,
                    guid: item.id,
                    banner: item.poster,
                    media: {
                        content: { url: item.playUrl },
                    },
                })) || [],
        };
        return data;
    } finally {
        await context.close();
        await Promise.allSettled(userInfoRequests);
    }
}
