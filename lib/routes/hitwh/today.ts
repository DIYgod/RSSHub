import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

function parsePublicationDate(value?: string) {
    if (!value?.trim()) {
        return;
    }
    const date = parseDate(value);
    return Number.isNaN(date.getTime()) ? undefined : timezone(date, 8);
}

const baseUrl = 'https://today.hitwh.edu.cn';

export const route: Route = {
    path: '/today',
    categories: ['university'],
    example: '/hitwh/today',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['today.hitwh.edu.cn/1024/list.htm', 'today.hitwh.edu.cn/'],
        },
    ],
    name: '今日工大 - 通知公告',
    maintainers: ['raptazure'],
    handler,
    url: 'today.hitwh.edu.cn/1024/list.htm',
};

async function handler() {
    const response = await got(`${baseUrl}/1024/list.htm`);
    const $ = load(response.data);
    const type = (filename) => filename.split('.').pop();
    const links = $('.list_list_wrap #wp_news_w10002 ul > li')
        .toArray()
        .map((el): DataItem & { link: string } => ({
            pubDate: parsePublicationDate($(el).find('.news-time2').text()),
            link: new URL($(el).find('a').attr('href')!, baseUrl).href,
            title: $(el).find('a').text(),
        }));

    return {
        title: '哈尔滨工业大学（威海）通知公告',
        link: `${baseUrl}/1024/list.htm`,
        item: await pMap(
            links,
            async (item) => ({
                ...item,
                ...(await cache.tryGet(item.link, async () => {
                    if (type(item.link) !== 'htm') {
                        // file to download
                        return { description: '此链接为文件，点击以下载' };
                    }
                    const { data } = await got(item.link);
                    const $ = load(data);
                    return { description: $('div.wp_articlecontent').html() ?? undefined };
                })),
            }),
            { concurrency: 3 }
        ),
    };
}
