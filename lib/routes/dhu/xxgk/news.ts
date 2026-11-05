import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { selectItems } from '../utils';

const siteUrl = 'https://xxgk.dhu.edu.cn';
const baseUrl = 'https://xxgk.dhu.edu.cn/1737/list.htm';

export const route: Route = {
    path: '/xxgk/news',
    categories: ['university'],
    example: '/dhu/xxgk/news',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '最新信息公开',
    maintainers: ['KiraKiseki'],
    handler,
};

async function handler() {
    const link = baseUrl;
    const { data: response } = await got(link);

    const $ = load(response);

    const list = $('.cols_list > li')
        .toArray()
        .map((element) => {
            const $item = $(element);
            const colsTitle = $item.find('.cols_title > a');
            return {
                title: colsTitle.text(),
                link: new URL(colsTitle.attr('href')!, siteUrl).href,
                pubDate: timezone(parseDate($item.find('.cols_meta').text(), 'YYYY-MM-DD', 'zh-cn'), 8),
            };
        });

    const items = await pMap(
        selectItems(list),
        (item) =>
            cache.tryGet(item.link, async () => {
                // Some article bodies are restricted to the university network.
                let description: string;
                try {
                    const { data: response } = await got(item.link);
                    const $ = load(response);
                    description = $('.wp_articlecontent').html() ?? '';
                } catch {
                    description = '';
                }
                return { ...item, description };
            }),
        { concurrency: 3 }
    );

    return {
        title: '东华大学信息公开网-最新公开信息',
        link,
        item: items,
    };
}
