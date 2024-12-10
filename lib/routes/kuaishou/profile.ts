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
    maintainers: ['nczitzk'],
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
    await page.goto(`https://www.kuaishou.com`);
    await new Promise((resolve) => {
        setTimeout(resolve, 3e3);
    });
    const maxRetryCount = 3;
    let retryCount = 0;
    let resolve;
    let userInfo;
    const promise = new Promise((res) => {
        resolve = res;
    });
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        const url = req.url();
        if (req.resourceType() === 'image' || req.resourceType() === 'media' || req.resourceType() === 'font') {
            req.abort();
        } else if (url.includes('/live_api/profile/public')) {
            const _url = new URL(url);
            _url.searchParams.set('count', '999');
            req.continue({
                url: _url.toString(),
            });
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
                if (retryCount > maxRetryCount) {
                    resolve({});
                }
                setTimeout(() => {
                    page.reload().then();
                    retryCount++;
                }, 3e3);
            }
        } else if (res.ok() && res.url().includes('/live_api/baseuser/userinfo/byid')) {
            // principalId
            const resData = await res.json();
            userInfo = resData.data.userInfo;
        }
    });

    await page.setCookie(
        {
            name: 'kpf',
            value: 'PC_WEB',
            domain: '.www.kuaishou.com',
        },
        {
            name: 'clientid',
            value: '3',
            domain: '.www.kuaishou.com',
        },
        {
            name: 'did',
            value: 'web_8fc521cc799984512f454de7d916ebab',
            domain: '.kuaishou.com',
        },
        {
            name: 'kpn',
            value: 'KUAISHOU_VISION',
            domain: '.www.kuaishou.com',
        }
    );
    await page.goto(`https://live.kuaishou.com/profile/${principalId}`);
    const resData = await cache.tryGet(`https://live.kuaishou.com/profile/${principalId}`, async () => {
        const data = (await promise.catch((error) => error)) as Array<any>;
        return data;
    });

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
