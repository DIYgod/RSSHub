import playwright from '@/utils/playwright';
import { getCookies } from '@/utils/playwright-utils';

/**
 * async function 获取cookie
 * @desc 返回一个可用的cookie，使用 `got` 发起请求的时候，传入到`options.headers.cookie`即可
 */
export default async function getCookie(host) {
    const context = await playwright();
    const page = await context.newPage();
    await page.route('**/*', (route) => {
        const request = route.request();
        request.resourceType() === 'document' || request.resourceType() === 'script' ? route.continue() : route.abort();
    });

    await page.goto(host, {
        waitUntil: 'networkidle',
    });

    const cookie = await getCookies(page);
    await context.close();
    return cookie;
}
