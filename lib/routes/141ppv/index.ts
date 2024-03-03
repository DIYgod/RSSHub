// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { getSubPath } from '@/utils/common-utils';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const rootUrl = 'https://www.141ppv.com';
    const currentUrl = `${rootUrl}${getSubPath(ctx)}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    if (getSubPath(ctx) === '/') {
        ctx.redirect(`/141ppv${$('.overview').first().attr('href')}`);
        return;
    }

    const items = $('.columns')
        .toArray()
        .map((item) => {
            item = $(item);

            const id = item.find('.title a').text();
            const size = item.find('.title span').text();
            const pubDate = item.find('.subtitle a').attr('href').split('/date/').pop();
            const description = item.find('.has-text-grey-dark').text();
            const actresses = item
                .find('.panel-block')
                .toArray()
                .map((a) => $(a).text().trim());
            const tags = item
                .find('.tag')
                .toArray()
                .map((t) => $(t).text().trim());
            const magnet = item.find('a[title="Magnet torrent"]').attr('href');
            const link = item.find('a[title="Download .torrent"]').attr('href');
            const onErrorAttr = item.find('.image').attr('onerror');
            const backupImageRegex = /this\.src='(.*?)'/;
            const match = backupImageRegex.exec(onErrorAttr);
            const image = match ? match[1] : item.find('.image').attr('src');

            return {
                title: `${id} ${size}`,
                pubDate: parseDate(pubDate, 'YYYY/MM/DD'),
                link: new URL(item.find('a').first().attr('href'), rootUrl).href,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    image,
                    id,
                    size,
                    pubDate,
                    description,
                    actresses,
                    tags,
                    magnet,
                    link,
                }),
                author: actresses.join(', '),
                category: [...tags, ...actresses],
                enclosure_type: 'application/x-bittorrent',
                enclosure_url: magnet,
            };
        });

    ctx.set('data', {
        title: `141PPV - ${$('title').text().split('-')[0].trim()}`,
        link: currentUrl,
        item: items,
    });
};
