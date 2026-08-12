import { load } from 'cheerio';

import type { Data, DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.cnca.gov.cn';

export const getFeed = async (path: string, description: string): Promise<Data> => {
    const link = `${baseUrl}/${path}/index.html`;
    const response = await ofetch(link);

    const buildUnitScript = load(response)('script[parseType="bulidstatic"]');
    const queryData = JSON.parse(buildUnitScript.attr('querydata')!.replaceAll("'", '"'));
    const data = await ofetch(`${baseUrl}${buildUnitScript.attr('url')}`, {
        query: queryData,
        headers: {
            accept: 'application/json',
        },
    });
    const $ = load(data.data.html);

    const list = $('.common_list_ul li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, baseUrl).href,
                pubDate: timezone(parseDate($item.find('span').text()), 8),
            };
        }) as DataItem[];

    const items = await Promise.all(
        list.map((item) => {
            if (!item.link!.startsWith(`${baseUrl}/`)) {
                return item;
            }
            return cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);
                item.description = $('.detail_messge').html();
                item.author = $('#source').text();
                item.pubDate = timezone(parseDate($('meta[name="PubDate"]').attr('content')!, 'YYYY-MM-DD HH:mm'), 8);

                return item;
            });
        })
    );

    return {
        title: `国家认证认可监督管理委员会 - ${description}`,
        link,
        description,
        item: items as DataItem[],
    };
};
