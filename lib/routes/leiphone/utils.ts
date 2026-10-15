import { load } from 'cheerio';
import pMap from 'p-map';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const ProcessFeed = async (list, cache) => {
    const host = 'https://www.leiphone.com';

    const items = await pMap(
        list,
        async (e: string) => {
            const link = new URL(e, host).href;

            const single = await cache.tryGet(link, async () => {
                const response = await got.get(link);

                const $ = load(response.data);

                const pubDate = $('.time').text();
                let description = '';
                if ($('.top-img').html() !== null) {
                    description += $('.top-img').html();
                }

                return {
                    title: $('.headTit').text(),
                    description: description + $('.article-lead').text() + $('.lph-article-comView').html(),
                    pubDate: pubDate ? timezone(parseDate(pubDate), 8) : undefined,
                    author: $('.aut > a').text(),
                    link,
                };
            });

            return single;
        },
        { concurrency: 3 }
    );

    return items;
};

export default { ProcessFeed };
