import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/doc',
    categories: ['government'],
    example: '/gov/suzhou/doc',
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
            source: ['www.suzhou.gov.cn/szsrmzf/cslm/contnet.shtml', 'www.suzhou.gov.cn/'],
            target: '/doc',
        },
    ],
    name: '政府信息公开文件',
    maintainers: ['EsuRt'],
    handler,
    url: 'www.suzhou.gov.cn/szsrmzf/cslm/contnet.shtml',
};

async function handler() {
    const link = 'https://www.suzhou.gov.cn/szsrmzf/cslm/contnet.shtml?sitecode=szsrmzf&CN_NAME=%E6%94%BF%E7%AD%96%E6%96%87%E4%BB%B6';
    const response = await ofetch<{ data: { list: Array<{ TITLE: string; URL: string; PUBLISHED_TIME_FORMAT?: string }> } }>('https://www.suzhou.gov.cn/szinf/xxgk/interfacesWebZcwj/loadData?&pageSize=15', {
        method: 'POST',
        body: new URLSearchParams({ pageIndex: '1' }),
    });
    const list = response.data.list.map((item): DataItem => {
        const pubDate = item.PUBLISHED_TIME_FORMAT ? timezone(parseDate(item.PUBLISHED_TIME_FORMAT, 'YYYY-MM-DD', true), 8) : undefined;
        return {
            title: item.TITLE,
            link: new URL(item.URL, link).href,
            pubDate: pubDate && Number.isFinite(pubDate.getTime()) ? pubDate : undefined,
        };
    });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                item.description = $('.article-content').html();
                item.author = $('dd.addWidth:nth-child(3) div').text().trim();
                item.pubDate = $('meta[name="PubDate"]').length ? timezone(parseDate($('meta[name="PubDate"]').attr('content')!, 'YYYY-MM-DD HH:mm:ss'), 8) : item.pubDate;
                item.category = $('.OwnerDept font')
                    .toArray()
                    .map((item) => $(item).text().trim());

                return item;
            })
        )
    );

    return {
        title: '苏州市政府 - 政策公开文件',
        link,
        item: items,
    };
}
