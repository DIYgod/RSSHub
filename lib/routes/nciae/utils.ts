import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const baseUrl = 'https://nciae.edu.cn';

export async function fetchList(path: string, title: string) {
    const url = `${baseUrl}/index/${path}.htm`;
    const response = await ofetch(url);
    const $ = load(response);

    const list = $('#container > ul > li > a')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: new URL($item.attr('href')!, url).href,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const $detail = load(detailResponse);

                item.description = $detail('#content > form').html();

                return item;
            })
        )
    );

    return {
        title: `${title} - 北华航天工业学院`,
        link: url,
        description: `${title} - 北华航天工业学院`,
        item: items,
    };
}
