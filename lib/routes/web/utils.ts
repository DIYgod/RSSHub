import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const getPublicationDate = (timestamp: number | undefined) => {
    if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) {
        return;
    }
    const date = parseDate(timestamp, 'X');
    return Number.isFinite(date.getTime()) ? date : undefined;
};

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
    const items = await pMap(
        data[0],
        async (item) => {
            const link = item[6];
            const detail = await cache.tryGet<Pick<DataItem, 'description' | 'author'>>(`web:article:v2:${link}`, async () => {
                const { data: articleHtml }: { data: string } = await got.get(link);
                const $ = load(articleHtml);
                const articleBody = $('.devsite-article-body');
                const authors = articleBody
                    .find('.wd-authors .wd-author > div > span')
                    .toArray()
                    .map((element) => $(element).text().trim())
                    .filter(Boolean);
                articleBody.find('.wd-authors').remove();

                return {
                    description: articleBody.html(),
                    author: authors.length ? authors.join(', ') : undefined,
                };
            });
            return { title: item[0], pubDate: getPublicationDate(item[5]?.[0]), description: detail.description, author: detail.author, link };
        },
        { concurrency: 3, stopOnError: false }
    );

    return items;
}

export function hyphen2Pascal(value: string) {
    return value
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}
