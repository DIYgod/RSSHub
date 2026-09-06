import { load } from 'cheerio';

import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news',
    categories: ['university'],
    example: '/cqut/news',
    features: {
        requirePuppeteer: true,
        antiCrawler: true,
    },
    radar: [{ source: ['www.cqut.edu.cn/tzgg/xxtz1.htm'] }],
    name: '学校通知',
    maintainers: ['Colin-XKL'],
    handler,
};

async function handler() {
    const link = 'https://www.cqut.edu.cn/tzgg/xxtz1.htm';

    const { page, destroy } = await getPlaywrightPage(link, {
        onBeforeLoad: async (page) => {
            await page.route('**/*', (route) => {
                const request = route.request();
                ['document', 'script'].includes(request.resourceType()) ? route.continue() : route.abort();
            });
        },
        gotoConfig: { waitUntil: 'networkidle' },
    });

    const response = await page.content();
    await destroy();

    const $ = load(response);

    return {
        title: '重庆理工大学 - 学校通知',
        link,
        item: $('.sub_list075 ul li[id^="line_"]')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const title = $item.find('.title');
                title.find('em').remove();
                return {
                    title: title.text(),
                    description: $item.find('.info').text().trim(),
                    link: new URL($item.find('a').attr('href')!, link).href,
                    pubDate: timezone(parseDate(`${$item.find('.month').text()}-${$item.find('.day').text()}`, 'YYYY-MM-DD'), 8),
                };
            }),
    };
}
