import { load } from 'cheerio';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

async function loadContent(item) {
    const response = await got(item.link);
    const $ = load(response.data);

    const author = $('.article_author span')
        .toArray()
        .map((element) => $(element).text())
        .find((text) => /^供稿[:：]/.test(text));
    item.author = author?.replace(/^供稿[:：]/, '');

    item.description = `${$('.page_article .article').html() ?? ''}${$('.annex').html() ?? ''}`;

    return item;
}

const processFeed = (list, caches) => {
    const host = 'https://cs.bit.edu.cn/tzgg/';

    return Promise.all(
        list.map((item) => {
            const $ = load(item);

            const $title = $('a');
            const itemUrl = new URL($title.attr('href')!, host).href;
            const date = `${$('.year').text()}-${$('.day').text().replace('.', '-')}`;

            const single = {
                title: $title.find('.title').text(),
                link: itemUrl,
                pubDate: timezone(parseDate(date, 'YYYY-MM-DD'), 8),
            };

            return caches.tryGet(single.link, () => loadContent(single));
        })
    );
};

export default { processFeed };
