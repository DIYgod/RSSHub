import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const baseTitle = '上海交通大学研究生招生网招考信息';
const baseUrl = 'https://yzb.sjtu.edu.cn/index/zkxx/';

export const route: Route = {
    path: '/yzb/zkxx/:type',
    categories: ['university'],
    example: '/sjtu/yzb/zkxx/sszs',
    parameters: { type: '无默认选项' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '研究生招生网招考信息',
    maintainers: ['stdrc'],
    handler,
    description: `| 博士招生 | 硕士招生 | 港澳台招生 | 考点信息 | 院系动态 |
  | -------- | -------- | ---------- | -------- | -------- |
  | bszs     | sszs     | gatzs      | kdxx     | yxdt     |`,
};

async function handler(ctx) {
    const pageUrl = `${baseUrl}${ctx.req.param('type')}.htm`;

    const response = await got({
        method: 'get',
        url: pageUrl,
        headers: {
            Referer: pageUrl,
        },
    });

    const $ = load(response.data);

    return {
        link: pageUrl,
        title: `${baseTitle} -- ${$('title').text().split('-')[0]}`,
        item: $('li[id^="line"] a')
            .toArray()
            .map((elem) => ({
                link: new URL(elem.attribs.href, pageUrl).href,
                title: $(elem).text(),
                pubDate: parseDate($(elem.next?.next).text().trim()),
            })),
    };
}
