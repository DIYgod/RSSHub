import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/',
    name: 'Unknown',
    maintainers: ['ruoshui9527'],
    handler,
};

async function handler() {
    const link = 'https://onehu.xyz';
    const response = await got(link);
    const data = response.data;
    const $ = load(data);
    const list = $('#board article')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.index-header').text(),
                link: item.find('.index-header').children('a').attr('href'),
                description: item.find('.index-excerpt.index-excerpt__noimg').children('div').text(),
                pubDate: timezone(parseDate(item.find('.post-meta.mr-3').children('time').attr('datetime'), 'YYYY年MM月DD日 HH:mm'), +8),
            };
        });

    return {
        title: $('title').text(),
        link,
        item: list,
    };
}
