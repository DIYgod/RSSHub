import { load } from 'cheerio';
import pMap from 'p-map';

import ofetch from '@/utils/ofetch';

import { parseItem } from './news/utils';

export const getFinanceTopic = async (baseUrl: string, topic: string, limit: number) => {
    const link = `${baseUrl}/topic/${topic}/`;
    const response = await ofetch(link);
    const $ = load(response);
    const seen = new Set<string>();
    const items = $('a[data-ylk*="topic-stream"]:has(h3)')
        .toArray()
        .map((element) => ({ title: $(element).find('h3').text(), link: new URL($(element).attr('href')!, link).href }))
        .filter((item) => {
            if (seen.has(item.link)) {
                return false;
            }
            seen.add(item.link);
            return true;
        })
        .slice(0, limit);
    return { title: $('title').text(), link, item: await pMap(items, parseItem, { concurrency: 3 }) };
};
