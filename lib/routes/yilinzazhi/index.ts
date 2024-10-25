import { Data, DataItem, Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/',
    categories: ['reading', 'popular'],
    view: ViewType.Articles,
    example: '/yilinzazhi',
    radar: [
        {
            source: ['www.yilinzazhi.com'],
            target: '/',
        },
    ],
    name: '文章列表',
    maintainers: ['g0ngjie'],
    handler,
    url: 'www.yilinzazhi.com',
};

async function handler(): Promise<Data> {
    const baseUrl = 'https://www.yilinzazhi.com/';
    const response = await got(baseUrl);
    const $ = load(response.data);
    const contents: DataItem[] = $('section.content')
        .find('li')
        .toArray()
        .map((target) => {
            const li = $(target);

            const aTag = li.find('a');
            const title = aTag.text();
            const link = baseUrl + aTag.attr('href');

            return {
                title,
                link,
                description: '',
            };
        });

    const items = (await Promise.all(
        contents.map((content) =>
            cache.tryGet(content.link!, async () => {
                const childRes = await got(content.link);
                const $$ = load(childRes.data);
                content.description = $$('.maglistbox').html()!;
                return content;
            })
        )
    )) as DataItem[];
    return {
        title: '意林杂志网',
        link: baseUrl,
        item: items,
    };
}
