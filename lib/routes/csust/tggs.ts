import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { getNoticeContent } from './utils';

const baseUrl = 'https://www.csust.edu.cn';
const listPath = '/tggs.htm';

async function handler() {
    const response = await got(`${baseUrl}${listPath}`);
    const $ = load(response.body);

    const items = $('.list ul li')
        .toArray()
        .map((li) => {
            const $li = $(li);
            const linkRaw = $li.find('a').attr('href');
            const dateText = $li.find('.data1').text().trim();

            if (!linkRaw) {
                return null;
            }

            const dateMatch = dateText.match(/发布时间\s*[:：]\s*(\d{4}-\d{1,2}-\d{1,2})/);
            const pubDate = dateMatch ? parseDate(dateMatch[1]) : undefined;
            const link = linkRaw.startsWith('http') ? linkRaw : new URL(linkRaw, baseUrl).href;

            return { link, pubDate };
        })
        .filter((i) => i !== null);

    const enrichedItems = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    return await getNoticeContent(item);
                } catch {
                    return item;
                }
            })
        )
    );

    return {
        title: '长沙理工大学 - 通告公示',
        link: `${baseUrl}${listPath}`,
        description: '长沙理工大学通告公示',
        item: enrichedItems,
    };
}

export const route: Route = {
    path: '/tggs',
    categories: ['university'],
    example: '/csust/tggs',
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
            source: ['www.csust.edu.cn/tggs.htm', 'www.csust.edu.cn/'],
        },
    ],
    name: '通告公示',
    maintainers: ['powerfullz'],
    handler,
    url: 'www.csust.edu.cn/tggs.htm',
};
