import { load } from 'cheerio';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

async function loadContent(item) {
    const response = await got(item.link);
    const $ = load(response.data);

    item.description = $('.gp-content').html();

    return item;
}

const processFeed = (list, caches) => {
    const host = 'https://jwb.bit.edu.cn/tzgg/index.htm';

    return Promise.all(
        list.map((item) => {
            const $ = load(item);

            const $title = $('a');
            const itemUrl = new URL($title.attr('href')!, host).href;

            const single = {
                title: $title.find('.title .gp-ellipsis').text(),
                link: itemUrl,
                author: '教务部',
                pubDate: timezone(parseDate($('.date').text(), 'YYYY-MM-DD'), 8),
            };

            return caches.tryGet(single.link, () => loadContent(single));
        })
    );
};

export default { processFeed };
