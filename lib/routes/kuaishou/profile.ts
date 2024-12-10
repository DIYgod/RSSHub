import { Route, Data } from '@/types';
import puppeteer from '@/utils/puppeteer';
import cache from '@/utils/cache';
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
    description: `:::tip
The profile page of the user, which contains the user's information, videos, and other information.
    :::`,
    handler,
};

async function handler(ctx) {
    const { principalId } = ctx.req.param();
    const browser = await puppeteer();
    const page = await browser.newPage();

    let resolve;
    let userInfo;
    const promise = new Promise((res) => {
        resolve = res;
    });
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (req.resourceType() === 'image' || req.resourceType() === 'media' || req.resourceType() === 'font') {
            req.abort();
        } else {
            req.continue();
        }
    });
    page.on('response', async (res) => {
        if (res.ok() && res.url().includes('/live_api/profile/public')) {
            const resData = await res.json();
            if (resData.data.list.length > 0) {
                resolve(resData.data);
            } else {
                resolve({});
            }
        } else if (res.ok() && res.url().includes('/live_api/baseuser/userinfo/byid')) {
            // principalId
            const resData = await res.json();
            userInfo = resData.data.userInfo;
        }
    });

    await page.goto('https://www.kuaishou.com', { waitUntil: 'domcontentloaded' });
    await page.goto(`https://live.kuaishou.com/profile/${principalId}`);
    const resData = await cache.tryGet(`https://live.kuaishou.com/profile/${principalId}`, async () => (await promise.catch((error) => error)) as Array<any>);

    await browser.close();
    const data: Data = {
        title: userInfo?.name ?? `${principalId}的作品 - 快手`,
        // description: JSON.stringify(resData),
        item:
            resData?.list?.map((item) => ({
                // title: '',
                author: item.author.name,

                // link: '',
                id: item.id,
                banner: item.poster,
                media: {
                    content: { url: item.playUrl },
                },
            })) || [],
    };
    return data;
}
