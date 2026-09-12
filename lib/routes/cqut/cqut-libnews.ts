import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/libnews',
    categories: ['university'],
    example: '/cqut/libnews',
    features: {
        requirePuppeteer: true,
        antiCrawler: true,
    },
    radar: [{ source: ['lib.cqut.edu.cn/*'] }],
    name: '图书馆通知',
    maintainers: ['Colin-XKL'],
    handler,
};

async function handler() {
    const baseUrl = 'https://lib.cqut.edu.cn';
    const engineInstanceId = 2_279_098;
    const link = `${baseUrl}/engine2/m/92B7143BAD30EE0E?p=308147`;

    const { page, destroy } = await getPlaywrightPage(link, { noGoto: true });
    try {
        await page.route('**/*', (route) => (['document', 'script', 'xhr', 'fetch'].includes(route.request().resourceType()) ? route.continue() : route.abort()));
        const responsePromise = page.waitForResponse((response) => response.url().includes('/type/more-datas'), { timeout: 3000 });
        await page.goto(link, { waitUntil: 'domcontentloaded' });
        const apiResponse = await responsePromise;
        const { data } = await apiResponse.json();

        return {
            title: '重庆理工大学中山图书馆资讯',
            link,
            item: data.datas.datas.map((item) => ({
                title: item['1'].value,
                link: `${baseUrl}/engine2/d/${item.id}/${engineInstanceId}/0`,
                pubDate: timezone(parseDate(item['6'].value), 8),
            })),
        };
    } finally {
        await destroy();
    }
}
