import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const processItems = (list: Array<DataItem & { link: string }>) =>
    pMap(
        list,
        (item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got.post(item.link);
                const content = load(detailResponse.data);

                const dateText = content('meta[name="PubDate"]').attr('content');
                item.description = content('div.xxy_text').html();
                if (dateText) {
                    item.pubDate = timezone(parseDate(dateText), 8);
                }

                return item;
            }),
        { concurrency: 3 }
    );

export { processItems };
