import { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

// test url http://localhost:1200/asianfanfics/text-search/milklove

export const route: Route = {
    path: '/text-search/:keyword',
    categories: ['reading'],
    example: '/asianfanfics/text-search/milklove',
    parameters: {
        keyword: '关键词',
    },
    name: '亚洲同人网关键词',
    maintainers: ['KazooTTT'],
    radar: [
        {
            source: ['www.asianfanfics.com/browse/text_search?q=:keyword'],
            target: '/text-search/:keyword',
        },
    ],
    description: `匹配亚洲同人网搜索关键词`,
    handler,
};

async function handler(ctx) {
    const keyword = ctx.req.param('keyword');
    const link = `https://www.asianfanfics.com/browse/text_search?q=${keyword}+`;

    const response = await ofetch(link);
    const $ = load(await response.text());

    const items: DataItem[] = $('.primary-container .excerpt')
        .toArray()
        .filter((element) => {
            const $element = $(element);
            return $element.find('.excerpt__title a').length > 0;
        })
        .map((element) => {
            const $element = $(element);
            const title = $element.find('.excerpt__title a').text();
            const link = 'https://www.asianfanfics.com' + $element.find('.excerpt__title a').attr('href');
            const author = $element.find('.excerpt__meta__name a').text().trim();
            const pubDate = parseDate($element.find('time').attr('datetime') || '');

            return {
                title,
                link,
                author,
                pubDate,
            };
        });

    return {
        title: `Asianfanfics 亚洲同人网 - 关键词：${keyword}`,
        link,
        item: items,
    };
}
