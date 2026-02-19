import { load } from 'cheerio';

import got from '@/utils/got';

import { renderDescription } from './templates/desc';

const ProcessItem = async (item) => {
    const detailResponse = await got(item.link);
    const $ = load(detailResponse.data);
    item.description = renderDescription({
        author: $('h3.author > span')
            .toArray()
            .map((item) => $(item).text())
            .join(' '),
        company: $('a.author')
            .toArray()
            .map((item) => $(item).text())
            .join(' '),
        content: $('div.row > span.abstract-text').parent().text(),
    });

    return item;
};

export { ProcessItem };
