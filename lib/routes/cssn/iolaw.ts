import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

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
    const response = await got(`http://${domain}/${section}/`);
    const data = response.data;

    const $ = load(data);
    const list = $('div.notice_right ul li')
        .map((_, item) => {
            item = $(item);
            const url = `http://${domain}` + item.find('a').attr('href').slice(1);
            const title = item.find('a div.title').text();
            const publish_time = parseDate(item.find('a p').text());
            return {
                title,
                link: url,
                author: '中国法学网',
                pubtime: publish_time,
            };
        })
        .get();

    return {
        title: '中国法学网',
        url: `http://${domain}/${section}/`,
        description: '中国法学网',
        item: list.map((item) => ({
            title: item.title,
            pubDate: item.pubtime,
            link: item.link,
            author: item.author,
        })),
    };
}
