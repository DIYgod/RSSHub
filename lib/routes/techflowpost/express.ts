import { Route } from '@/types';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import dayjs from 'dayjs';

export const route: Route = {
    path: ['/express', '/newsflash'],
    categories: ['finance'],
    example: '/techflowpost/express',
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
            source: ['techflowpost.com/newsletter/index.html'],
        },
    ],
    name: '快讯',
    maintainers: ['nczitzk'],
    handler,
    url: 'techflowpost.com/',
    url: 'techflowpost.com/newsletter/index.html',
};

async function handler(ctx) {
    const rootUrl = 'https://www.techflowpost.com';
    const currentUrl = `${rootUrl}/newsletter/index.html`;

    const { data: response } = await got.post('https://www.techflowpost.com/ashx/newflash_index.ashx', {
        form: {
            pageindex: 1,
            pagesize: ctx.req.query('limit') ?? 50,
            time: dayjs().format('YYYY/M/D HH:mm:ss'),
        },
    });

    const items = response.content.map((item) => ({
        title: item.stitle,
        link: `${rootUrl}/newsletter/detail_${item.nnewflash_id}.html`,
        pubDate: timezone(parseDate(item.dcreate_time), +8),
        updated: timezone(parseDate(item.dmodi_time), +8),
        description: item.scontent,
    }));

    return {
        title: '深潮TechFlow - 快讯',
        link: currentUrl,
        item: items,
    };
}
