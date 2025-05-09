import { config } from '@/config';
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
    name: '关键词',
    maintainers: ['KazooTTT'],
    radar: [
        {
            source: ['www.asianfanfics.com/browse/text_search?q=:keyword'],
            target: '/text-search/:keyword',
        },
    ],
    description: '匹配asianfanfics搜索关键词',
    handler,
};

async function handler(ctx) {
    const keyword = ctx.req.param('keyword');
    if (keyword.trim() === '') {
        throw new Error('关键词不能为空');
    }
    const link = `https://www.asianfanfics.com/browse/text_search?q=${keyword}+`;

    const response = await ofetch(link, {
        headers: {
            'user-agent': config.trueUA,
        },
    });
    const $ = load(response);

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
            const description = $element.find('.excerpt__text').html();

            return {
                title,
                link,
                author,
                pubDate,
                description,
            };
        });

    return {
        title: `Asianfanfics - 关键词：${keyword}`,
        link,
        item: items,
    };
}
