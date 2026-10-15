import { type CheerioAPI, load } from 'cheerio';
import type { AnyNode } from 'domhandler';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

function loadDetail(list: AnyNode[], $: CheerioAPI, caches: typeof cache) {
    return pMap(
        list,
        async (item): Promise<DataItem> => {
            const noticeItem = $(item);
            const anchor = noticeItem.find('a');
            const href = anchor.attr('href');
            const title = anchor.attr('title') || anchor.text();
            if (!href || !title) {
                throw new Error('Shanghai examination notice is missing its link or title');
            }
            const url = 'http://www.shmeea.edu.cn' + href;
            if (!href.startsWith('/')) {
                return {
                    title,
                    description: `<a href="${href}" >附件</a>`,
                    link: href,
                };
            }
            const details = await caches.tryGet(`shmeea:self-study:v2:${url}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url,
                    headers: {
                        Referer: 'http://www.shmeea.edu.cn/page/04000/index.html',
                        Host: 'www.shmeea.edu.cn',
                    },
                });
                const detail = load(detailResponse.data);
                return {
                    description: detail('.Article_content').html(),
                    pubDate: timezone(parseDate(detail('.PBtime').text(), 'YYYY-MM-DD HH:mm:ss'), 8),
                };
            });
            return { title, link: url, ...details };
        },
        { concurrency: 3 }
    );
}

export const route: Route = {
    path: '/self-study',
    categories: ['study'],
    example: '/shmeea/self-study',
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
            source: ['www.shmeea.edu.cn/page/04000/index.html', 'www.shmeea.edu.cn/'],
        },
    ],
    name: '自学考试通知公告',
    maintainers: ['h2ws'],
    handler,
    url: 'www.shmeea.edu.cn/page/04000/index.html',
};

async function handler() {
    const response = await got({
        method: 'get',
        url: 'http://www.shmeea.edu.cn/page/04000/index.html',
        headers: {
            Host: 'www.shmeea.edu.cn',
        },
    });

    const data = response.data;

    const $ = load(data);
    const list = $('#main > div.container > div > div.span9 > div.page-he  > div  > ul > li').toArray();

    const detail = await loadDetail(list, $, cache);

    return {
        title: '上海自学考试 - 通知公告',
        link: 'http://www.shmeea.edu.cn/page/04000/index.html',
        item: detail,
    };
}
