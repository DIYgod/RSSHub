import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

const baseUrl = 'https://nciae.edu.cn';

export async function fetchList(path: string, title: string) {
    const url = `${baseUrl}/index/${path}.htm`;
    const response = await ofetch(url);
    const $ = load(response);

    const list = $('#container > ul > li > a')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            const date = $item
                .prev('span')
                .text()
                .match(/(\d{4})年(\d{2})月(\d{2})日/);
            return {
                title: $item.text(),
                pubDate: date ? parseDateInTimezone(`${date[1]}-${date[2]}-${date[3]}`, 8) : undefined,
                link: new URL($item.attr('href')!, url).href,
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const $detail = load(detailResponse);

                const published = $detail('.contbar')
                    .text()
                    .match(/(\d{4})年(\d{2})月(\d{2})日\s+(\d{2}:\d{2})/);
                if (published) {
                    item.pubDate = parseDateInTimezone(`${published[1]}-${published[2]}-${published[3]} ${published[4]}`, 8);
                }

                item.description = $detail('#vsb_content').html();

                return item;
            }),
        { concurrency: 6 }
    );

    return {
        title: `${title} - 北华航天工业学院`,
        link: url,
        description: `${title} - 北华航天工业学院`,
        item: items,
    };
}
