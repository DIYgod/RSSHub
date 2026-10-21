import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/healthcommission/medical_exam_notice',
    categories: ['government'],
    example: '/gov/jinan/healthcommission/medical_exam_notice',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['jnmhc.jinan.gov.cn/*'],
        },
    ],
    name: '获取国家医师资格考试通知',
    maintainers: ['tzjyxb'],
    handler,
    url: 'jnmhc.jinan.gov.cn/*',
};

async function handler() {
    const baseUrl = 'https://jnmhc.jinan.gov.cn';

    const res = await got('https://jnmhc.jinan.gov.cn/module/web/jpage/dataproxy.jsp', {
        searchParams: {
            page: 1,
            webid: 28,
            path: '/',
            columnid: 14418,
            unitid: 18878,
            webname: '济南市卫生健康委员会',
            permissiontype: 0,
        },
    });

    const $ = load(res.data, { xmlMode: true });

    const list = $('record');

    return {
        title: '济南市卫生健康委员会 - 执业考试通知',
        link: `${baseUrl}/col/col14418/index.html`,
        item: list.toArray().map((item) => {
            // Extract the HTML fragment from each XML record.
            const $item = $(item).text();

            // Parse the record HTML.
            const html = load($item);

            const title = html('td[width="620"] a').attr('title');
            const link = new URL(html('td[width="620"] a').attr('href')!, `${baseUrl}/col/col14418/index.html`).href;
            const dateText = html('td[width="100"]').text();
            const date = dateText ? timezone(parseDate(dateText), 8) : undefined;
            return {
                title: title!,
                pubDate: date,
                link,
                author: '济南市卫生健康委员会',
            };
        }),
    };
}
