// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import * as path from 'node:path';

const ProcessItem = async (item) => {
    const detailResponse = await got(item.link);
    const $ = load(detailResponse.data);
    item.description = art(path.join(__dirname, 'templates/desc.art'), {
        author: $('h3.author > span')
            .map((_, item) => $(item).text())
            .get()
            .join(' '),
        company: $('a.author')
            .map((_, item) => $(item).text())
            .get()
            .join(' '),
        content: $('div.row > span.abstract-text').parent().text(),
    });

    return item;
};

module.exports = {
    ProcessItem,
};
