import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const base_url = 'https://xxgk.dhu.edu.cn/1737/list.htm';

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
    const link = base_url;
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: base_url,
        },
    });

    const $ = load(response.data);
    return {
        link: base_url,
        title: '东华大学信息公开网-最新公开信息',
        item: $('.cols')
            .map((_, elem) => ({
                link: new URL($('a', elem).attr('href'), base_url),
                title: $('a', elem).attr('title'),
                pubDate: timezone(parseDate($('.cols_meta', elem).text()), +8),
            }))
            .get(),
    };
}
