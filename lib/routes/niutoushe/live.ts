import type { Route} from '@/types';
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/lives',
    categories: ['new-media', 'popular'],
    example: '/niutoushe/lives',
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
            source: ['niutoushe.com/lives'],
        },
    ],
    name: ' 快讯',
    maintainers: ['defp'],
    handler,
};

async function handler() {
    const baseUrl = 'https://niutoushe.com';
    const url = `${baseUrl}/lives`;

    const response = await got(url);
    const $ = load(response.data);

    const items = $('div.live-info')
        .map((_, item) => {
            const $item = $(item);
            const title = $item.find('a h2').text().trim();
            const link = $item.find('a').attr('href');
            const sourceUrl = link ? new URL(link, baseUrl).href : '';
            const sourceId = sourceUrl.split('/').pop();
            const datetimeStr = $item.find('div.fenxiang span').first().text().trim();
            const pubDate = /小时前/.test(datetimeStr) ? parseRelativeDate(datetimeStr) : parseDate(datetimeStr);
            const author = '牛头社';

            return {
                title,
                link: sourceUrl,
                description: '',
                author,
                pubDate,
                guid: sourceId,
            };
        })
        .toArray();

    // Get detailed content for each item
    const itemsWithContent = await Promise.all(
        items.map(async (item) => {
            const detailResponse = await got(item.link);
            const $detail = load(detailResponse.data);
            const content = $detail('div.live-cc').html() || '';

            return {
                ...item,
                description: content,
            };
        })
    );

    return {
        title: '牛头社 - 快讯',
        link: url,
        description: '牛头社快讯内容',
        language: 'zh-CN' as const,
        item: itemsWithContent,
    };
}
