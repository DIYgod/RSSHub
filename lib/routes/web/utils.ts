import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

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
    const res = await got<string>('https://web.dev/_d/dynamic_content', {
        body: `[null,null,null, "${queryParam}",null,null,null,null,31,null,null,null,2]`,
        method: 'post',
    });
    const data = JSON.parse(res.data.replace(/^[^[]*/, '')) as [ArticleData[], number];
    const items = await Promise.all(
        data[0].map((item) => {
            const link = item[6];
            return cache.tryGet(link, async () => {
                const { data: articleHtml } = await got.get<string>(link);
                const $ = load(articleHtml);
                const articleBody = $('.devsite-article-body');
                articleBody.find('.wd-authors').remove();

                return {
                    title: item[0],
                    pubDate: new Date(item[5][0] * 1e3),
                    description: articleBody.html(),
                    link,
                };
            }) as unknown as DataItem;
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
