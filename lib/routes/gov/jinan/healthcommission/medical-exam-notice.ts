import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jinan/healthcommission/medical_exam_notice',
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
        title: '济南卫建委-执业考试通知',
        link: `${baseUrl}/col/col14418/index.html`,
        item: list.toArray().map((item) => {
            // 获取每个item对应的html字符串
            item = $(item).text();

            // 解析上一步中的html
            const html = load(item);

            const title = html('td[width="620"] a').attr('title');
            const link = html('td[width="620"] a').attr('href');
            const date = timezone(parseDate(html('td[width="100"]').text()), +8);
            return {
                title,
                description: title,
                pubDate: date,
                link,
                author: '济南市卫生健康委员会',
            };
        }),
    };
}
