import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/iolaw/:section?',
    categories: ['study'],
    example: '/cssn/iolaw/zxzp',
    parameters: { section: 'Section ID, can be found in the URL. For example, the Section ID of URL `http://iolaw.cssn.cn/zxzp/` is `zxzp`. The default value is `zxzp`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Institute of Law',
    maintainers: ['HankChow'],
    handler,
};

async function handler(ctx) {
    const section = ctx.req.param('section') ?? 'zxzp';
    const domain = 'iolaw.cssn.cn';
    const currentUrl = `http://${domain}/${section}/`;
    const response = await got(currentUrl);
    const data = response.data;

    const $ = load(data);
    const list = $('div.notice_right ul li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const url = new URL($item.find('a').attr('href')!, currentUrl).href;
            const title = $item.find('a div.title').text();
            const publishedAt = $item.find('a p').text();
            return {
                title,
                link: url,
                author: '中国法学网',
                pubtime: publishedAt ? timezone(parseDate(publishedAt), 8) : undefined,
            };
        });

    return {
        title: '中国法学网',
        link: currentUrl,
        description: '中国法学网',
        item: list.map((item) => ({
            title: item.title,
            pubDate: item.pubtime,
            link: item.link,
            author: item.author,
        })),
    };
}
