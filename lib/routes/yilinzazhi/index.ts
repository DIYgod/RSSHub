import { load } from 'cheerio';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

export const route: Route = {
    path: '/',
    categories: ['reading'],
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

async function fetchDescription(link: string): Promise<Pick<DataItem, 'description'>> {
    const response = await got(link);
    const $ = load(response.data);
    const currentContainer = $('main > .catalog-container');
    const catalogContainer = currentContainer.length ? currentContainer : $('.maglistbox');
    if (!catalogContainer.length) {
        throw new Error(`Issue catalog is unavailable at ${link}`);
    }
    return { description: catalogContainer.html()! };
}

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

    const items = await pMap(
        contents,
        async (content) => {
            try {
                const detail = await cache.tryGet<Pick<DataItem, 'description'>>(`yilinzazhi:issue:${content.link}`, () => fetchDescription(content.link!));
                return { ...content, description: detail.description };
            } catch (error) {
                if (error instanceof FetchError && (error.status === 404 || error.status === 429)) {
                    return content;
                }
                throw error;
            }
        },
        { concurrency: 3, stopOnError: false }
    );
    return {
        title: '意林杂志网',
        link: baseUrl,
        item: items,
    };
}
