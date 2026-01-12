import { config } from '@/config';
import type { Data, Route } from '@/types';
import puppeteer from '@/utils/puppeteer';

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
    handler,
};

async function handler(ctx) {
    const { principalId } = ctx.req.param();
    const browser = await puppeteer();
    const page = await browser.newPage();

    let retryCount = 0;
    let resolve;
    let userInfo;
    const promise = new Promise((res) => {
        resolve = res;
    });
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (resourceType === 'image' || resourceType === 'media' || resourceType === 'font' || resourceType === 'stylesheet' || resourceType === 'ping') {
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
                if (retryCount > config.requestRetry) {
                    resolve({});
                }
                setTimeout(() => {
                    page.reload().then();
                    retryCount++;
                }, 3000);
            }
        } else if (res.ok() && res.url().includes('/live_api/baseuser/userinfo/byid')) {
            // principalId
            const resData = await res.json();
            userInfo = resData.data.userInfo;
        }
    });
    await page.goto('https://www.kuaishou.com', {
        waitUntil: 'domcontentloaded',
    });
    await page.goto(`https://live.kuaishou.com/profile/${principalId}`);
    const resData = (await promise.catch((error) => error)) as any[];

    await browser.close();
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
}
