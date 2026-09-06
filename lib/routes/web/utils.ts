import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

type ArticleData = [
    string,
    string,
    unknown,
    string,
    string,
    number[],
    string,
    string,
    unknown,
    unknown,
    string[],
    string,
    string[],
    string,
    string,
    unknown,
    string[],
    string,
    string,
    number,
    string[],
    unknown,
    number,
    string[],
    number,
    number,
];

export async function fetchItems(queryParam: string): Promise<DataItem[]> {
    const { data: body }: { data: string } = await got('https://web.dev/_d/dynamic_content', {
        body: `[null,null,null, "${queryParam}",null,null,null,null,31,null,null,null,2]`,
        method: 'post',
    });
    const data: [ArticleData[], number] = JSON.parse(body.replace(/^[^[]*/, ''));
    const items = await Promise.all(
        data[0].map((item) => {
            const link = item[6];
            return cache.tryGet(link, async (): Promise<DataItem> => {
                const { data: articleHtml }: { data: string } = await got.get(link);
                const $ = load(articleHtml);
                const articleBody = $('.devsite-article-body');
                articleBody.find('.wd-authors').remove();

                return {
                    title: item[0],
                    pubDate: new Date(item[5][0] * 1e3),
                    description: articleBody.html(),
                    link,
                };
            });
        })
    );

    return items;
}

export function hyphen2Pascal(value: string) {
    return value
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}
