import { type Cheerio, load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/gs',
    categories: ['university'],
    example: '/tongji/gs',
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
            source: ['gs.tongji.edu.cn/tzgg.htm', 'gs.tongji.edu.cn/'],
        },
    ],
    name: '研究生院通知公告',
    maintainers: ['sitdownkevin'],
    handler,
    url: 'gs.tongji.edu.cn/tzgg.htm',
};
async function getNoticeContent(link: string) {
    const response = await got(link);
    const $ = load(response.body);
    const main = $('.v_news_content').first();
    const content = main.length ? main : $('#vsb_content');
    const attachments = mapElements(
        content
            .closest('form')
            .find('ul')
            .filter((_, element) => !content.find(element).length && $(element).find('a[href*="news.DownloadAttachUrl"]').length > 0),
        (_, element) => $.html(element)
    ).join('');
    return { description: (content.html() ?? '') + attachments || undefined };
}
async function handler() {
    const baseUrl = 'https://gs.tongji.edu.cn';
    const response = await got(`${baseUrl}/tzgg.htm`);
    const $ = load(response.body);
    const container = $('body > div > div.con_list.ma0a > div > div.list_content_right > div.list_list > ul');
    const items = container
        .find('li')
        .toArray()
        .map((item) => {
            const title = $(item).find('a').attr('title')!;
            const linkRaw = $(item).find('a').attr('href');
            const link = linkRaw!.startsWith('http') ? linkRaw : `${baseUrl}/${linkRaw}`;
            const pubDate = $(item).find('span').text();
            return { title, link, pubDate: timezone(parseDate(pubDate, 'YYYY-MM-DD'), 8) };
        });
    const itemsWithContent = await pMap(items, async (item) => ({ ...item, ...(await cache.tryGet(`tongji:gs:article:${item.link}`, () => getNoticeContent(item.link!))) }), { concurrency: 3 });
    return {
        title: '同济大学研究生院',
        link: baseUrl,
        description: '同济大学研究生院通知公告',
        image: 'https://upload.wikimedia.org/wikipedia/zh/f/f8/Tongji_University_Emblem.svg',
        icon: 'https://upload.wikimedia.org/wikipedia/zh/f/f8/Tongji_University_Emblem.svg',
        logo: 'https://upload.wikimedia.org/wikipedia/zh/f/f8/Tongji_University_Emblem.svg',
        item: itemsWithContent,
    };
}
function mapElements<T, U>(selection: Cheerio<T>, mapper: (index: number, node: T) => U | U[] | null | undefined): U[] {
    return selection.toArray().flatMap((node, index) => mapper(index, node) ?? []);
}
